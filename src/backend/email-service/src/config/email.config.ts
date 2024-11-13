/**
 * @fileoverview Email service configuration for MCA application processing
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Configure IMAP server credentials in environment variables
 * 2. Set up allowed sender domains in EMAIL_ALLOWED_SENDERS
 * 3. Configure email processing timeouts based on load testing results
 * 4. Verify SSL/TLS certificates are properly installed for email server
 */

// Third-party imports
import * as dotenv from 'dotenv'; // ^16.0.0
import { ImapOptions } from 'imap'; // ^0.8.19

// Internal imports
import { IEmailMonitoringConfig, AttachmentType } from '../interfaces/email.interface';
import { RABBITMQ_CONFIG } from './queue.config';

// Load environment variables
dotenv.config();

/**
 * @const DEFAULT_POLL_INTERVAL
 * @description Default interval for checking new emails (1 minute)
 * @requirement Processing Time - < 5 minutes per application
 */
export const DEFAULT_POLL_INTERVAL = 60000; // 1 minute in milliseconds

/**
 * @const MAX_ATTACHMENT_SIZE
 * @description Maximum allowed size for email attachments (10MB)
 * @requirement Document Management - AI-powered classification and secure storage
 */
export const MAX_ATTACHMENT_SIZE = 10485760; // 10MB in bytes

/**
 * @const ALLOWED_ATTACHMENT_TYPES
 * @description List of allowed attachment types for processing
 * @requirement Document Management - AI-powered classification and secure storage
 */
export const ALLOWED_ATTACHMENT_TYPES: AttachmentType[] = [
  AttachmentType.APPLICATION,
  AttachmentType.BANK_STATEMENT,
  AttachmentType.IDENTIFICATION,
  AttachmentType.BUSINESS_LICENSE
];

/**
 * @const EMAIL_CONFIG
 * @description Configuration object for email monitoring service
 * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
 */
const EMAIL_CONFIG: IEmailMonitoringConfig = {
  // IMAP server configuration
  imap: {
    host: process.env.EMAIL_HOST || 'imap.dollarfunding.com',
    port: parseInt(process.env.EMAIL_PORT || '993'),
    user: process.env.EMAIL_USER || 'submissions@dollarfunding.com',
    password: process.env.EMAIL_PASSWORD || '',
    secure: true,
    tls: {
      rejectUnauthorized: process.env.EMAIL_TLS === 'true',
      minVersion: 'TLSv1.2'
    }
  },

  // Email monitoring settings
  monitoring: {
    pollingInterval: parseInt(process.env.EMAIL_POLL_INTERVAL || DEFAULT_POLL_INTERVAL.toString()),
    maxConcurrentConnections: 5,
    retryAttempts: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY || '5000'), // 5 seconds
    maxAttachmentSize: parseInt(process.env.EMAIL_MAX_ATTACHMENT_SIZE || MAX_ATTACHMENT_SIZE.toString()),
    allowedSenders: (process.env.EMAIL_ALLOWED_SENDERS || '').split(',').map(sender => sender.trim()),
  },

  // Email processing settings
  processing: {
    maxAttachmentSize: MAX_ATTACHMENT_SIZE,
    allowedContentTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    processingTimeout: parseInt(process.env.EMAIL_PROCESSING_TIMEOUT || '300000'), // 5 minutes
    maxRetries: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3'),
    queueConfig: {
      host: RABBITMQ_CONFIG.host,
      port: RABBITMQ_CONFIG.port,
      retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY || '5000'),
      maxRetries: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3')
    }
  }
};

// Validate required configuration
if (!EMAIL_CONFIG.imap.password) {
  throw new Error('Email password must be configured in environment variables');
}

if (!EMAIL_CONFIG.monitoring.allowedSenders.length) {
  throw new Error('At least one allowed sender domain must be configured');
}

// Export configuration
export const emailConfig: IEmailMonitoringConfig = EMAIL_CONFIG;