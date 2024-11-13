/**
 * Human Tasks:
 * 1. Configure monitoring alerts for webhook delivery failures
 * 2. Set up rate limiting for webhook endpoints
 * 3. Configure SSL certificates for secure webhook delivery
 * 4. Set up metrics collection for webhook delivery performance
 */

// @package axios ^1.4.0
// @package mongoose ^7.3.0
import axios, { AxiosError } from 'axios';
import { Types } from 'mongoose';
import { WebhookConfig } from '../config/webhook.config';
import {
  IWebhook,
  IWebhookDelivery,
  WebhookEventType,
  WebhookDeliveryStatus
} from '../interfaces/webhook.interface';
import { Webhook, WebhookDelivery } from '../models/webhook.model';
import Logger from '../utils/logger';
import validator from 'validator';

/**
 * Service class handling webhook configuration management and delivery with exponential backoff retry mechanism
 * Addresses requirements:
 * - Integration Layer: REST APIs and webhooks for system integration
 * - Webhook Configuration: Defines webhook endpoint structure and configuration
 */
export class WebhookService {
  private config: WebhookConfig;
  private logger: typeof Logger;

  constructor(config: WebhookConfig, logger: typeof Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Creates a new webhook configuration with validation
   */
  public async createWebhook(webhookData: IWebhook): Promise<IWebhook> {
    // Validate webhook URL format
    if (!validator.isURL(webhookData.url, { protocols: ['https'], require_protocol: true })) {
      throw new Error('Invalid webhook URL. Must be a valid HTTPS URL');
    }

    // Validate webhook events
    const validEvents = Object.values(WebhookEventType);
    const hasInvalidEvents = webhookData.events.some(event => !validEvents.includes(event as WebhookEventType));
    if (hasInvalidEvents) {
      throw new Error('Invalid webhook event types specified');
    }

    // Create webhook document
    const webhook = new Webhook({
      ...webhookData,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save and log webhook creation
    const savedWebhook = await webhook.save();
    this.logger.info('Webhook configuration created', {
      webhookId: savedWebhook.id,
      url: savedWebhook.url,
      events: savedWebhook.events
    });

    return savedWebhook;
  }

  /**
   * Delivers webhook notification to configured endpoint with retry mechanism
   */
  public async deliverWebhook(
    webhookId: string,
    event: WebhookEventType,
    payload: object
  ): Promise<IWebhookDelivery> {
    // Get webhook configuration
    const webhook = await Webhook.findActiveByEvent(event);
    if (!webhook || webhook.length === 0) {
      throw new Error(`No active webhook found for event: ${event}`);
    }

    // Get delivery options
    const deliveryOptions = this.config.getDeliveryOptions();

    // Create delivery tracking record
    const delivery = new WebhookDelivery({
      webhookId: new Types.ObjectId(webhookId),
      event,
      payload,
      status: WebhookDeliveryStatus.PENDING,
      attempts: 0
    });
    await delivery.save();

    try {
      // Attempt webhook delivery
      const startTime = Date.now();
      const response = await axios.post(webhook[0].url, payload, {
        headers: {
          ...deliveryOptions.headers,
          [deliveryOptions.signatureHeader]: this.generateSignature(payload, webhook[0].secret)
        },
        timeout: deliveryOptions.timeout
      });

      // Update delivery status on success
      const duration = Date.now() - startTime;
      await WebhookDelivery.updateDeliveryStatus(
        delivery._id,
        WebhookDeliveryStatus.SUCCESS,
        response.status
      );

      this.logger.webhookDelivery(webhookId, WebhookDeliveryStatus.SUCCESS, {
        deliveryId: delivery.id,
        duration,
        statusCode: response.status,
        attempt: 1
      });

      return delivery;
    } catch (error) {
      // Handle delivery failure
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 0;
      const nextRetry = this.config.calculateNextRetry(0);

      await WebhookDelivery.updateDeliveryStatus(
        delivery._id,
        WebhookDeliveryStatus.RETRY_SCHEDULED,
        statusCode,
        axiosError.message,
        nextRetry
      );

      this.logger.webhookDelivery(webhookId, WebhookDeliveryStatus.RETRY_SCHEDULED, {
        deliveryId: delivery.id,
        error: axiosError.message,
        statusCode,
        attempt: 1,
        nextRetry
      });

      return delivery;
    }
  }

  /**
   * Processes failed webhook deliveries using exponential backoff strategy
   */
  public async retryFailedDeliveries(): Promise<void> {
    const pendingDeliveries = await WebhookDelivery.findPendingDeliveries();

    for (const delivery of pendingDeliveries) {
      const webhook = await Webhook.findById(delivery.webhookId);
      if (!webhook || !webhook.active) continue;

      const deliveryOptions = this.config.getDeliveryOptions();

      try {
        const startTime = Date.now();
        const response = await axios.post(webhook.url, delivery.payload, {
          headers: {
            ...deliveryOptions.headers,
            [deliveryOptions.signatureHeader]: this.generateSignature(delivery.payload, webhook.secret)
          },
          timeout: deliveryOptions.timeout
        });

        // Update delivery status on success
        const duration = Date.now() - startTime;
        await WebhookDelivery.updateDeliveryStatus(
          delivery._id,
          WebhookDeliveryStatus.SUCCESS,
          response.status
        );

        this.logger.webhookDelivery(webhook.id, WebhookDeliveryStatus.SUCCESS, {
          deliveryId: delivery.id,
          duration,
          statusCode: response.status,
          attempt: delivery.attempts + 1
        });
      } catch (error) {
        const axiosError = error as AxiosError;
        const statusCode = axiosError.response?.status || 0;

        // Check if max retries exceeded
        if (delivery.attempts >= deliveryOptions.maxRetries) {
          await WebhookDelivery.updateDeliveryStatus(
            delivery._id,
            WebhookDeliveryStatus.MAX_RETRIES_EXCEEDED,
            statusCode,
            axiosError.message
          );

          this.logger.error('Max webhook delivery retries exceeded', new Error(axiosError.message), {
            webhookId: webhook.id,
            deliveryId: delivery.id,
            attempts: delivery.attempts
          });
          continue;
        }

        // Schedule next retry
        const nextRetry = this.config.calculateNextRetry(delivery.attempts);
        await WebhookDelivery.updateDeliveryStatus(
          delivery._id,
          WebhookDeliveryStatus.RETRY_SCHEDULED,
          statusCode,
          axiosError.message,
          nextRetry
        );

        this.logger.webhookDelivery(webhook.id, WebhookDeliveryStatus.RETRY_SCHEDULED, {
          deliveryId: delivery.id,
          error: axiosError.message,
          statusCode,
          attempt: delivery.attempts + 1,
          nextRetry
        });
      }
    }
  }

  /**
   * Deactivates a webhook configuration
   */
  public async deactivateWebhook(webhookId: string): Promise<IWebhook> {
    const webhook = await Webhook.findById(webhookId);
    if (!webhook) {
      throw new Error(`Webhook not found: ${webhookId}`);
    }

    webhook.active = false;
    webhook.updatedAt = new Date();
    await webhook.save();

    this.logger.info('Webhook deactivated', {
      webhookId: webhook.id,
      url: webhook.url
    });

    return webhook;
  }

  /**
   * Generates HMAC signature for webhook payload
   */
  private generateSignature(payload: object, secret: string): string {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }
}