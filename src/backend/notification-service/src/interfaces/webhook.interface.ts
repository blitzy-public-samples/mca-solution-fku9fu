// @package mongoose ^7.3.0

/**
 * Interface definitions for webhook configuration and delivery tracking
 * Addresses requirements:
 * - Integration Layer: REST APIs and webhooks for system integration
 * - Webhook Configuration: Defines webhook endpoint structure and configuration
 * - System Integration: Webhook notifications and status updates
 */

import { Types } from 'mongoose';

/**
 * Interface for webhook configuration including endpoint URL, events, and security settings
 */
export interface IWebhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for webhook delivery tracking including status and retry information
 */
export interface IWebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: object;
  status: string;
  attempts: number;
  statusCode: number;
  error: string;
  lastAttempt: Date;
  nextAttempt: Date;
}

/**
 * Interface for webhook delivery configuration options
 */
export interface IWebhookDeliveryOptions {
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  headers: Record<string, string>;
  signatureHeader: string;
}

/**
 * Enum for supported webhook event types for application processing status
 */
export enum WebhookEventType {
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  DOCUMENT_PROCESSED = 'DOCUMENT_PROCESSED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  PROCESSING_COMPLETE = 'PROCESSING_COMPLETE',
  DATA_EXTRACTION_FAILED = 'DATA_EXTRACTION_FAILED'
}

/**
 * Enum for possible webhook delivery statuses
 */
export enum WebhookDeliveryStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RETRY_SCHEDULED = 'RETRY_SCHEDULED',
  MAX_RETRIES_EXCEEDED = 'MAX_RETRIES_EXCEEDED'
}