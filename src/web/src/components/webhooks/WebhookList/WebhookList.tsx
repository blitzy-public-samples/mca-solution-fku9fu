// react v18.x
import React, { useEffect, useCallback } from 'react';
// react-redux v8.x
import { useDispatch, useSelector } from 'react-redux';
// @mui/material v5.14.x
import { IconButton, Tooltip, Box } from '@mui/material';
// @mui/icons-material v5.14.x
import { Delete, Edit } from '@mui/icons-material';

import { Column, DataTableProps } from '../../common/DataTable/DataTable';
import { WebhookConfig, WebhookEventType } from '../../../interfaces/webhook.interface';
import { fetchWebhooks, deleteWebhook } from '../../../redux/slices/webhookSlice';

/*
Human Tasks:
1. Configure webhook monitoring alerts in production environment
2. Set up error tracking for webhook delivery failures
3. Review and test webhook deletion confirmation flow with UX team
*/

interface WebhookListProps {
  onEdit: (webhook: WebhookConfig) => void;
}

/**
 * REQ: Webhook Configuration UI - Component for displaying and managing webhooks
 * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
 */
const WebhookList: React.FC<WebhookListProps> = ({ onEdit }) => {
  const dispatch = useDispatch();
  const webhooks = useSelector((state: any) => state.webhook.webhooks);
  const loading = useSelector((state: any) => state.webhook.loading);

  useEffect(() => {
    // REQ: Integration Layer - Fetch webhook configurations on component mount
    dispatch(fetchWebhooks());
  }, [dispatch]);

  const handleDelete = useCallback(async (webhookId: string) => {
    if (window.confirm('Are you sure you want to delete this webhook configuration?')) {
      try {
        await dispatch(deleteWebhook(webhookId));
        dispatch(fetchWebhooks());
      } catch (error) {
        console.error('Failed to delete webhook:', error);
      }
    }
  }, [dispatch]);

  const columns: Column[] = [
    {
      id: 'url',
      label: 'Endpoint URL',
      accessor: 'url',
      width: '30%',
      render: (value: string) => (
        <Tooltip title={value} placement="top">
          <span>{value}</span>
        </Tooltip>
      )
    },
    {
      id: 'events',
      label: 'Events',
      accessor: 'events',
      width: '25%',
      render: (events: WebhookEventType[]) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {events.map((event) => (
            <Box
              key={event}
              sx={{
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: '0.75rem'
              }}
            >
              {event}
            </Box>
          ))}
        </Box>
      )
    },
    {
      id: 'active',
      label: 'Status',
      accessor: 'active',
      width: '15%',
      render: (active: boolean) => (
        <Box
          sx={{
            backgroundColor: active ? 'success.light' : 'error.light',
            color: active ? 'success.contrastText' : 'error.contrastText',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            textAlign: 'center',
            width: 'fit-content'
          }}
        >
          {active ? 'Active' : 'Inactive'}
        </Box>
      )
    },
    {
      id: 'createdAt',
      label: 'Created',
      accessor: 'createdAt',
      width: '15%',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      id: 'actions',
      label: 'Actions',
      accessor: 'id',
      width: '15%',
      render: (id: string, row: WebhookConfig) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Edit webhook">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              aria-label="edit webhook"
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete webhook">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(id);
              }}
              aria-label="delete webhook"
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  const tableProps: DataTableProps = {
    data: webhooks,
    columns,
    loading,
    sortable: true,
    filterable: true,
    paginated: true,
    pageSize: 10
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <DataTable {...tableProps} />
    </Box>
  );
};

export default WebhookList;