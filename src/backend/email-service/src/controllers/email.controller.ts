/**
 * @fileoverview Express controller handling email-related HTTP endpoints for MCA application processing
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Configure monitoring alerts for email processing failures
 * 2. Set up error notification thresholds for failed processing attempts
 * 3. Review and adjust rate limiting settings if needed
 */

// Third-party imports
import { Request, Response, NextFunction } from 'express'; // ^4.18.2
import { StatusCodes } from 'http-status-codes'; // ^2.2.0

// Internal imports
import { EmailService } from '../services/email.service';
import { IEmailMessage } from '../interfaces/email.interface';
import { validateEmailMessage, validateAttachments } from '../middlewares/validation.middleware';
import errorHandler from '../middlewares/error.middleware';

/**
 * @class EmailController
 * @description Controller handling email-related HTTP endpoints with validation and error handling
 * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
 */
export class EmailController {
  private emailService: EmailService;
  private router: express.Router;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
    this.router = express.Router();
    this.initializeRoutes();
  }

  /**
   * @method initializeRoutes
   * @description Sets up all routes for the email controller with validation and error handling
   * @requirement Email Processing - Automated monitoring and processing
   */
  private initializeRoutes(): void {
    // POST /emails - Process new email
    this.router.post(
      '/emails',
      validateEmailMessage,
      validateAttachments,
      this.processEmail.bind(this)
    );

    // GET /emails/:messageId - Get email status
    this.router.get(
      '/emails/:messageId',
      this.getEmailStatus.bind(this)
    );

    // PUT /monitoring/start - Start email monitoring
    this.router.put(
      '/monitoring/start',
      this.startMonitoring.bind(this)
    );

    // PUT /monitoring/stop - Stop email monitoring
    this.router.put(
      '/monitoring/stop',
      this.stopMonitoring.bind(this)
    );

    // Add error handler as the last middleware
    this.router.use(errorHandler);
  }

  /**
   * @method processEmail
   * @description Handles email processing requests after validation
   * @requirement Processing Time - < 5 minutes per application
   */
  private async processEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const emailMessage: IEmailMessage = req.body;

      // Add correlation ID for tracking
      const correlationId = req.headers['x-correlation-id'] || 
        `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      res.setHeader('X-Correlation-ID', correlationId);

      // Process email with service
      await this.emailService.processEmail(emailMessage);

      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        message: 'Email processing initiated',
        data: {
          messageId: emailMessage.messageId,
          correlationId,
          status: 'PROCESSING'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method getEmailStatus
   * @description Retrieves status of a processed email by messageId
   * @requirement Automation Rate - 93% of applications processed without human intervention
   */
  private async getEmailStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Message ID is required'
        });
      }

      const emailStatus = await this.emailService.getEmailStatus(messageId);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: emailStatus
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method startMonitoring
   * @description Starts email inbox monitoring process
   * @requirement Email Processing - Automated monitoring and processing
   */
  private async startMonitoring(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await this.emailService.startMonitoring();

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Email monitoring started successfully',
        data: {
          status: 'ACTIVE',
          startedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @method stopMonitoring
   * @description Stops email inbox monitoring process
   * @requirement Email Processing - Automated monitoring and processing
   */
  private async stopMonitoring(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      await this.emailService.stopMonitoring();

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Email monitoring stopped successfully',
        data: {
          status: 'INACTIVE',
          stoppedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @getter router
   * @description Exposes the configured Express router for use in the application
   */
  public get Router(): express.Router {
    return this.router;
  }
}