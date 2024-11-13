/**
 * Human Tasks:
 * 1. Configure environment variables in .env:
 *    - PORT (default: 3003)
 *    - NODE_ENV (default: development)
 * 2. Ensure RabbitMQ server is accessible
 * 3. Configure API Gateway rate limits for webhook endpoints
 * 4. Set up monitoring alerts for webhook delivery failures
 */

// Express framework and middleware - ^4.18.2
import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors'; // ^2.8.5
import helmet from 'helmet'; // ^6.0.0
import morgan from 'morgan'; // ^1.10.0

// Internal imports
import { QueueConfig } from './config/queue.config';
import { WebhookConfig } from './config/webhook.config';
import { WebhookController } from './controllers/webhook.controller';

/**
 * Main application class for the notification service
 * Implements requirements:
 * - Integration Layer: REST APIs and webhooks for system integration
 * - Event-Driven Architecture: Message queue integration for better fault tolerance
 * - Notification Service: Node.js-based service with horizontal scaling
 */
export class NotificationApp {
    private app: Application;
    private queueConfig: QueueConfig;
    private webhookConfig: WebhookConfig;
    private webhookController: WebhookController;

    constructor() {
        // Initialize Express application
        this.app = express();
        
        // Initialize configurations
        this.queueConfig = new QueueConfig();
        this.webhookConfig = new WebhookConfig();
        this.webhookController = new WebhookController();

        // Set up application middleware and routes
        this.setupMiddleware(this.app);
        this.setupRoutes(this.app, this.webhookController);
    }

    /**
     * Configure Express middleware stack
     * @param app Express application instance
     */
    private setupMiddleware(app: Application): void {
        // Security middleware
        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    connectSrc: ["'self'"],
                    fontSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'none'"],
                    frameSrc: ["'none'"]
                }
            },
            xssFilter: true,
            noSniff: true,
            hidePoweredBy: true
        }));

        // CORS configuration
        app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
            methods: ['GET', 'POST', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['X-Total-Count'],
            credentials: true,
            maxAge: 86400 // 24 hours
        }));

        // Request logging
        app.use(morgan('combined'));

        // Request parsing
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Error handling middleware
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error('Unhandled error:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        });
    }

    /**
     * Configure API routes for webhook management
     * @param app Express application instance
     * @param webhookController Webhook controller instance
     */
    private setupRoutes(app: Application, webhookController: WebhookController): void {
        // Webhook management endpoints
        app.post('/webhooks', (req: Request, res: Response) => 
            webhookController.createWebhook(req, res));
        
        app.get('/webhooks/:id', (req: Request, res: Response) => 
            webhookController.getWebhook(req, res));
        
        app.delete('/webhooks/:id', (req: Request, res: Response) => 
            webhookController.deactivateWebhook(req, res));

        // Health check endpoint
        app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
        });

        // 404 handler for undefined routes
        app.use((req: Request, res: Response) => {
            res.status(404).json({ error: 'Not found' });
        });
    }

    /**
     * Initialize RabbitMQ connection and set up message consumer
     */
    private async setupQueueConsumer(): Promise<void> {
        try {
            const connection = await require('amqplib').connect(
                this.queueConfig.getConnectionOptions()
            );

            const channel = await connection.createChannel();
            
            // Configure channel settings
            await channel.prefetch(10); // Process 10 messages at a time

            // Assert queue with configured options
            const queueOptions = this.queueConfig.getQueueOptions();
            await channel.assertQueue(process.env.WEBHOOK_QUEUE || 'webhook-delivery', queueOptions);

            // Set up message consumer with retry logic
            channel.consume(process.env.WEBHOOK_QUEUE || 'webhook-delivery', async (msg) => {
                if (!msg) return;

                try {
                    const webhookData = JSON.parse(msg.content.toString());
                    const deliveryOptions = this.webhookConfig.getDeliveryOptions();

                    // Process webhook delivery (implementation in webhook service)
                    // await this.webhookService.deliverWebhook(webhookData, deliveryOptions);
                    
                    channel.ack(msg);
                } catch (error) {
                    // Handle failed delivery with retry logic
                    const retryCount = (msg.properties.headers['x-retry-count'] || 0) + 1;
                    
                    if (retryCount <= queueOptions.arguments['x-max-retries']) {
                        // Requeue with incremented retry count
                        channel.nack(msg, false, false);
                        await channel.publish('', msg.fields.routingKey, msg.content, {
                            headers: { 'x-retry-count': retryCount }
                        });
                    } else {
                        // Move to dead letter queue after max retries
                        channel.nack(msg, false, false);
                    }
                }
            });

            // Handle connection errors
            connection.on('error', (error: Error) => {
                console.error('RabbitMQ connection error:', error);
                setTimeout(() => this.setupQueueConsumer(), 5000); // Retry after 5 seconds
            });

            console.log('RabbitMQ consumer setup completed');
        } catch (error) {
            console.error('Failed to setup RabbitMQ consumer:', error);
            throw error;
        }
    }

    /**
     * Start the notification service
     */
    public async start(): Promise<void> {
        try {
            // Start HTTP server
            const port = process.env.PORT || 3003;
            this.app.listen(port, () => {
                console.log(`Notification service listening on port ${port}`);
            });

            // Initialize message queue consumer
            await this.setupQueueConsumer();

            // Set up graceful shutdown
            process.on('SIGTERM', this.shutdown.bind(this));
            process.on('SIGINT', this.shutdown.bind(this));
        } catch (error) {
            console.error('Failed to start notification service:', error);
            process.exit(1);
        }
    }

    /**
     * Graceful shutdown handler
     */
    private async shutdown(): Promise<void> {
        console.log('Shutting down notification service...');
        
        // Close HTTP server (implementation needed)
        // await this.server.close();
        
        // Close RabbitMQ connection (implementation needed)
        // await this.connection.close();
        
        process.exit(0);
    }
}