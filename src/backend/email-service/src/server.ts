/**
 * Human Tasks:
 * 1. Configure environment variables in .env file (PORT, NODE_ENV)
 * 2. Set up monitoring alerts for server health
 * 3. Configure SSL/TLS certificates for HTTPS in production
 * 4. Set up load balancer health check endpoints
 * 5. Configure process manager (e.g., PM2) for production deployment
 */

// Third-party imports
import dotenv from 'dotenv'; // ^16.0.0
import http from 'http';

// Internal imports
import app from './app';
import { info, error } from './utils/logger';

/**
 * Initialize and start the Express server
 * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
 * @requirement Processing Time - < 5 minutes per application with efficient server initialization
 */
async function startServer(): Promise<void> {
  // Load environment variables
  dotenv.config();

  const port = process.env.PORT || 3000;
  const env = process.env.NODE_ENV || 'development';

  try {
    // Create HTTP server
    const server = http.createServer(app);

    // Start server
    server.listen(port, () => {
      info('Server started successfully', {
        port,
        environment: env,
        timestamp: new Date().toISOString()
      });
    });

    // Set up graceful shutdown handler
    handleShutdown(server);

  } catch (err) {
    error('Failed to start server', {
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
}

/**
 * Handle graceful server shutdown
 * @param server - HTTP server instance
 * @requirement System Availability - 99.9% uptime through robust error handling and graceful shutdown
 */
function handleShutdown(server: http.Server): void {
  // Maximum time to wait for existing connections (in milliseconds)
  const SHUTDOWN_TIMEOUT = 30000;

  const gracefulShutdown = (signal: string) => {
    info('Initiating graceful shutdown', {
      signal,
      timestamp: new Date().toISOString()
    });

    // Stop accepting new connections
    server.close(() => {
      info('HTTP server closed successfully', {
        timestamp: new Date().toISOString()
      });
      process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {
      error('Forced shutdown due to timeout', {
        timeout: SHUTDOWN_TIMEOUT,
        timestamp: new Date().toISOString()
      });
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);
  };

  // Handle termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    error('Uncaught exception', {
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    error('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : 'Unknown reason',
      timestamp: new Date().toISOString()
    });
    gracefulShutdown('unhandledRejection');
  });
}

// Start the server
startServer().catch((err) => {
  error('Fatal error during server startup', {
    error: err instanceof Error ? err.message : 'Unknown error',
    timestamp: new Date().toISOString()
  });
  process.exit(1);
});