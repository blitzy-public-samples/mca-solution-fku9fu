/**
 * @fileoverview Email monitoring and processing service for MCA applications
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Verify IMAP server SSL certificates are properly configured
 * 2. Set up monitoring alerts for email processing failures
 * 3. Configure error notification thresholds
 * 4. Set up disk space monitoring for attachment storage
 */

// Third-party imports
import * as IMAP from 'imap'; // ^0.8.19
import * as amqplib from 'amqplib'; // ^0.10.0
import { simpleParser } from 'mailparser'; // ^3.5.0
import { createHash } from 'crypto';

// Internal imports
import { emailConfig } from '../config/email.config';
import { 
  IEmailMessage, 
  IEmailAttachment,
  EmailProcessingStatus,
  AttachmentType 
} from '../interfaces/email.interface';
import { EmailModel } from '../models/email.model';
import { QUEUE_NAMES, createQueueConnection, createChannel } from '../config/queue.config';

/**
 * @class EmailService
 * @description Service responsible for monitoring and processing MCA application emails
 * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
 */
export class EmailService {
  private imapConnection: IMAP;
  private queueChannel: amqplib.Channel | null = null;
  private isMonitoring: boolean = false;
  private queueConnection: amqplib.Connection | null = null;

  constructor() {
    // Initialize IMAP connection
    this.imapConnection = new IMAP(emailConfig.imap);

    // Set up IMAP error handlers
    this.imapConnection.on('error', (err: Error) => {
      console.error('IMAP connection error:', err);
      this.handleConnectionError(err);
    });

    this.imapConnection.on('end', () => {
      console.warn('IMAP connection ended');
      if (this.isMonitoring) {
        this.reconnectIMAP();
      }
    });
  }

