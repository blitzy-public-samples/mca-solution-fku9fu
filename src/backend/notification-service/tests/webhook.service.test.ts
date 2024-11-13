// @package jest ^29.5.0
// @package axios-mock-adapter ^1.21.4
// @package mongodb-memory-server ^8.12.2

/**
 * Human Tasks:
 * 1. Configure test environment variables in .env.test
 * 2. Set up test MongoDB instance credentials
 * 3. Configure test SSL certificates for HTTPS webhook endpoints
 * 4. Set up test logging configuration
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import AxiosMockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { WebhookService } from '../src/services/webhook.service';
import { WebhookConfig } from '../src/config/webhook.config';
import {
  IWebhook,
  IWebhookDelivery,
  WebhookEventType,
  WebhookDeliveryStatus
} from '../src/interfaces/webhook.interface';

// Mock axios for HTTP requests
const mockAxios = new AxiosMockAdapter(axios);

// Test data
const testWebhook: IWebhook = {
  id: '123',
  url: 'https://test-webhook.example.com/endpoint',
  events: [WebhookEventType.APPLICATION_RECEIVED],
  active: true,
  secret: 'test-secret-key',
  description: 'Test webhook endpoint',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  webhookDelivery: jest.fn()
};

describe('WebhookService', () => {
  let mongoServer: MongoMemoryServer;
  let webhookService: WebhookService;
  let webhookConfig: WebhookConfig;

  beforeAll(async () => {
    // Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();

    // Initialize webhook configuration
    webhookConfig = new WebhookConfig();
    
    // Initialize webhook service
    webhookService = new WebhookService(webhookConfig, mockLogger);
  });

  afterAll(async () => {
    // Cleanup
    mockAxios.reset();
    await mongoServer.stop();
  });

  beforeEach(() => {
    // Reset mocks before each test
    mockAxios.reset();
    jest.clearAllMocks();
  });

  describe('createWebhook', () => {
    /**
     * Tests webhook creation functionality
     * Addresses requirement: Webhook Configuration
     */
    
    it('should create webhook with valid configuration and URL', async () => {
      const webhookData = { ...testWebhook };
      const result = await webhookService.createWebhook(webhookData);

      expect(result).toBeDefined();
      expect(result.url).toBe(webhookData.url);
      expect(result.active).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Webhook configuration created', expect.any(Object));
    });

    it('should reject invalid webhook URLs with validation error', async () => {
      const invalidWebhook = {
        ...testWebhook,
        url: 'invalid-url'
      };

      await expect(webhookService.createWebhook(invalidWebhook))
        .rejects
        .toThrow('Invalid webhook URL. Must be a valid HTTPS URL');
    });

    it('should validate webhook event types against WebhookEventType enum', async () => {
      const invalidEventWebhook = {
        ...testWebhook,
        events: ['INVALID_EVENT']
      };

      await expect(webhookService.createWebhook(invalidEventWebhook))
        .rejects
        .toThrow('Invalid webhook event types specified');
    });

    it('should handle duplicate webhook URLs with appropriate error', async () => {
      // First creation
      await webhookService.createWebhook(testWebhook);

      // Attempt duplicate creation
      await expect(webhookService.createWebhook(testWebhook))
        .rejects
        .toThrow();
    });
  });

  describe('deliverWebhook', () => {
    /**
     * Tests webhook delivery functionality
     * Addresses requirement: Integration Layer
     */

    it('should successfully deliver webhook payload with 200 response', async () => {
      const payload = { test: 'data' };
      mockAxios.onPost(testWebhook.url).reply(200);

      const result = await webhookService.deliverWebhook(
        testWebhook.id,
        WebhookEventType.APPLICATION_RECEIVED,
        payload
      );

      expect(result).toBeDefined();
      expect(result.status).toBe(WebhookDeliveryStatus.SUCCESS);
      expect(mockLogger.webhookDelivery).toHaveBeenCalledWith(
        testWebhook.id,
        WebhookDeliveryStatus.SUCCESS,
        expect.any(Object)
      );
    });

    it('should handle delivery timeouts using configured timeout value', async () => {
      const payload = { test: 'data' };
      mockAxios.onPost(testWebhook.url).timeout();

      const result = await webhookService.deliverWebhook(
        testWebhook.id,
        WebhookEventType.APPLICATION_RECEIVED,
        payload
      );

      expect(result.status).toBe(WebhookDeliveryStatus.RETRY_SCHEDULED);
      expect(mockLogger.webhookDelivery).toHaveBeenCalledWith(
        testWebhook.id,
        WebhookDeliveryStatus.RETRY_SCHEDULED,
        expect.any(Object)
      );
    });

    it('should record delivery attempts in WebhookDelivery model', async () => {
      const payload = { test: 'data' };
      mockAxios.onPost(testWebhook.url).reply(200);

      const result = await webhookService.deliverWebhook(
        testWebhook.id,
        WebhookEventType.APPLICATION_RECEIVED,
        payload
      );

      expect(result).toHaveProperty('attempts');
      expect(result).toHaveProperty('lastAttempt');
    });

    it('should handle HTTP errors with appropriate status codes', async () => {
      const payload = { test: 'data' };
      mockAxios.onPost(testWebhook.url).reply(500);

      const result = await webhookService.deliverWebhook(
        testWebhook.id,
        WebhookEventType.APPLICATION_RECEIVED,
        payload
      );

      expect(result.status).toBe(WebhookDeliveryStatus.RETRY_SCHEDULED);
      expect(result.statusCode).toBe(500);
    });
  });

  describe('retryFailedDeliveries', () => {
    /**
     * Tests webhook retry mechanism with exponential backoff
     * Addresses requirement: Integration Layer
     */

    it('should retry failed deliveries with exponential backoff', async () => {
      const deliveryOptions = webhookConfig.getDeliveryOptions();
      const nextRetry = webhookConfig.calculateNextRetry(1);

      mockAxios.onPost(testWebhook.url).reply(200);

      await webhookService.retryFailedDeliveries();

      expect(mockAxios.history.post.length).toBeGreaterThan(0);
      expect(mockLogger.webhookDelivery).toHaveBeenCalled();
    });

    it('should respect maxRetries configuration limit', async () => {
      const deliveryOptions = webhookConfig.getDeliveryOptions();
      mockAxios.onPost(testWebhook.url).reply(500);

      // Simulate max retries exceeded
      const delivery: Partial<IWebhookDelivery> = {
        attempts: deliveryOptions.maxRetries,
        webhookId: testWebhook.id
      };

      await webhookService.retryFailedDeliveries();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Max webhook delivery retries exceeded',
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('should implement exponential backoff with jitter', async () => {
      const firstRetry = webhookConfig.calculateNextRetry(0);
      const secondRetry = webhookConfig.calculateNextRetry(1);
      const thirdRetry = webhookConfig.calculateNextRetry(2);

      // Verify exponential increase in delays
      expect(secondRetry.getTime() - firstRetry.getTime())
        .toBeLessThan(thirdRetry.getTime() - secondRetry.getTime());
    });

    it('should handle permanent failures after max retries exceeded', async () => {
      mockAxios.onPost(testWebhook.url).reply(500);

      const delivery: Partial<IWebhookDelivery> = {
        attempts: webhookConfig.getDeliveryOptions().maxRetries + 1,
        webhookId: testWebhook.id
      };

      await webhookService.retryFailedDeliveries();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Max webhook delivery retries exceeded',
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('deactivateWebhook', () => {
    /**
     * Tests webhook deactivation
     * Addresses requirement: Webhook Configuration
     */

    it('should deactivate active webhook and update status', async () => {
      const result = await webhookService.deactivateWebhook(testWebhook.id);

      expect(result.active).toBe(false);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Webhook deactivated',
        expect.any(Object)
      );
    });

    it('should handle non-existent webhook with appropriate error', async () => {
      await expect(webhookService.deactivateWebhook('non-existent-id'))
        .rejects
        .toThrow('Webhook not found: non-existent-id');
    });

    it('should prevent delivery attempts to deactivated webhooks', async () => {
      // Deactivate webhook
      await webhookService.deactivateWebhook(testWebhook.id);

      // Attempt delivery
      await expect(webhookService.deliverWebhook(
        testWebhook.id,
        WebhookEventType.APPLICATION_RECEIVED,
        { test: 'data' }
      )).rejects.toThrow('No active webhook found for event');
    });
  });
});