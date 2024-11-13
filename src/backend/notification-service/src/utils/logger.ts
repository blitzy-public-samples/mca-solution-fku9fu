// Human Tasks:
// 1. Ensure environment variables are set for LOG_LEVEL and LOG_RETENTION_DAYS
// 2. Create log directory with appropriate write permissions
// 3. Configure log rotation backup compression in production
// 4. Set up log aggregation service integration

import winston from 'winston'; // v3.10.0
import DailyRotateFile from 'winston-daily-rotate-file'; // v4.7.1

class Logger {
    private logger: winston.Logger;
    private logLevel: string;
    private serviceName: string;

    private constructor() {
        // Requirement: System Monitoring - Standardized logging formats and severity levels
        this.logLevel = process.env.LOG_LEVEL || 'info';
        this.serviceName = 'notification-service';

        // Configure log format with timestamp and service context
        const logFormat = winston.format.combine(
            winston.format.timestamp({
                format: 'ISO'
            }),
            winston.format.json(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                return JSON.stringify({
                    timestamp,
                    level,
                    service: this.serviceName,
                    message,
                    ...meta
                });
            })
        );

        // Configure transports with console and rotating file
        const transports: winston.transport[] = [
            new winston.transports.Console({
                format: logFormat
            }),
            new DailyRotateFile({
                filename: 'logs/notification-service-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxFiles: process.env.LOG_RETENTION_DAYS || '30d',
                maxSize: '100m',
                format: logFormat,
                zippedArchive: true
            })
        ];

        // Initialize Winston logger with configured transports
        this.logger = winston.createLogger({
            level: this.logLevel,
            transports
        });
    }

    private static instance: Logger;

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    // Requirement: System Monitoring - Log aggregation with standardized formats
    public info(message: string, meta: object = {}): void {
        this.logger.info(message, {
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            ...meta
        });
    }

    // Requirement: System Monitoring - Error reporting with detailed context
    public error(message: string, error: Error, meta: object = {}): void {
        this.logger.error(message, {
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            ...meta
        });
    }

    // Requirement: Webhook Delivery Tracking - Monitoring and tracking webhook delivery attempts
    public webhookDelivery(webhookId: string, status: string, deliveryDetails: object): void {
        this.logger.info('Webhook delivery attempt', {
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            webhookId,
            status,
            correlationId: deliveryDetails['correlationId'],
            attempt: deliveryDetails['attempt'],
            statusCode: deliveryDetails['statusCode'],
            duration: deliveryDetails['duration'],
            retryCount: deliveryDetails['retryCount'],
            ...deliveryDetails
        });
    }
}

export default Logger.getInstance();