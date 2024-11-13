// @package express ^4.18.2
// @package http-status-codes ^2.2.0

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { WebhookService } from '../services/webhook.service';
import { IWebhook, WebhookEventType } from '../interfaces/webhook.interface';
import Logger from '../utils/logger';

/**
 * Human Tasks:
 * 1. Configure rate limiting for webhook endpoints in API Gateway
 * 2. Set up monitoring alerts for webhook endpoint health
 * 3. Configure SSL certificates for webhook endpoints
 */

/**
 * Controller handling webhook configuration and management endpoints
 * Addresses requirements:
 * - Integration Layer: REST APIs and webhooks for system integration
 * - Webhook Configuration: Defines webhook endpoint structure and configuration
 */
export class WebhookController {
  private webhookService: WebhookService;
  private logger: typeof Logger;

  constructor(webhookService: WebhookService, logger: typeof Logger) {
    this.webhookService = webhookService;
    this.logger = logger;
  }

  /**
   * Creates a new webhook configuration
   * POST /webhooks
   */
  public async createWebhook(req: Request, res: Response): Promise<Response> {
    try {
      // Validate required fields
      const { url, events, secret, description } = req.body;

      if (!url || !events || !secret) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Missing required fields: url, events, and secret are required'
        });
      }

      // Validate webhook events
      const validEvents = Object.values(WebhookEventType);
      const hasInvalidEvents = events.some((event: string) => !validEvents.includes(event as WebhookEventType));
      
      if (hasInvalidEvents) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Invalid webhook event types specified',
          validEvents
        });
      }

      // Create webhook configuration
      const webhookData: IWebhook = {
        url,
        events,
        secret,
        description: description || '',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: '' // Will be set by the service
      };

      const webhook = await this.webhookService.createWebhook(webhookData);

      this.logger.info('Webhook configuration created', {
        webhookId: webhook.id,
        url: webhook.url,
        events: webhook.events
      });

      return res.status(StatusCodes.CREATED).json(webhook);
    } catch (error) {
      this.logger.error('Error creating webhook', error as Error, {
        url: req.body.url,
        events: req.body.events
      });

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to create webhook configuration'
      });
    }
  }

  /**
   * Retrieves webhook configuration
   * GET /webhooks/:id
   */
  public async getWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Webhook ID is required'
        });
      }

      const webhook = await this.webhookService.getWebhook(id);

      if (!webhook) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Webhook configuration not found'
        });
      }

      this.logger.info('Webhook configuration retrieved', {
        webhookId: webhook.id
      });

      return res.status(StatusCodes.OK).json(webhook);
    } catch (error) {
      this.logger.error('Error retrieving webhook', error as Error, {
        webhookId: req.params.id
      });

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to retrieve webhook configuration'
      });
    }
  }

  /**
   * Deactivates webhook configuration
   * DELETE /webhooks/:id
   */
  public async deactivateWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Webhook ID is required'
        });
      }

      const webhook = await this.webhookService.deactivateWebhook(id);

      this.logger.info('Webhook configuration deactivated', {
        webhookId: webhook.id,
        url: webhook.url
      });

      return res.status(StatusCodes.OK).json({
        message: 'Webhook configuration deactivated successfully',
        webhookId: webhook.id
      });
    } catch (error) {
      if ((error as Error).message.includes('not found')) {
        return res.status(StatusCodes.NOT_FOUND).json({
          error: 'Webhook configuration not found'
        });
      }

      this.logger.error('Error deactivating webhook', error as Error, {
        webhookId: req.params.id
      });

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to deactivate webhook configuration'
      });
    }
  }
}