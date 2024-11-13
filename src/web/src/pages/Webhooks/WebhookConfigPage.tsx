/*
Human Tasks:
1. Verify webhook configuration permissions in production environment
2. Test webhook configuration with actual endpoints
3. Validate WCAG 2.1 Level AA compliance with automated tools
4. Review error handling and notification messages with product team
*/

// react v18.x
import React from 'react';
// react-redux v8.x
import { useDispatch, useSelector } from 'react-redux';
// @mui/material v5.14.x
import { Typography } from '@mui/material';

// Internal imports
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import WebhookConfig from '../../components/webhooks/WebhookConfig/WebhookConfig';
import useNotification from '../../hooks/useNotification';

/**
 * REQ: Integration Layer
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Implements web interface for configuring REST APIs and webhooks for system integration
 */
const WebhookConfigPage: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const { showSuccess, showError } = useNotification();

  // Get loading state from Redux store
  const isLoading = useSelector((state: any) => state.webhook.loading);

  /**
   * REQ: Integration Requirements
   * Location: 5.3 API DESIGN/5.3.3 Integration Requirements
   * Handles refreshing the webhook list with error handling and notifications
   */
  const handleRefresh = async (): Promise<void> => {
    try {
      await dispatch({ type: 'webhook/fetchAll' });
      showSuccess('Webhook list refreshed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh webhooks';
      showError(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      {/* 
        REQ: Webhook Configuration
        Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
        Provides interface for configuring and managing webhook endpoints
      */}
      <div role="main" aria-labelledby="webhook-config-title">
        <Typography
          id="webhook-config-title"
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ mb: 3 }}
        >
          Webhook Configuration
        </Typography>
        
        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          Configure and manage webhook endpoints for system integration. Add, edit, or remove webhook configurations
          and test their connectivity.
        </Typography>

        <WebhookConfig
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
      </div>
    </DashboardLayout>
  );
});

WebhookConfigPage.displayName = 'WebhookConfigPage';

export default WebhookConfigPage;