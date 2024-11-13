// Human Tasks:
// 1. Ensure logs directory exists and is writable
// 2. Set appropriate LOG_LEVEL in environment variables for each environment
// 3. Configure log rotation retention policy based on storage capacity
// 4. Set up log aggregation service integration (e.g., CloudWatch, Datadog)
// 5. Configure alerts for error-level logs

// Third-party imports with versions
import winston from 'winston'; // ^3.8.2
import DailyRotateFile from 'winston-daily-rotate-file'; // ^4.7.1

// Global constants
const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const SERVICE_NAME = 'email-service';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';

// Configuration constants
const LOG_FORMAT = '{{timestamp}} [{{level}}] {{correlationId}} {{service}} {{version}} {{message}} {{metadata}}';
const DEFAULT_LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE_PATH = 'logs/email-service-%DATE%.log';
const MAX_LOG_FILES = '14d';

/**
 * Formats log messages with consistent structure and metadata
 * Requirement: Monitoring and Observability - Implements structured logging for metrics collection
 */
const formatMessage = (message: string, metadata: Record<string, any> = {}): Record<string, any> => {
  const timestamp = new Date().toISOString();
  const correlationId = metadata.correlationId || 'no-correlation-id';
  
  // Remove sensitive information
  const sanitizedMetadata = { ...metadata };
  delete sanitizedMetadata.password;
  delete sanitizedMetadata.token;
  delete sanitizedMetadata.apiKey;
  
  return {
    timestamp,
    correlationId,
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    environment: process.env.NODE_ENV || 'development',
    message,
    metadata: sanitizedMetadata
  };
};

/**
 * Creates and configures Winston logger instance
 * Requirements:
 * - System Availability - Supports 99.9% uptime through detailed logging
 * - Processing Time - Enables tracking of email processing times
 */
const createLogger = (): winston.Logger => {
  // Configure console transport with colors for development
  const consoleTransport = new winston.transports.Console({
    level: DEFAULT_LOG_LEVEL,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}] ${message} ${JSON.stringify(meta)}`;
      })
    )
  });

  // Configure file transport with rotation for production logs
  const fileTransport = new DailyRotateFile({
    level: DEFAULT_LOG_LEVEL,
    filename: LOG_FILE_PATH,
    datePattern: 'YYYY-MM-DD',
    maxFiles: MAX_LOG_FILES,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    auditFile: 'logs/audit.json',
    zippedArchive: true,
    handleExceptions: true
  });

  // Handle transport errors
  fileTransport.on('error', (error) => {
    console.error('Error writing to log file:', error);
  });

  // Create Winston logger instance with custom levels
  const logger = winston.createLogger({
    levels: LOG_LEVELS,
    level: DEFAULT_LOG_LEVEL,
    transports: [consoleTransport, fileTransport],
    exitOnError: false
  });

  return logger;
};

// Create singleton logger instance
const logger = createLogger();

// Export logger with standardized logging methods
export const error = (message: string, metadata?: Record<string, any>) => 
  logger.error(formatMessage(message, metadata));

export const warn = (message: string, metadata?: Record<string, any>) => 
  logger.warn(formatMessage(message, metadata));

export const info = (message: string, metadata?: Record<string, any>) => 
  logger.info(formatMessage(message, metadata));

export const debug = (message: string, metadata?: Record<string, any>) => 
  logger.debug(formatMessage(message, metadata));