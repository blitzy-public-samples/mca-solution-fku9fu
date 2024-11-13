// Third-party imports with versions
import { Request, Response, NextFunction } from 'express'; // ^4.18.2
import { StatusCodes } from 'http-status-codes'; // ^2.2.0

// Internal imports
import { error as logError } from '../utils/logger';

/**
 * Interface for standardized error response structure sent to clients
 */
export interface IErrorResponse {
  message: string;
  code: string;
  requestId: string;
  stack?: string;
}

/**
 * Interface for application-specific error structure with operational error classification
 */
export interface IAppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
}

/**
 * Express error handling middleware that processes errors and returns standardized responses.
 * Handles both operational errors (e.g., validation errors) and programming errors (e.g., null references)
 * 
 * Requirements addressed:
 * - System Availability (99.9% uptime): Implements robust error handling and monitoring
 * - Monitoring and Observability: Provides detailed error logging with correlation IDs
 */
const errorHandler = (
  err: Error | IAppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Extract correlation ID from request for tracking
  const correlationId = req.headers['x-correlation-id'] as string || 'unknown';

  // Log error with metadata for monitoring and debugging
  logError('Error occurred during request processing', {
    correlationId,
    error: {
      message: err.message,
      stack: err.stack,
      code: (err as IAppError).code || 'INTERNAL_ERROR',
      path: req.path,
      method: req.method,
      isOperational: (err as IAppError).isOperational || false
    }
  });

  // Determine if error is operational or programming error
  const isOperationalError = (err as IAppError).isOperational || false;

  // Extract status code (default to 500 for unspecified)
  const statusCode = (err as IAppError).statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  // Create standardized error response
  const errorResponse: IErrorResponse = {
    message: isOperationalError ? err.message : 'An unexpected error occurred',
    code: (err as IAppError).code || 'INTERNAL_ERROR',
    requestId: correlationId
  };

  // Add stack trace in development environment only
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Set appropriate response headers
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('Content-Type', 'application/json');

  // Send error response with correct status code
  res.status(statusCode).json(errorResponse);
};

export default errorHandler;