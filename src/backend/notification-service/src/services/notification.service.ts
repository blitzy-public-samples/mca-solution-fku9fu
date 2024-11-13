/**
 * Human Tasks:
 * 1. Configure RabbitMQ cluster credentials in environment variables
 * 2. Set up monitoring alerts for notification delivery failures
 * 3. Configure dead letter queue monitoring and alerts
 * 4. Set up metrics collection for notification processing performance
 */

// @package amqplib ^0.10.0
import * as amqplib from 'amqplib';
import { QueueConfig } from '../config/queue.config';
import { WebhookService } from './webhook.service';
import Logger from '../utils/logger';

/**
 * Core service for managing notifications and webhook delivery in the MCA application processing system
 * Implements requirements:
 * - Integration Layer: Implements webhook notifications for system integration with reliable delivery and tracking
 * - Event-Driven Architecture: Supports event-driven communication through asynchronous notifications
 * - Webhook Delivery: Manages webhook delivery and notification tracking with retry mechanisms
 */
export class NotificationService {
    private connection: amqplib.Connection | null = null;
    private channel: amqplib.Channel | null = null;
    private readonly queueConfig: QueueConfig;
    private readonly webhookService: WebhookService;
    private readonly logger: typeof Logger;

    constructor(
        queueConfig: QueueConfig,
        webhookService: WebhookService,
        logger: typeof Logger
    ) {
        this.queueConfig = queueConfig;
        this.webhookService = webhookService;
        this.logger = logger;
    }

    /**
     * Initializes RabbitMQ connection and sets up channels with configured options
     * Implements requirement: Event-Driven Architecture - Setup of message queue infrastructure
     */
    public async initialize(): Promise<void> {
        try {
            // Establish RabbitMQ connection with configured options
            const connectionOptions = this.queueConfig.getConnectionOptions();
            this.connection = await amqplib.connect(connectionOptions);

            // Create channel and configure prefetch
            this.channel = await this.connection.createChannel();
            await this.channel.prefetch(connectionOptions.prefetch || 10);

            // Set up queue with configured options
            const queueOptions = this.queueConfig.getQueueOptions();
            await this.channel.assertQueue(queueOptions.name, {
                durable: true,
                deadLetterExchange: queueOptions.deadLetterExchange,
                deadLetterRoutingKey: queueOptions.deadLetterRoutingKey,
                messageTtl: queueOptions.messageTtl,
                arguments: queueOptions.arguments
            });

            // Set up exchange for notification routing
            await this.channel.assertExchange(queueOptions.exchange, 'topic', {
                durable: true,
                autoDelete: false
            });

            // Bind queue to exchange with routing patterns
            await this.channel.bindQueue(
                queueOptions.name,
                queueOptions.exchange,
                'notification.#'
            );

            // Set up message consumer
            await this.channel.consume(
                queueOptions.name,
                this.processNotification.bind(this),
                { noAck: false }
            );

            this.logger.info('Notification service initialized successfully', {
                queue: queueOptions.name,
                exchange: queueOptions.exchange
            });
        } catch (error) {
            this.logger.error('Failed to initialize notification service', error as Error, {
                connectionOptions: this.queueConfig.getConnectionOptions()
            });
            throw error;
        }
    }

    /**
     * Processes incoming notification messages and triggers webhook delivery
     * Implements requirement: Webhook Delivery - Processing and delivery of notifications
     */
    private async processNotification(message: amqplib.ConsumeMessage | null): Promise<void> {
        if (!message || !this.channel) {
            return;
        }

        const correlationId = message.properties.correlationId || 'unknown';

        try {
            // Parse and validate notification message
            const notification = JSON.parse(message.content.toString());
            if (!this.validateNotification(notification)) {
                throw new Error('Invalid notification format');
            }

            this.logger.info('Processing notification', {
                correlationId,
                type: notification.type,
                webhookId: notification.webhookId
            });

            // Attempt webhook delivery
            const delivery = await this.webhookService.deliverWebhook(
                notification.webhookId,
                notification.type,
                notification.payload
            );

            // Acknowledge successful processing
            await this.channel.ack(message);

            this.logger.info('Notification processed successfully', {
                correlationId,
                deliveryId: delivery.id,
                status: delivery.status
            });
        } catch (error) {
            const err = error as Error;
            
            // Handle delivery failure
            await this.handleDeliveryFailure(
                message,
                correlationId,
                err
            );
        }
    }

    /**
     * Handles failed notification delivery attempts with retry logic
     * Implements requirement: Webhook Delivery - Retry mechanisms and failure handling
     */
    private async handleDeliveryFailure(
        message: amqplib.ConsumeMessage,
        correlationId: string,
        error: Error
    ): Promise<void> {
        if (!this.channel) {
            return;
        }

        const retryCount = (message.properties.headers?.['x-retry-count'] || 0) + 1;
        const maxRetries = this.queueConfig.getQueueOptions().arguments['x-max-retries'];

        this.logger.error('Notification processing failed', error, {
            correlationId,
            retryCount,
            maxRetries
        });

        if (retryCount >= maxRetries) {
            // Max retries exceeded, move to dead letter queue
            await this.channel.reject(message, false);
            
            this.logger.error('Max retries exceeded for notification', error, {
                correlationId,
                retryCount,
                maxRetries
            });
        } else {
            // Schedule retry with exponential backoff
            const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            
            await this.channel.publish(
                message.fields.exchange,
                message.fields.routingKey,
                message.content,
                {
                    ...message.properties,
                    headers: {
                        ...message.properties.headers,
                        'x-retry-count': retryCount,
                        'x-delay': retryDelay
                    }
                }
            );

            // Acknowledge original message
            await this.channel.ack(message);

            this.logger.info('Scheduled notification retry', {
                correlationId,
                retryCount,
                retryDelay,
                nextRetry: new Date(Date.now() + retryDelay)
            });
        }
    }

    /**
     * Validates notification message format and required fields
     */
    private validateNotification(notification: any): boolean {
        return (
            notification &&
            typeof notification.webhookId === 'string' &&
            typeof notification.type === 'string' &&
            notification.payload &&
            typeof notification.payload === 'object'
        );
    }

    /**
     * Gracefully shuts down notification service connections
     */
    public async shutdown(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }

            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }

            this.logger.info('Notification service shut down successfully');
        } catch (error) {
            this.logger.error('Error during notification service shutdown', error as Error);
            throw error;
        }
    }
}