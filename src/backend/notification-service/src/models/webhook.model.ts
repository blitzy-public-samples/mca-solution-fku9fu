// @package mongoose ^7.3.0
// @package validator ^13.9.0

/**
 * Human Tasks Required:
 * 1. Ensure MongoDB connection is properly configured with retry and connection pooling
 * 2. Set up appropriate indexes in MongoDB for webhookId and status fields
 * 3. Configure monitoring for webhook delivery attempts and failures
 */

import { Schema, model, Types } from 'mongoose';
import validator from 'validator';
import {
  IWebhook,
  IWebhookDelivery,
  WebhookEventType,
  WebhookDeliveryStatus
} from '../interfaces/webhook.interface';

/**
 * Mongoose schema for webhook configuration
 * Addresses requirements:
 * - Integration Layer: Enables real-time notifications for application status changes
 * - Webhook Configuration: Defines webhook endpoint structure for secure delivery
 */
const WebhookSchema = new Schema<IWebhook>({
  url: {
    type: String,
    required: [true, 'Webhook URL is required'],
    validate: {
      validator: (value: string) => validator.isURL(value, { protocols: ['https'] }),
      message: 'Invalid webhook URL. Must be a valid HTTPS URL'
    },
    trim: true
  },
  events: {
    type: [{
      type: String,
      enum: Object.values(WebhookEventType)
    }],
    required: [true, 'At least one event type must be specified'],
    validate: {
      validator: (value: string[]) => value.length > 0,
      message: 'Events array cannot be empty'
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  secret: {
    type: String,
    required: [true, 'Webhook secret is required for secure delivery'],
    minlength: [32, 'Secret must be at least 32 characters long']
  },
  description: {
    type: String,
    required: [true, 'Webhook description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  versionKey: false
});

/**
 * Mongoose schema for webhook delivery tracking
 * Implements reliable webhook delivery with retry mechanisms
 */
const WebhookDeliverySchema = new Schema<IWebhookDelivery>({
  webhookId: {
    type: Types.ObjectId,
    required: [true, 'Webhook ID is required'],
    ref: 'Webhook'
  },
  event: {
    type: String,
    enum: Object.values(WebhookEventType),
    required: [true, 'Event type is required']
  },
  payload: {
    type: Schema.Types.Mixed,
    required: [true, 'Delivery payload is required']
  },
  status: {
    type: String,
    enum: Object.values(WebhookDeliveryStatus),
    default: WebhookDeliveryStatus.PENDING
  },
  attempts: {
    type: Number,
    default: 0,
    min: [0, 'Attempts cannot be negative']
  },
  statusCode: {
    type: Number,
    min: [0, 'Status code cannot be negative']
  },
  error: {
    type: String,
    trim: true
  },
  lastAttempt: {
    type: Date
  },
  nextAttempt: {
    type: Date
  }
}, {
  timestamps: true,
  versionKey: false
});

// Custom methods for Webhook model
WebhookSchema.statics.findActiveByEvent = async function(eventType: WebhookEventType): Promise<IWebhook[]> {
  return this.find({
    active: true,
    events: eventType
  }).exec();
};

WebhookSchema.statics.markAsInactive = async function(webhookId: Types.ObjectId): Promise<IWebhook | null> {
  return this.findByIdAndUpdate(
    webhookId,
    { active: false },
    { new: true }
  ).exec();
};

// Custom methods for WebhookDelivery model
WebhookDeliverySchema.statics.findPendingDeliveries = async function(): Promise<IWebhookDelivery[]> {
  const now = new Date();
  return this.find({
    status: {
      $in: [WebhookDeliveryStatus.PENDING, WebhookDeliveryStatus.RETRY_SCHEDULED]
    },
    $or: [
      { nextAttempt: { $lte: now } },
      { nextAttempt: { $exists: false } }
    ]
  })
  .sort({ nextAttempt: 1, createdAt: 1 })
  .exec();
};

WebhookDeliverySchema.statics.updateDeliveryStatus = async function(
  deliveryId: Types.ObjectId,
  status: WebhookDeliveryStatus,
  statusCode?: number,
  error?: string,
  nextAttempt?: Date
): Promise<IWebhookDelivery | null> {
  const update: any = {
    status,
    lastAttempt: new Date(),
    $inc: { attempts: 1 }
  };

  if (statusCode !== undefined) update.statusCode = statusCode;
  if (error !== undefined) update.error = error;
  if (nextAttempt !== undefined) update.nextAttempt = nextAttempt;

  return this.findByIdAndUpdate(
    deliveryId,
    update,
    { new: true }
  ).exec();
};

// Create indexes
WebhookDeliverySchema.index({ webhookId: 1, status: 1 });
WebhookDeliverySchema.index({ status: 1, nextAttempt: 1 });
WebhookDeliverySchema.index({ createdAt: 1 });

// Export models
export const Webhook = model<IWebhook>('Webhook', WebhookSchema);
export const WebhookDelivery = model<IWebhookDelivery>('WebhookDelivery', WebhookDeliverySchema);
export { WebhookSchema, WebhookDeliverySchema };