// @reduxjs/toolkit v1.9.5

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WebhookConfig, WebhookDelivery } from '../../interfaces/webhook.interface';
import { configureWebhook } from '../../services/api.service';

/**
 * Human Tasks:
 * 1. Configure error tracking service to monitor webhook operation failures
 * 2. Set up monitoring alerts for webhook delivery success rates
 * 3. Review and adjust webhook timeout settings based on production metrics
 */

/**
 * REQ: Webhook Configuration - State interface for webhook management
 * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
 */
interface WebhookState {
  webhooks: WebhookConfig[];
  deliveries: WebhookDelivery[];
  loading: boolean;
  error: string | null;
  selectedWebhook: WebhookConfig | null;
}

const initialState: WebhookState = {
  webhooks: [],
  deliveries: [],
  loading: false,
  error: null,
  selectedWebhook: null
};

/**
 * REQ: Integration Layer - Async thunk for fetching webhooks
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
export const fetchWebhooks = createAsyncThunk(
  'webhooks/fetchWebhooks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/webhooks');
      if (!response.ok) throw new Error('Failed to fetch webhooks');
      return await response.json() as WebhookConfig[];
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * REQ: Webhook Configuration - Async thunk for creating webhooks
 * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
 */
export const createWebhook = createAsyncThunk(
  'webhooks/createWebhook',
  async (config: Omit<WebhookConfig, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await configureWebhook(config as WebhookConfig);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * REQ: Webhook Configuration - Async thunk for updating webhooks
 * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
 */
export const updateWebhook = createAsyncThunk(
  'webhooks/updateWebhook',
  async (config: WebhookConfig, { rejectWithValue }) => {
    try {
      return await configureWebhook(config);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * REQ: Webhook Configuration - Async thunk for deleting webhooks
 * Location: 5.1 USER INTERFACE DESIGN/5.1.4 Webhook Configuration
 */
export const deleteWebhook = createAsyncThunk(
  'webhooks/deleteWebhook',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/webhooks/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete webhook');
      return id;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**
 * REQ: Integration Layer - Redux slice for webhook management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
export const webhookSlice = createSlice({
  name: 'webhooks',
  initialState,
  reducers: {
    setSelectedWebhook: (state, action: PayloadAction<WebhookConfig | null>) => {
      state.selectedWebhook = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch webhooks
    builder.addCase(fetchWebhooks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWebhooks.fulfilled, (state, action) => {
      state.loading = false;
      state.webhooks = action.payload;
    });
    builder.addCase(fetchWebhooks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Create webhook
    builder.addCase(createWebhook.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createWebhook.fulfilled, (state, action) => {
      state.loading = false;
      state.webhooks.push(action.payload);
    });
    builder.addCase(createWebhook.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update webhook
    builder.addCase(updateWebhook.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateWebhook.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.webhooks.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.webhooks[index] = action.payload;
      }
    });
    builder.addCase(updateWebhook.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete webhook
    builder.addCase(deleteWebhook.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteWebhook.fulfilled, (state, action) => {
      state.loading = false;
      state.webhooks = state.webhooks.filter(w => w.id !== action.payload);
      if (state.selectedWebhook?.id === action.payload) {
        state.selectedWebhook = null;
      }
    });
    builder.addCase(deleteWebhook.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setSelectedWebhook, clearError } = webhookSlice.actions;
export const webhookReducer = webhookSlice.reducer;