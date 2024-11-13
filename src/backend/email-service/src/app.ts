/**
 * @fileoverview Main application entry point for the email service
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Configure environment variables in .env file
 * 2. Set up monitoring alerts for application uptime
 * 3. Configure rate limiting thresholds based on load testing
 * 4. Set up SSL/TLS certificates for HTTPS
 * 5. Configure APM monitoring tools
 */

// Third-party imports
import express from 'express'; // ^4.18.2
import cors from 'cors'; // ^2.8.5
import helmet from 'helmet'; // ^6.0.0
import morgan from 'morgan'; // ^1.10.0
import 'dotenv/config'; // ^16.0.0
import compression from 'compression'; // ^1.7.4
import rateLimit from 'express-rate-limit'; // ^6.7.0
import { v4 as uuidv4 } from 'uuid'; // ^9.0.0

// Internal imports
import { EmailController } from './controllers/email.controller';
import { EmailService } from './services/email.service';
import { emailConfig } from './config/email.config';

// Initialize Express application
const app = express();

/**
 * @function initializeMiddleware
 * @description Sets up Express middleware stack with security and monitoring capabilities
 * @requirement Security - Implement security best practices for REST APIs
 */
function initializeMiddleware(app: express.Application): void {
  // Enable CORS with secure configuration
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));

  // Add security headers with Helmet
  app.use(helmet());
  app.use(helmet.noSniff());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.xssFilter());

  // Enable request compression
  app.use(compression());

  // Parse JSON requests with size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Add request logging in combined format
  app.use(morgan('combined'));

  // Add request ID middleware for tracing
  app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
    next();
  });

  // Configure rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
  });
  app.use('/api/', limiter);
}

/**
 * @function initializeRoutes
 * @description Sets up API routes and controllers with versioning
 * @requirement Email Processing - Automated monitoring and processing
 */
function initializeRoutes(app: express.Application, emailController: EmailController): void {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });

  // API routes with versioning
  app.use('/api/v1', emailController.Router);

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource does not exist'
    });
  });

  // Global error handler
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 
        'An unexpected error occurred' : 
        err.message
    });
  });
}

/**
 * @function startServer
 * @description Initializes and starts the Express server with graceful shutdown
 * @requirement System Availability - 99.9% uptime
 */
async function startServer(app: express.Application): Promise<void> {
  const port = process.env.PORT || 3000;
  const emailService = new EmailService();
  const emailController = new EmailController(emailService);

  // Initialize middleware and routes
  initializeMiddleware(app);
  initializeRoutes(app, emailController);

  // Start the server
  const server = app.listen(port, () => {
    console.log(`Email service started on port ${port} in ${process.env.NODE_ENV} mode`);
    console.log(`Email monitoring interval: ${emailConfig.monitoring.pollingInterval}ms`);
  });

  // Start email monitoring
  await emailService.startMonitoring();

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      console.log('HTTP server closed');
      
      try {
        // Stop email monitoring
        await emailService.stopMonitoring();
        console.log('Email monitoring stopped');

        // Exit process
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after timeout
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000); // 30 seconds timeout
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Start the application
startServer(app).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Export app for testing
export { app };