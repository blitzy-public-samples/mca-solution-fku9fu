/**
 * Human Tasks:
 * 1. Ensure RabbitMQ server is installed and running
 * 2. Configure environment variables in .env file:
 *    - RABBITMQ_URL
 *    - WEBHOOK_QUEUE
 *    - NOTIFICATION_EXCHANGE
 *    - QUEUE_PREFETCH
 *    - QUEUE_RETRY_LIMIT
 *    - QUEUE_RETRY_DELAY
 * 3. Set up SSL certificates if TLS is enabled
 * 4. Configure firewall rules for RabbitMQ ports
 */

// @ts-ignore
import * as amqplib from 'amqplib'; // ^0.10.0
import * as dotenv from 'dotenv'; // ^16.0.0

// Load environment variables
dotenv.config();

/**
 * Validates queue configuration settings
 * @param config Configuration object to validate
 * @returns boolean indicating if configuration is valid
 */
export const validateQueueConfig = (config: any): boolean => {
    // Validate RABBITMQ_URL format and protocol
    const urlPattern = /^amqp(s)?:\/\/([\w-]+):?([\d]+)?/;
    if (!urlPattern.test(config.url)) {
        return false;
    }

    // Validate queue and exchange names against naming conventions
    const namePattern = /^[a-zA-Z0-9-_]+$/;
    if (!namePattern.test(config.queueName) || !namePattern.test(config.exchangeName)) {
        return false;
    }

    // Validate prefetch count is within acceptable range (1-100)
    if (config.prefetchCount < 1 || config.prefetchCount > 100) {
        return false;
    }

    // Validate retry limit and delay settings
    if (config.retryLimit < 1 || config.retryDelay < 1000) {
        return false;
    }

    return true;
};

/**
 * Configuration class for RabbitMQ message queue settings
 * Implements requirements:
 * - Integration Layer: Message queue configuration for webhook notifications
 * - Event-Driven Architecture: Support for event-driven communication
 * - Notification Service: Configuration for Node.js notification service
 */
export class QueueConfig {
    private url: string;
    private queueName: string;
    private exchangeName: string;
    private prefetchCount: number;
    private retryLimit: number;
    private retryDelay: number;
    private queueOptions: any;
    private exchangeOptions: any;

    constructor() {
        // Initialize queue configuration with environment variables
        this.url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        this.queueName = process.env.WEBHOOK_QUEUE || 'webhook-delivery-queue';
        this.exchangeName = process.env.NOTIFICATION_EXCHANGE || 'notification-exchange';
        this.prefetchCount = parseInt(process.env.QUEUE_PREFETCH || '10');
        this.retryLimit = parseInt(process.env.QUEUE_RETRY_LIMIT || '3');
        this.retryDelay = parseInt(process.env.QUEUE_RETRY_DELAY || '5000');

        // Initialize queue options with durability and dead letter settings
        this.queueOptions = {
            durable: true,
            messageTtl: 86400000, // 24 hours
            deadLetterExchange: `${this.exchangeName}-dead-letter`,
            deadLetterRoutingKey: `${this.queueName}-failed`,
            arguments: {
                'x-max-retries': this.retryLimit
            }
        };

        // Initialize exchange options with type and durability settings
        this.exchangeOptions = {
            type: 'topic',
            durable: true,
            internal: false,
            autoDelete: false,
            arguments: {
                'alternate-exchange': `${this.exchangeName}-unrouted`
            }
        };

        // Validate configuration
        if (!validateQueueConfig(this)) {
            throw new Error('Invalid queue configuration');
        }
    }

    /**
     * Returns queue configuration options including durability and dead letter settings
     * @returns Queue configuration object
     */
    getQueueOptions(): any {
        return {
            ...this.queueOptions,
            arguments: {
                ...this.queueOptions.arguments,
                'x-message-ttl': this.queueOptions.messageTtl,
                'x-dead-letter-exchange': this.queueOptions.deadLetterExchange,
                'x-dead-letter-routing-key': this.queueOptions.deadLetterRoutingKey
            }
        };
    }

    /**
     * Returns exchange configuration options including type and durability settings
     * @returns Exchange configuration object
     */
    getExchangeOptions(): any {
        return {
            ...this.exchangeOptions,
            arguments: {
                ...this.exchangeOptions.arguments,
                'x-delayed-type': 'topic'
            }
        };
    }

    /**
     * Returns RabbitMQ connection options including heartbeat and reconnect settings
     * @returns Connection configuration object
     */
    getConnectionOptions(): any {
        return {
            protocol: 'amqp',
            hostname: new URL(this.url).hostname,
            port: parseInt(new URL(this.url).port || '5672'),
            username: new URL(this.url).username,
            password: new URL(this.url).password,
            vhost: new URL(this.url).pathname.slice(1) || '/',
            heartbeat: 60,
            connectionTimeout: 30000,
            authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL'],
            reconnectTimeInSeconds: 5,
            ssl: this.url.startsWith('amqps'),
            noDelay: true,
            keepAlive: true,
            keepAliveDelay: 60000,
            clientProperties: {
                applicationName: 'mca-notification-service',
                capabilities: {
                    consumer_cancel_notify: true,
                    publisher_confirms: true,
                    exchange_exchange_bindings: true,
                    basic.nack: true,
                    connection.blocked: true
                }
            }
        };
    }
}