  /**
   * @method startMonitoring
   * @description Starts monitoring the configured email inbox for new applications
   * @requirement Email Processing - Automated monitoring and processing
   */
  public async startMonitoring(): Promise<void> {
    try {
      if (this.isMonitoring) {
        throw new Error('Email monitoring is already active');
      }

      // Initialize queue connection
      this.queueConnection = await createQueueConnection();
      this.queueChannel = await createChannel(this.queueConnection);

      // Connect to IMAP server
      await new Promise<void>((resolve, reject) => {
        this.imapConnection.connect();
        this.imapConnection.once('ready', () => {
          this.isMonitoring = true;
          resolve();
        });
        this.imapConnection.once('error', reject);
      });

      // Open INBOX in read-write mode
      await new Promise<void>((resolve, reject) => {
        this.imapConnection.openBox('INBOX', false, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Set up message event listeners
      this.imapConnection.on('mail', () => this.checkNewEmails());

      console.log(`Email monitoring started with ${emailConfig.monitoring.pollingInterval}ms poll interval`);

      // Set up periodic inbox check
      setInterval(() => this.checkNewEmails(), emailConfig.monitoring.pollingInterval);
    } catch (error) {
      console.error('Failed to start email monitoring:', error);
      throw error;
    }
  }

  /**
   * @method stopMonitoring
   * @description Stops email monitoring and closes connections
   */
  public async stopMonitoring(): Promise<void> {
    try {
      this.isMonitoring = false;

      // Close IMAP connection
      if (this.imapConnection) {
        this.imapConnection.end();
      }

      // Close queue connections
      if (this.queueChannel) {
        await this.queueChannel.close();
        this.queueChannel = null;
      }
      if (this.queueConnection) {
        await this.queueConnection.close();
        this.queueConnection = null;
      }

      console.log('Email monitoring stopped');
    } catch (error) {
      console.error('Error stopping email monitoring:', error);
      throw error;
    }
  }

  /**
   * @method processEmail
   * @description Processes a single email message and its attachments
   * @requirement Processing Time - < 5 minutes per application
   */
  private async processEmail(message: IEmailMessage): Promise<void> {
    try {
      // Validate sender
      if (!emailConfig.monitoring.allowedSenders.some(domain => message.from.includes(domain))) {
        console.warn(`Rejected email from unauthorized sender: ${message.from}`);
        return;
      }

      // Save email to database
      const emailDoc = new EmailModel(message);
      await emailDoc.save();

      // Queue message for processing
      if (!this.queueChannel) {
        throw new Error('Queue channel not initialized');
      }

      await this.queueChannel.sendToQueue(
        QUEUE_NAMES.emailProcessing,
        Buffer.from(JSON.stringify({
          messageId: message.messageId,
          attachments: message.attachments
        })),
        {
          persistent: true,
          messageId: message.messageId,
          timestamp: Date.now(),
          expiration: emailConfig.processing.processingTimeout.toString()
        }
      );

      // Update processing status
      await EmailModel.findOneAndUpdate(
        { messageId: message.messageId },
        { processingStatus: EmailProcessingStatus.PROCESSING }
      );

    } catch (error) {
      console.error(`Error processing email ${message.messageId}:`, error);
      await EmailModel.findOneAndUpdate(
        { messageId: message.messageId },
        { processingStatus: EmailProcessingStatus.FAILED }
      );
      throw error;
    }
  }

  /**
   * @method handleNewEmail
   * @description Handles incoming email event from IMAP connection
   * @requirement Document Management - AI-powered classification and secure storage
   */
  private async handleNewEmail(imapMessage: IMAP.Message): Promise<void> {
    const stream = imapMessage.body;
    const parsed = await simpleParser(stream);

    const message: IEmailMessage = {
      messageId: parsed.messageId || `${Date.now()}-${Math.random()}`,
      from: parsed.from?.text || '',
      subject: parsed.subject || '',
      receivedDate: parsed.date || new Date(),
      processingStatus: EmailProcessingStatus.PENDING,
      attachments: []
    };

    // Process attachments
    if (parsed.attachments) {
      for (const attachment of parsed.attachments) {
        if (attachment.size > emailConfig.processing.maxAttachmentSize) {
          console.warn(`Skipping oversized attachment: ${attachment.filename}`);
          continue;
        }

        if (!emailConfig.processing.allowedContentTypes.includes(attachment.contentType)) {
          console.warn(`Skipping unsupported attachment type: ${attachment.contentType}`);
          continue;
        }

        const checksum = createHash('sha256')
          .update(attachment.content)
          .digest('hex');

        message.attachments.push({
          filename: attachment.filename || 'unnamed',
          contentType: attachment.contentType,
          size: attachment.size,
          checksum,
          type: AttachmentType.APPLICATION // Default type, will be classified by AI later
        });
      }
    }

    await this.processEmail(message);
  }

  /**
   * @method checkNewEmails
   * @description Checks for new emails in the INBOX
   * @private
   */
  private async checkNewEmails(): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.imapConnection.search(['UNSEEN'], async (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (!results.length) {
            resolve();
            return;
          }

          const fetch = this.imapConnection.fetch(results, {
            bodies: '',
            markSeen: true
          });

          fetch.on('message', (msg) => {
            this.handleNewEmail(msg).catch(console.error);
          });

          fetch.once('error', reject);
          fetch.once('end', resolve);
        });
      });
    } catch (error) {
      console.error('Error checking new emails:', error);
    }
  }

  /**
   * @method handleConnectionError
   * @description Handles IMAP connection errors
   * @private
   */
  private async handleConnectionError(error: Error): Promise<void> {
    console.error('IMAP connection error:', error);
    if (this.isMonitoring) {
      await this.reconnectIMAP();
    }
  }

  /**
   * @method reconnectIMAP
   * @description Attempts to reconnect to IMAP server
   * @private
   */
  private async reconnectIMAP(): Promise<void> {
    let retryCount = 0;
    const maxRetries = emailConfig.monitoring.retryAttempts;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempting IMAP reconnection (${retryCount + 1}/${maxRetries})`);
        this.imapConnection.connect();
        return;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          console.error('Failed to reconnect to IMAP server after maximum attempts');
          this.isMonitoring = false;
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, emailConfig.monitoring.retryDelay));
      }
    }
  }
}