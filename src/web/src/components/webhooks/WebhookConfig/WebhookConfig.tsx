// react v18.x
import React, { useState, useCallback } from 'react';
// react-redux v8.x
import { useDispatch, useSelector } from 'react-redux';
// @mui/material v5.14.x
import { Button, IconButton } from '@mui/material';
// @mui/icons-material v5.14.x
import { Add, Edit, Delete } from '@mui/icons-material';

import WebhookForm from '../WebhookForm/WebhookForm';
import WebhookList from '../WebhookList/WebhookList';
import { WebhookConfig as IWebhookConfig } from '../../../interfaces/webhook.interface';
import Card from '../../common/Card/Card';
import Dialog from '../../common/Dialog/Dialog';

/*
Human Tasks:
1. Configure webhook retry policies in production environment
2. Set up monitoring alerts for webhook delivery failures
3. Review webhook security requirements with security team
4. Validate WCAG 2.1 Level AA compliance with automated tools
*/

interface WebhookConfigProps {
  isLoading: boolean;
  onRefresh: () => void;
}

/**
 * REQ: Integration Layer - Main component for webhook configuration management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
const WebhookConfig: React.FC<WebhookConfigProps> = React.memo(({ isLoading, onRefresh }) => {
  const dispatch = useDispatch();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<IWebhookConfig | null>(null);

  // Redux state selectors
  const webhooks = useSelector((state: any) => state.webhook.webhooks);
  const error = useSelector((state: any) => state.webhook.error);

  /**
   * REQ: Webhook Configuration - Handles the creation of a new webhook
   * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
   */
  const handleAddWebhook = useCallback(async (webhookData: IWebhookConfig) => {
    try {
      await dispatch({ type: 'webhook/create', payload: webhookData });
      setIsAddDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  }, [dispatch, onRefresh]);

  /**
   * REQ: Integration Requirements - Handles the editing of an existing webhook
   * Location: 5.3 API DESIGN/5.3.3 Integration Requirements
   */
  const handleEditWebhook = useCallback(async (webhookData: IWebhookConfig) => {
    try {
      await dispatch({ type: 'webhook/update', payload: webhookData });
      setIsEditDialogOpen(false);
      setSelectedWebhook(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to update webhook:', error);
    }
  }, [dispatch, onRefresh]);

  /**
   * REQ: Integration Requirements - Handles webhook deletion
   * Location: 5.3 API DESIGN/5.3.3 Integration Requirements
   */
  const handleDeleteWebhook = useCallback(async (webhookId: string) => {
    try {
      await dispatch({ type: 'webhook/delete', payload: webhookId });
      onRefresh();
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  }, [dispatch, onRefresh]);

  /**
   * REQ: Integration Requirements - Handles webhook testing
   * Location: 5.3 API DESIGN/5.3.3 Integration Requirements
   */
  const handleTestWebhook = useCallback(async (webhook: IWebhookConfig) => {
    try {
      await dispatch({ type: 'webhook/test', payload: webhook });
    } catch (error) {
      console.error('Failed to test webhook:', error);
    }
  }, [dispatch]);

  const handleEdit = useCallback((webhook: IWebhookConfig) => {
    setSelectedWebhook(webhook);
    setIsEditDialogOpen(true);
  }, []);

  return (
    <Card
      title="Webhook Configuration"
      className="webhook-config"
      actions={
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setIsAddDialogOpen(true)}
          aria-label="Add new webhook"
        >
          Add Webhook
        </Button>
      }
    >
      <WebhookList
        onEdit={handleEdit}
      />

      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Add New Webhook"
        maxWidth="md"
        aria-labelledby="add-webhook-dialog"
      >
        <WebhookForm
          onSubmit={handleAddWebhook}
          onTest={handleTestWebhook}
          isLoading={isLoading}
        />
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedWebhook(null);
        }}
        title="Edit Webhook"
        maxWidth="md"
        aria-labelledby="edit-webhook-dialog"
      >
        {selectedWebhook && (
          <WebhookForm
            initialValues={selectedWebhook}
            onSubmit={handleEditWebhook}
            onTest={handleTestWebhook}
            isLoading={isLoading}
          />
        )}
      </Dialog>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="webhook-error"
        >
          {error}
        </div>
      )}
    </Card>
  );
});

WebhookConfig.displayName = 'WebhookConfig';

export default WebhookConfig;