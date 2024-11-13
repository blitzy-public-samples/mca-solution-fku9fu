/**
 * Human Tasks:
 * 1. Configure test data fixtures for webhook configurations
 * 2. Set up test environment variables for API endpoints
 * 3. Review webhook security requirements and update test cases accordingly
 * 4. Verify webhook URL validation rules with security team
 */

// cypress ^12.0.0
import { WebhookConfig, WebhookEventType } from '../../src/interfaces/webhook.interface';

/**
 * REQ: Webhook Configuration
 * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
 */
describe('Webhook Configuration E2E Tests', () => {
  const testWebhook: Partial<WebhookConfig> = {
    url: 'https://api.example.com/webhooks',
    events: [WebhookEventType.APPLICATION_RECEIVED, WebhookEventType.STATUS_CHANGED],
    secret: 'test-webhook-secret-123',
    active: true
  };

  beforeEach(() => {
    // Intercept API requests
    cy.intercept('GET', '/api/webhooks', { fixture: 'webhooks.json' }).as('getWebhooks');
    cy.intercept('POST', '/api/webhooks', { statusCode: 201 }).as('createWebhook');
    cy.intercept('PUT', '/api/webhooks/*', { statusCode: 200 }).as('updateWebhook');
    cy.intercept('DELETE', '/api/webhooks/*', { statusCode: 204 }).as('deleteWebhook');

    // Visit webhook configuration page
    cy.visit('/settings/webhooks');
    cy.wait('@getWebhooks');
  });

  /**
   * REQ: Integration Layer
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  it('should create a new webhook configuration', () => {
    // Open webhook form
    cy.get('[data-testid="add-webhook-button"]').click();

    // Fill webhook form
    cy.get('[data-testid="webhook-url-input"]').type(testWebhook.url!);
    cy.get('[data-testid="event-APPLICATION_RECEIVED"]').check();
    cy.get('[data-testid="event-STATUS_CHANGED"]').check();
    cy.get('[data-testid="webhook-secret-input"]').type(testWebhook.secret!);
    cy.get('[data-testid="webhook-active-toggle"]').click();

    // Submit form
    cy.get('[data-testid="save-webhook-button"]').click();

    // Verify API request
    cy.wait('@createWebhook').its('request.body').should('deep.include', testWebhook);

    // Verify success message
    cy.get('[data-testid="toast-success"]').should('be.visible')
      .and('contain', 'Webhook created successfully');

    // Verify webhook appears in list
    cy.get('[data-testid="webhooks-table"]')
      .should('contain', testWebhook.url)
      .and('contain', 'Active');
  });

  /**
   * REQ: Integration Requirements
   * Location: 5.3 API DESIGN/5.3.3 Integration Requirements
   */
  it('should edit existing webhook configuration', () => {
    const updatedUrl = 'https://api.example.com/webhooks/v2';

    // Click edit button on first webhook
    cy.get('[data-testid="edit-webhook-button"]').first().click();

    // Update webhook details
    cy.get('[data-testid="webhook-url-input"]').clear().type(updatedUrl);
    cy.get('[data-testid="event-APPLICATION_UPDATED"]').check();
    cy.get('[data-testid="webhook-secret-input"]').clear().type('new-secret-456');
    cy.get('[data-testid="webhook-active-toggle"]').click();

    // Save changes
    cy.get('[data-testid="update-webhook-button"]').click();

    // Verify API request
    cy.wait('@updateWebhook').its('request.body').should('deep.include', {
      url: updatedUrl,
      events: [
        WebhookEventType.APPLICATION_RECEIVED,
        WebhookEventType.STATUS_CHANGED,
        WebhookEventType.APPLICATION_UPDATED
      ]
    });

    // Verify success message and updated list
    cy.get('[data-testid="toast-success"]').should('be.visible')
      .and('contain', 'Webhook updated successfully');
    cy.get('[data-testid="webhooks-table"]').should('contain', updatedUrl);
  });

  it('should delete webhook configuration', () => {
    // Click delete button
    cy.get('[data-testid="delete-webhook-button"]').first().click();

    // Confirm deletion
    cy.get('[data-testid="confirm-delete-button"]').click();

    // Verify API request
    cy.wait('@deleteWebhook');

    // Verify success message
    cy.get('[data-testid="toast-success"]').should('be.visible')
      .and('contain', 'Webhook deleted successfully');

    // Verify webhook removed from list
    cy.get('[data-testid="webhooks-table"]')
      .should('not.contain', testWebhook.url);
  });

  it('should validate webhook form inputs', () => {
    // Open webhook form
    cy.get('[data-testid="add-webhook-button"]').click();

    // Test empty form submission
    cy.get('[data-testid="save-webhook-button"]').click();
    cy.get('[data-testid="url-error"]').should('contain', 'URL is required');
    cy.get('[data-testid="events-error"]').should('contain', 'At least one event must be selected');

    // Test invalid URL format
    cy.get('[data-testid="webhook-url-input"]').type('invalid-url');
    cy.get('[data-testid="url-error"]').should('contain', 'Invalid URL format');

    // Test non-HTTPS URL
    cy.get('[data-testid="webhook-url-input"]').clear().type('http://example.com');
    cy.get('[data-testid="url-error"]').should('contain', 'URL must use HTTPS');

    // Test valid URL but no events
    cy.get('[data-testid="webhook-url-input"]').clear().type('https://example.com');
    cy.get('[data-testid="save-webhook-button"]').click();
    cy.get('[data-testid="events-error"]').should('contain', 'At least one event must be selected');
  });

  it('should handle API errors gracefully', () => {
    // Intercept with error response
    cy.intercept('POST', '/api/webhooks', {
      statusCode: 400,
      body: { error: 'Invalid webhook configuration' }
    }).as('createWebhookError');

    // Attempt to create webhook
    cy.get('[data-testid="add-webhook-button"]').click();
    cy.get('[data-testid="webhook-url-input"]').type(testWebhook.url!);
    cy.get('[data-testid="event-APPLICATION_RECEIVED"]').check();
    cy.get('[data-testid="webhook-secret-input"]').type(testWebhook.secret!);
    cy.get('[data-testid="save-webhook-button"]').click();

    // Verify error handling
    cy.wait('@createWebhookError');
    cy.get('[data-testid="toast-error"]').should('be.visible')
      .and('contain', 'Invalid webhook configuration');
  });

  it('should test webhook endpoint', () => {
    // Intercept test endpoint
    cy.intercept('POST', '/api/webhooks/*/test', {
      statusCode: 200,
      body: { success: true, statusCode: 200 }
    }).as('testWebhook');

    // Click test button
    cy.get('[data-testid="test-webhook-button"]').first().click();

    // Verify test request and response
    cy.wait('@testWebhook');
    cy.get('[data-testid="toast-success"]').should('be.visible')
      .and('contain', 'Webhook test successful');
  });

  it('should toggle webhook active status', () => {
    // Intercept status update
    cy.intercept('PUT', '/api/webhooks/*', { statusCode: 200 }).as('updateStatus');

    // Toggle status
    cy.get('[data-testid="webhook-active-toggle"]').first().click();

    // Verify API request and UI update
    cy.wait('@updateStatus').its('request.body').should('deep.include', { active: false });
    cy.get('[data-testid="webhook-status"]').first().should('contain', 'Inactive');
  });
});