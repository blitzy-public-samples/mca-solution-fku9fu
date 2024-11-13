/**
 * @fileoverview Test suite for email service that handles MCA application email processing
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Configure test IMAP server credentials in test environment
 * 2. Set up test RabbitMQ instance for queue testing
 * 3. Verify test MongoDB instance has sufficient disk space
 * 4. Configure test email templates for automated testing
 */

// Third-party imports
import { jest } from '@jest/globals'; // v29.x
import * as IMAP from 'imap'; // ^0.8.19
import * as amqplib from 'amqplib'; // ^0.10.0
import { MongoMemoryServer } from 'mongodb-memory-server'; // ^8.12.0

// Internal imports
import { EmailService } from '../src/services/email.service';
import { IEmailMessage, EmailProcessingStatus } from '../src/interfaces/email.interface';

// Mock implementations
jest.mock('imap');
jest.mock('amqplib');

// Global test variables
let emailService: EmailService;
let mockImapConnection: jest.Mocked<IMAP.Connection>;
let mockQueueChannel: jest.Mocked<amqplib.Channel>;
let mongoServer: MongoMemoryServer;

describe('EmailService', () => {
  beforeAll(async () => {
    // Requirement: Email Processing - Automated monitoring and processing
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();

    // Setup mock IMAP connection
    mockImapConnection = {
      connect: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
      once: jest.fn(),
      openBox: jest.fn(),
      search: jest.fn(),
      fetch: jest.fn()
    } as unknown as jest.Mocked<IMAP.Connection>;

    // Setup mock RabbitMQ channel
    mockQueueChannel = {
      close: jest.fn(),
      sendToQueue: jest.fn(),
      assertQueue: jest.fn()
    } as unknown as jest.Mocked<amqplib.Channel>;

    // Configure IMAP mock
    (IMAP as jest.MockedClass<typeof IMAP>).mockImplementation(() => mockImapConnection);
  });

  afterAll(async () => {
    await mongoServer.stop();
    jest.resetAllMocks();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    emailService = new EmailService();

    // Setup default mock behaviors
    mockImapConnection.once.mockImplementation((event: string, callback: Function) => {
      if (event === 'ready') {
        callback();
      }
      return mockImapConnection;
    });

    mockImapConnection.openBox.mockImplementation((box: string, readWrite: boolean, callback: Function) => {
      callback(null);
    });
  });

  describe('startMonitoring', () => {
    // Requirement: Email Processing - Automated monitoring and processing
    it('should successfully start email monitoring', async () => {
      // Arrange
      const connectSpy = jest.spyOn(mockImapConnection, 'connect');
      const onSpy = jest.spyOn(mockImapConnection, 'on');

      // Act
      await emailService.startMonitoring();

      // Assert
      expect(connectSpy).toHaveBeenCalled();
      expect(onSpy).toHaveBeenCalledWith('mail', expect.any(Function));
      expect(mockImapConnection.openBox).toHaveBeenCalledWith('INBOX', false, expect.any(Function));
    });

    it('should throw error if monitoring is already active', async () => {
      // Arrange
      await emailService.startMonitoring();

      // Act & Assert
      await expect(emailService.startMonitoring()).rejects.toThrow('Email monitoring is already active');
    });

    it('should handle IMAP connection errors', async () => {
      // Arrange
      mockImapConnection.once.mockImplementation((event: string, callback: Function) => {
        if (event === 'error') {
          callback(new Error('IMAP connection failed'));
        }
        return mockImapConnection;
      });

      // Act & Assert
      await expect(emailService.startMonitoring()).rejects.toThrow('IMAP connection failed');
    });
  });

  describe('stopMonitoring', () => {
    it('should successfully stop email monitoring', async () => {
      // Arrange
      await emailService.startMonitoring();
      const endSpy = jest.spyOn(mockImapConnection, 'end');

      // Act
      await emailService.stopMonitoring();

      // Assert
      expect(endSpy).toHaveBeenCalled();
      expect(mockQueueChannel.close).toHaveBeenCalled();
    });

    it('should handle errors during monitoring stop', async () => {
      // Arrange
      await emailService.startMonitoring();
      mockImapConnection.end.mockImplementation(() => {
        throw new Error('Failed to close IMAP connection');
      });

      // Act & Assert
      await expect(emailService.stopMonitoring()).rejects.toThrow('Failed to close IMAP connection');
    });
  });

  describe('processEmail', () => {
    // Requirement: Processing Time - < 5 minutes per application
    it('should process email within time limit', async () => {
      // Arrange
      const mockEmail: IEmailMessage = {
        messageId: 'test-123',
        from: 'test@dollarfunding.com',
        subject: 'Test Application',
        receivedDate: new Date(),
        processingStatus: EmailProcessingStatus.PENDING,
        attachments: []
      };

      const startTime = Date.now();
      await emailService.startMonitoring();

      // Act
      await (emailService as any).processEmail(mockEmail);
      const processingTime = Date.now() - startTime;

      // Assert
      expect(processingTime).toBeLessThan(300000); // 5 minutes in milliseconds
      expect(mockQueueChannel.sendToQueue).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Buffer),
        expect.objectContaining({
          messageId: mockEmail.messageId
        })
      );
    });

    it('should reject unauthorized senders', async () => {
      // Arrange
      const mockEmail: IEmailMessage = {
        messageId: 'test-123',
        from: 'unauthorized@example.com',
        subject: 'Test Application',
        receivedDate: new Date(),
        processingStatus: EmailProcessingStatus.PENDING,
        attachments: []
      };

      await emailService.startMonitoring();

      // Act
      await (emailService as any).processEmail(mockEmail);

      // Assert
      expect(mockQueueChannel.sendToQueue).not.toHaveBeenCalled();
    });

    it('should handle queue channel errors', async () => {
      // Arrange
      const mockEmail: IEmailMessage = {
        messageId: 'test-123',
        from: 'test@dollarfunding.com',
        subject: 'Test Application',
        receivedDate: new Date(),
        processingStatus: EmailProcessingStatus.PENDING,
        attachments: []
      };

      mockQueueChannel.sendToQueue.mockRejectedValue(new Error('Queue error'));
      await emailService.startMonitoring();

      // Act & Assert
      await expect((emailService as any).processEmail(mockEmail)).rejects.toThrow('Queue error');
    });
  });
});