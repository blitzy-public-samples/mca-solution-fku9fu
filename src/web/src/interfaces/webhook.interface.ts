// typescript v5.0.x

import { ApplicationStatus } from '../interfaces/application.interface';

/**
 * Human Tasks:
 * 1. Review webhook security best practices and ensure secret length/complexity requirements are met
 * 2. Verify webhook retry policy and timeout configurations align with infrastructure capabilities
 * 3. Confirm event types cover all required business notifications
 */

/**
 * REQ: Integration Layer - Defines supported webhook event types
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
export enum WebhookEventType {
    APPLICATION_RECEIVED = 'application.received',
    APPLICATION_UPDATED = 'application.updated',
    STATUS_CHANGED = 'application.status_changed',
    DOCUMENT_UPLOADED = 'application.document_uploaded',
    REVIEW_REQUIRED = 'application.review_required',
    PROCESSING_COMPLETE = 'application.processing_complete'
}

/**
 * REQ: Webhook Configuration - Defines webhook endpoint configuration
 * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
 */
export interface WebhookConfig {
    /** Unique identifier for the webhook configuration */
    id: string;

    /** HTTPS URL where webhook events will be delivered */
    url: string;

    /** Array of event types this webhook should receive */
    events: WebhookEventType[];

    /** Whether the webhook is currently active */
    active: boolean;

    /** Secret used to sign webhook payloads for verification */
    secret: string;

    /** ISO 8601 timestamp of webhook creation */
    createdAt: string;

    /** ISO 8601 timestamp of last configuration update */
    updatedAt: string;
}

/**
 * REQ: Integration Requirements - Defines webhook delivery tracking
 * Location: 5.3 API DESIGN/5.3.3 Integration Requirements
 */
export interface WebhookDelivery {
    /** Unique identifier for the delivery attempt */
    id: string;

    /** Reference to the webhook configuration */
    webhookId: string;

    /** Type of event being delivered */
    eventType: WebhookEventType;

    /** Delivery status (success/failed/pending) */
    status: string;

    /** Event payload that was delivered */
    payload: object;

    /** Response received from the webhook endpoint */
    response: object;

    /** ISO 8601 timestamp of delivery attempt */
    timestamp: string;

    /** Number of retry attempts made */
    retryCount: number;
}

/**
 * REQ: Integration Requirements - Defines webhook event payload structure
 * Location: 5.3 API DESIGN/5.3.3 Integration Requirements
 */
export interface WebhookPayload {
    /** Type of event that occurred */
    event: WebhookEventType;

    /** ID of the application this event relates to */
    applicationId: string;

    /** Current application status */
    status: ApplicationStatus;

    /** Additional event-specific data */
    data: object;

    /** ISO 8601 timestamp when the event occurred */
    timestamp: string;
}