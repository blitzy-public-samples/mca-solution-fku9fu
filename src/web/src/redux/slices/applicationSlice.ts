// @reduxjs/toolkit@1.9.5

/**
 * Human Tasks:
 * 1. Configure Redux DevTools in development environment
 * 2. Set up error tracking service integration for async operations
 * 3. Review and adjust pagination limits based on performance metrics
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Application, ApplicationStatus } from '../../interfaces/application.interface';
import { getApplications, getApplicationById } from '../../services/api.service';

/**
 * REQ: Data Management - State interface for application data
 * Location: 3. SCOPE/Core Features and Functionalities
 */
interface ApplicationState {
  applications: Application[];
  currentApplication: Application | null;
  totalApplications: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationState = {
  applications: [],
  currentApplication: null,
  totalApplications: 0,
  currentPage: 1,
  loading: false,
  error: null
};

/**
 * REQ: Application Processing - Async thunk for fetching applications
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
export const fetchApplications = createAsyncThunk(
  'application/fetchApplications',
  async (params: { 
    page: number; 
    limit: number; 
    status?: ApplicationStatus 
  }, { rejectWithValue }) => {
    try {
      const response = await getApplications(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch applications');
    }
  }
);

/**
 * REQ: Data Management - Async thunk for fetching single application
 * Location: 3. SCOPE/Core Features and Functionalities
 */
export const fetchApplicationById = createAsyncThunk(
  'application/fetchApplicationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getApplicationById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch application details');
    }
  }
);

/**
 * REQ: User Interface - Application slice for state management
 * Location: 5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN
 */
const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Applications List
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action: PayloadAction<{
        data: Application[];
        total: number;
        page: number;
      }>) => {
        state.loading = false;
        state.applications = action.payload.data;
        state.totalApplications = action.payload.total;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Fetch Single Application
      .addCase(fetchApplicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationById.fulfilled, (state, action: PayloadAction<Application>) => {
        state.loading = false;
        state.currentApplication = action.payload;
      })
      .addCase(fetchApplicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { clearCurrentApplication, clearError } = applicationSlice.actions;

// Selectors
export const selectApplications = (state: { application: ApplicationState }) => 
  state.application.applications;

export const selectCurrentApplication = (state: { application: ApplicationState }) => 
  state.application.currentApplication;

export const selectApplicationsLoading = (state: { application: ApplicationState }) => 
  state.application.loading;

export const selectApplicationsError = (state: { application: ApplicationState }) => 
  state.application.error;

export const selectTotalApplications = (state: { application: ApplicationState }) => 
  state.application.totalApplications;

export const selectCurrentPage = (state: { application: ApplicationState }) => 
  state.application.currentPage;

// Export reducer as default
export default applicationSlice.reducer;