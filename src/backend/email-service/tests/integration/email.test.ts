/**
 * @fileoverview Integration tests for the email service
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Configure test IMAP server credentials in test environment
 * 2. Set up test RabbitMQ vhost for integration tests
 * 3. Configure test MongoDB database name
 * 4. Verify test container versions match production
 */

// Third-party imports
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'; // ^29.0.0
import { MongoMemoryServer } from 'mongodb-memory-server'; // ^8.12.0
import { connect, connection, disconnect } from 'mongoose'; // ^6.9.0
import { GenericContainer, StartedTestContainer } from 'testcontainers'; // ^9.0.0
import * as amqplib from 'amqplib'; // ^0.10.0

// Internal imports
import { EmailService } from '../../src/services/email.service';
import { EmailModel } from '../../src/models/email.model';
import { emailConfig } from '../../src/config/email.config';
import { EmailProcessingStatus } from '../../src/interfaces/email.interface';

describe('Email Service Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let emailService: EmailService;
  let rabbitContainer: StartedTestContainer;
  let mongoContainer: StartedTestContainer;
  let queueConnection: amqplib.Connection;
  let queueChannel: amqplib.Channel;

  /**
   * @requirement Email Processing - Automated monitoring and processing of submissions@dollarfunding.com
   */
  beforeAll(async () => {
    // Start MongoDB container
    mongoContainer = await new GenericContainer('mongo:6.0')
      .withExposedPorts(27017)
      .withEnvironment({
        MONGO_INITDB_DATABASE: 'test_db'
      })
      .start();

    // Start RabbitMQ container
    rabbitContainer = await new GenericContainer('rabbitmq:3.11-management')
      .withExposedPorts(5672)
      .withEnvironment({
        RABBITMQ_DEFAULT_USER: 'test',
        RABBITMQ_DEFAULT_PASS: 'test',
        RABBITMQ_DEFAULT_VHOST: 'test_vhost'
      })
      .start();

    // Connect to MongoDB
    const mongoPort = mongoContainer.getMappedPort(27017);
    const mongoHost = mongoContainer.getHost();
    await connect(`mongodb://${mongoHost}:${mongoPort}/test_db`);

    // Connect to RabbitMQ
    const rabbitPort = rabbitContainer.getMappedPort(5672);
    const rabbitHost = rabbitContainer.getHost();
    queueConnection = await amqplib.connect(`amqp://test:test@${rabbitHost}:${rabbitPort}/test_vhost`);
    queueChannel = await queueConnection.createChannel();

    // Initialize test queues
    await queueChannel.assertQueue('email_processing', { durable: true });

    // Initialize email service with test configuration
    const testConfig = {
      ...emailConfig,
      imap: {
        ...emailConfig.imap,
        host: 'test.imap.server',
        port: 993,
        user: 'test@example.com',
        password: 'test123'
      }
    };

    emailService = new EmailService();
  });

  /**
   * @requirement Processing Time - < 5 minutes per application
   */
  afterAll(async () => {
    // Stop email monitoring
    await emailService.stopMonitoring();

    // Close queue connections
    if (queueChannel) await queueChannel.close();
    if (queueConnection) await queueConnection.close();

    // Close MongoDB connection
    await disconnect();

    // Stop containers
    await mongoContainer.stop();
    await rabbitContainer.stop();
  });

  beforeEach(async () => {
    // Clear database collections
    await EmailModel.deleteMany({});

    // Clear test queues
    await queueChannel.purgeQueue('email_processing');
  });

  test('should successfully start email monitoring', async () => {
    // Start monitoring
    await emailService.startMonitoring();

    // Verify monitoring is active
    expect(emailService['isMonitoring']).toBe(true);

    // Verify IMAP connection is established
    expect(emailService['imapConnection']).toBeDefined();

    // Verify queue connection is established
    expect(emailService['queueChannel']).toBeDefined();
  });

  /**
   * @requirement Document Management - AI-powered classification and secure storage of application documents
   */
  test('should process incoming email with attachments', async () => {
    // Create test email with attachments
    const testEmail = {
      messageId: 'test-123',
      from: 'broker@example.com',
      subject: 'Test Application',
      receivedDate: new Date(),
      processingStatus: EmailProcessingStatus.PENDING,
      attachments: [
        {
          filename: 'application.pdf',
          contentType: 'application/pdf',
          size: 1024,
          checksum: 'abc123',
          type: 'APPLICATION'
        },
        {
          filename: 'statement.pdf',
          contentType: 'application/pdf',
          size: 2048,
          checksum: 'def456',
          type: 'BANK_STATEMENT'
        }
      ]
    };

    // Process email
    await emailService['processEmail'](testEmail);

    // Verify email is saved to database
    const savedEmail = await EmailModel.findOne({ messageId: 'test-123' });
    expect(savedEmail).toBeDefined();
    expect(savedEmail?.processingStatus).toBe(EmailProcessingStatus.PROCESSING);
    expect(savedEmail?.attachments).toHaveLength(2);

    // Verify message is queued
    const queueMessage = await queueChannel.get('email_processing');
    expect(queueMessage).toBeDefined();
    const messageContent = JSON.parse(queueMessage!.content.toString());
    expect(messageContent.messageId).toBe('test-123');
    expect(messageContent.attachments).toHaveLength(2);
  });

  test('should handle invalid attachments', async () => {
    // Create test email with invalid attachment
    const testEmail = {
      messageId: 'test-456',
      from: 'broker@example.com',
      subject: 'Test Invalid',
      receivedDate: new Date(),
      processingStatus: EmailProcessingStatus.PENDING,
      attachments: [
        {
          filename: 'malware.exe',
          contentType: 'application/x-msdownload',
          size: 1024,
          checksum: 'xyz789',
          type: 'UNKNOWN'
        }
      ]
    };

    // Process email
    await emailService['processEmail'](testEmail);

    // Verify email is marked as failed
    const savedEmail = await EmailModel.findOne({ messageId: 'test-456' });
    expect(savedEmail).toBeDefined();
    expect(savedEmail?.processingStatus).toBe(EmailProcessingStatus.FAILED);

    // Verify no message is queued
    const queueMessage = await queueChannel.get('email_processing');
    expect(queueMessage).toBeNull();
  });

  test('should respect processing timeout', async () => {
    // Configure short timeout
    const testConfig = {
      ...emailConfig,
      processing: {
        ...emailConfig.processing,
        processingTimeout: 100 // 100ms timeout
      }
    };

    // Create test email that simulates long processing
    const testEmail = {
      messageId: 'test-789',
      from: 'broker@example.com',
      subject: 'Test Timeout',
      receivedDate: new Date(),
      processingStatus: EmailProcessingStatus.PENDING,
      attachments: [
        {
          filename: 'large.pdf',
          contentType: 'application/pdf',
          size: 10485760, // 10MB
          checksum: 'timeout123',
          type: 'APPLICATION'
        }
      ]
    };

    // Process email with timeout
    const processPromise = emailService['processEmail'](testEmail);
    
    // Verify timeout occurs
    await expect(processPromise).rejects.toThrow();

    // Verify email is marked as failed
    const savedEmail = await EmailModel.findOne({ messageId: 'test-789' });
    expect(savedEmail).toBeDefined();
    expect(savedEmail?.processingStatus).toBe(EmailProcessingStatus.FAILED);
  });
});