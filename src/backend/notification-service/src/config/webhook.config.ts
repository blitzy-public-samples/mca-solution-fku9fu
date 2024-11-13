/**
 * Webhook Configuration Module
 * 
 * Human Tasks:
 * 1. Create .env file with optional overrides for:
 *    - WEBHOOK_TIMEOUT_MS (default: 5000)
 *    - WEBHOOK_MAX_RETRIES (default: 3)
 *    - WEBHOOK_RETRY_DELAY_MS (default: 60000)
 * 
 * Addresses requirements:
 * - Integration Layer: REST APIs and webhooks for system integration
 * - Webhook Configuration: Defines webhook endpoint structure and configuration
 */

// @package dotenv ^16.0.0
import * as dotenv from 'dotenv';
import { IWebhookDeliveryOptions } from '../interfaces/webhook.interface';

// Load environment variables
dotenv.config();

// Global configuration constants
const WEBHOOK_TIMEOUT_MS = parseInt(process.env.WEBHOOK_TIMEOUT_MS || '5000');
const MAX_RETRIES = parseInt(process.env.WEBHOOK_MAX_RETRIES || '3');
const RETRY_DELAY_MS = parseInt(process.env.WEBHOOK_RETRY_DELAY_MS || '60000');
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'DollarFunding-Webhook/1.0'
};

/**
 * Validates webhook configuration settings against defined constraints
 * @param config - Webhook delivery configuration to validate
 * @returns boolean indicating if configuration is valid
 */
export function validateWebhookConfig(config: IWebhookDeliveryOptions): boolean {
  // Validate timeout (1s - 30s)
  if (config.timeout < 1000 || config.timeout > 30000) {
    return false;
  }

  // Validate max retries (0-10 attempts)
  if (config.maxRetries < 0 || config.maxRetries > 10) {
    return false;
  }

  // Validate retry delay (1s - 1h)
  if (config.retryDelay < 1000 || config.retryDelay > 3600000) {
    return false;
  }

  // Validate required Content-Type header
  if (!config.headers['Content-Type']) {
    return false;
  }

  return true;
}

/**
 * Configuration class for webhook delivery settings with exponential backoff retry mechanism
 */
export class WebhookConfig {
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;
  private headers: Record<string, string>;

  constructor() {
    // Initialize configuration with environment variables or defaults
    this.timeout = WEBHOOK_TIMEOUT_MS;
    this.maxRetries = MAX_RETRIES;
    this.retryDelay = RETRY_DELAY_MS;
    this.headers = { ...DEFAULT_HEADERS };
  }

  /**
   * Returns webhook delivery configuration options
   * @returns IWebhookDeliveryOptions configuration object
   */
  public getDeliveryOptions(): IWebhookDeliveryOptions {
    return {
      timeout: this.timeout,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      headers: { ...this.headers },
      signatureHeader: 'X-Webhook-Signature' // Required by IWebhookDeliveryOptions interface
    };
  }

  /**
   * Calculates next retry timestamp using exponential backoff with jitter
   * @param attemptCount - Current attempt number
   * @returns Date object representing next retry timestamp
   */
  public calculateNextRetry(attemptCount: number): Date {
    // Calculate base delay with exponential backoff: retryDelay * (2 ^ attemptCount)
    const baseDelay = this.retryDelay * Math.pow(2, attemptCount);
    
    // Add random jitter between 0-1000ms to prevent thundering herd
    const jitter = Math.floor(Math.random() * 1000);
    
    // Calculate total delay
    const totalDelay = baseDelay + jitter;
    
    // Create and return new timestamp
    return new Date(Date.now() + totalDelay);
  }
}