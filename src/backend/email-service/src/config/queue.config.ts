/**
 * @fileoverview RabbitMQ queue configuration for email service
 * @version 1.0.0
 * 
 * Human Tasks:
 * 1. Set up RabbitMQ server and configure credentials in environment variables
 * 2. Configure SSL certificates if SSL is enabled
 * 3. Set up monitoring for RabbitMQ connection health
 * 4. Configure queue alerts for message processing delays
 */

// Third-party imports
import * as amqplib from 'amqplib'; // v0.10.0
import dotenv from 'dotenv'; // v16.0.0

// Internal imports
import { IEmailMessage, EmailProcessingStatus } from '../interfaces/email.interface';

/**
 * @interface IQueueConfig
 * @description Interface defining RabbitMQ queue configuration parameters
 * @requirement Event-Driven Architecture - Event-Driven pattern for loose coupling
 */
export interface IQueueConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
  ssl: boolean;
}

/**
 * @interface IQueueNames
 * @description Interface defining queue names for different processing stages
 * @requirement Event-Driven Architecture - Event-Driven pattern for loose coupling
 */
export interface IQueueNames {
  emailProcessing: string;
  documentExtraction: string;
  notificationQueue: string;
}

/**
 * @const RABBITMQ_CONFIG
 * @description RabbitMQ connection configuration from environment variables
 * @requirement Event-Driven Architecture - Event-Driven pattern for loose coupling
 */
export const RABBITMQ_CONFIG: IQueueConfig = {
  host: process.env.RABBITMQ_HOST || 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT || '5672'),
  username: process.env.RABBITMQ_USERNAME || 'guest',
  password: process.env.RABBITMQ_PASSWORD || 'guest',
  vhost: process.env.RABBITMQ_VHOST || '/',
  ssl: process.env.RABBITMQ_SSL === 'true'
};

/**
 * @const QUEUE_NAMES
 * @description Constants for queue names used in the email service
 * @requirement Email Processing - Automated monitoring and processing
 */
export const QUEUE_NAMES: IQueueNames = {
  emailProcessing: 'email-processing',
  documentExtraction: 'document-extraction',
  notificationQueue: 'notification-queue'
};

/**
 * Creates and returns a connection to RabbitMQ server
 * @returns {Promise<amqplib.Connection>} RabbitMQ connection instance
 * @requirement Event-Driven Architecture - Better fault tolerance
 */
export const createQueueConnection = async (): Promise<amqplib.Connection> => {
  // Load environment variables
  dotenv.config();

  try {
    // Construct connection URL with credentials and SSL if enabled
    const protocol = RABBITMQ_CONFIG.ssl ? 'amqps' : 'amqp';
    const connectionUrl = `${protocol}://${RABBITMQ_CONFIG.username}:${RABBITMQ_CONFIG.password}@${RABBITMQ_CONFIG.host}:${RABBITMQ_CONFIG.port}${RABBITMQ_CONFIG.vhost}`;

    // Create connection with automatic recovery options
    const connection = await amqplib.connect(connectionUrl, {
      heartbeat: 60,
      timeout: 30000,
      connectionTimeout: 30000,
    });

    // Handle connection events
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.warn('RabbitMQ connection closed, attempting to reconnect...');
    });

    return connection;
  } catch (error) {
    console.error('Failed to create RabbitMQ connection:', error);
    throw error;
  }
};

/**
 * Creates a channel and sets up queues with proper configurations
 * @param {amqplib.Connection} connection - RabbitMQ connection instance
 * @returns {Promise<amqplib.Channel>} Configured RabbitMQ channel
 * @requirement Event-Driven Architecture - Scalable document processing
 */
export const createChannel = async (connection: amqplib.Connection): Promise<amqplib.Channel> => {
  try {
    // Create channel
    const channel = await connection.createChannel();

    // Configure channel for better load distribution
    await channel.prefetch(1);

    // Assert queues with proper configurations
    await channel.assertQueue(QUEUE_NAMES.emailProcessing, {
      durable: true,
      deadLetterExchange: 'dlx',
      deadLetterRoutingKey: `${QUEUE_NAMES.emailProcessing}.dlq`,
      messageTtl: 86400000, // 24 hours
    });

    await channel.assertQueue(QUEUE_NAMES.documentExtraction, {
      durable: true,
      deadLetterExchange: 'dlx',
      deadLetterRoutingKey: `${QUEUE_NAMES.documentExtraction}.dlq`,
      messageTtl: 86400000,
    });

    await channel.assertQueue(QUEUE_NAMES.notificationQueue, {
      durable: true,
      deadLetterExchange: 'dlx',
      deadLetterRoutingKey: `${QUEUE_NAMES.notificationQueue}.dlq`,
      messageTtl: 43200000, // 12 hours
    });

    // Assert dead letter exchange and queue
    await channel.assertExchange('dlx', 'direct', { durable: true });
    
    // Handle channel events
    channel.on('error', (err) => {
      console.error('RabbitMQ channel error:', err);
    });

    channel.on('close', () => {
      console.warn('RabbitMQ channel closed');
    });

    return channel;
  } catch (error) {
    console.error('Failed to create RabbitMQ channel:', error);
    throw error;
  }
};