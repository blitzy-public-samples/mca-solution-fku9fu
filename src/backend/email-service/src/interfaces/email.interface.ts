/**
 * @fileoverview Email service interfaces and types for MCA application processing
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Ensure IMAP server configuration is set up for submissions@dollarfunding.com
 * 2. Verify email retention policies are configured according to compliance requirements
 * 3. Configure monitoring alerts for email processing failures
 */

/**
 * @interface IEmailMessage
 * @description Defines structure of email messages in the system
 * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
 */
export interface IEmailMessage {
  /** Unique identifier for the email message */
  messageId: string;
  
  /** Email sender address */
  from: string;
  
  /** Email subject line */
  subject: string;
  
  /** Timestamp when email was received */
  receivedDate: Date;
  
  /** Current processing status of the email */
  processingStatus: EmailProcessingStatus;
  
  /** Array of attachments included in the email */
  attachments: IEmailAttachment[];
}

/**
 * @interface IEmailAttachment
 * @description Defines structure of email attachments
 * @requirement Document Management - AI-powered classification and secure storage of application documents
 */
export interface IEmailAttachment {
  /** Original filename of the attachment */
  filename: string;
  
  /** MIME type of the attachment */
  contentType: string;
  
  /** File size in bytes */
  size: number;
  
  /** SHA-256 checksum of the file content */
  checksum: string;
  
  /** Classified type of the attachment */
  type: AttachmentType;
}

/**
 * @interface IEmailMonitoringConfig
 * @description Configuration interface for email monitoring service
 * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
 */
export interface IEmailMonitoringConfig {
  /** IMAP server configuration */
  imap: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    tls: {
      rejectUnauthorized: boolean;
      minVersion: string;
    };
  };
  
  /** Email monitoring settings */
  monitoring: {
    pollingInterval: number;
    maxConcurrentConnections: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  /** Email processing settings */
  processing: {
    maxAttachmentSize: number;
    allowedContentTypes: string[];
    processingTimeout: number;
    maxRetries: number;
  };
}

/**
 * @enum EmailProcessingStatus
 * @description Possible states for email processing
 * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
 */
export enum EmailProcessingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * @enum AttachmentType
 * @description Types of allowed email attachments
 * @requirement Document Management - AI-powered classification and secure storage of application documents
 */
export enum AttachmentType {
  APPLICATION = 'APPLICATION',
  BANK_STATEMENT = 'BANK_STATEMENT',
  IDENTIFICATION = 'IDENTIFICATION',
  BUSINESS_LICENSE = 'BUSINESS_LICENSE'
}