/**
 * Human Tasks:
 * 1. Configure environment variables in .env:
 *    - PORT (default: 3003)
 *    - NODE_ENV (development/production)
 * 2. Set up monitoring alerts for process-level errors
 * 3. Configure log aggregation for error tracking
 * 4. Set up health check monitoring
 */

// Load environment variables - ^16.0.0
import { config } from 'dotenv';

// Internal imports
import { NotificationApp } from './app';
import Logger from './utils/logger';

/**
 * Handles uncaught exceptions to prevent application crash
 * Requirement: System Monitoring - Process-level error handling and logging
 */
const handleUncaughtException = (error: Error): void => {
    Logger.error('Uncaught Exception', error, {
        type: 'UNCAUGHT_EXCEPTION',
        timestamp: new Date().toISOString()
    });
    
    // Ensure logs are written before exit
    setTimeout(() => {
        process.exit(1);
    }, 1000);
};

/**
 * Handles unhandled promise rejections
 * Requirement: System Monitoring - Process-level error handling and logging
 */
const handleUnhandledRejection = (error: Error): void => {
    Logger.error('Unhandled Promise Rejection', error, {
        type: 'UNHANDLED_REJECTION',
        timestamp: new Date().toISOString()
    });
    
    // Ensure logs are written before exit
    setTimeout(() => {
        process.exit(1);
    }, 1000);
};

/**
 * Initializes and starts the notification service
 * Requirements:
 * - Integration Layer: REST APIs and webhooks for system integration
 * - Event-Driven Architecture: Message queue integration
 * - System Monitoring: Process-level error handling
 */
const startServer = async (): Promise<void> => {
    try {
        // Load environment configuration
        config();
        
        // Initialize application
        const app = new NotificationApp();
        
        // Start server and queue consumer
        await app.start();
        
        Logger.info('Notification service started successfully', {
            port: process.env.PORT || 3003,
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString()
        });
        
        // Register process-level error handlers
        process.on('uncaughtException', handleUncaughtException);
        process.on('unhandledRejection', handleUnhandledRejection);
        
        // Graceful shutdown handlers
        const shutdown = async (signal: string) => {
            Logger.info(`Received ${signal}, initiating graceful shutdown`, {
                signal,
                timestamp: new Date().toISOString()
            });
            
            try {
                // Allow time for cleanup operations in app.ts
                await app.start().catch(error => {
                    Logger.error('Error during shutdown', error, {
                        signal,
                        timestamp: new Date().toISOString()
                    });
                });
                
                process.exit(0);
            } catch (error) {
                Logger.error('Failed to shutdown gracefully', error as Error, {
                    signal,
                    timestamp: new Date().toISOString()
                });
                process.exit(1);
            }
        };
        
        // Register shutdown handlers
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        
    } catch (error) {
        Logger.error('Failed to start notification service', error as Error, {
            timestamp: new Date().toISOString()
        });
        process.exit(1);
    }
};

// Start the server
startServer();