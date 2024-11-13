/**
 * Human Tasks:
 * 1. Ensure Redux DevTools is configured in the store for development environment
 * 2. Configure appropriate Redux state persistence if needed
 * 3. Set up error tracking service integration for monitoring Redux errors
 */

// @package @reduxjs/toolkit@1.9.5
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Document, DocumentType, DocumentClassification } from '../../interfaces/document.interface';
import { DocumentService } from '../../services/document.service';

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Interface for the document slice state
 */
interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
  currentUploadProgress: Record<string, number>;
}

const initialState: DocumentState = {
  documents: [],
  loading: false,
  error: null,
  currentUploadProgress: {}
};

// Create document service instance
const documentService = new DocumentService();

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Async thunk for uploading documents
 */
export const uploadDocument = createAsyncThunk(
  'documents/upload',
  async (payload: { file: File; type: DocumentType }, { rejectWithValue }) => {
    try {
      const response = await documentService.uploadDocument(payload.file, payload.type);
      return response.document;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Upload failed');
    }
  }
);

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Async thunk for downloading documents
 */
export const downloadDocument = createAsyncThunk(
  'documents/download',
  async (documentId: string, { rejectWithValue }) => {
    try {
      return await documentService.downloadDocument(documentId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Download failed');
    }
  }
);

/**
 * Requirement: Document Processing
 * Location: 3. SCOPE/Core Features and Functionalities
 * Async thunk for processing documents
 */
export const processDocument = createAsyncThunk(
  'documents/process',
  async (documentId: string, { rejectWithValue }) => {
    try {
      return await documentService.processDocument(documentId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Processing failed');
    }
  }
);

/**
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Document slice with reducers and actions
 */
const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setUploadProgress: (state, action: PayloadAction<{ documentId: string; progress: number }>) => {
      state.currentUploadProgress[action.payload.documentId] = action.payload.progress;
    },
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.currentUploadProgress[action.payload];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Upload document reducers
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.documents.push(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Process document reducers
    builder
      .addCase(processDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processDocument.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.documents.findIndex(doc => doc.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
      })
      .addCase(processDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Download document reducers
    builder
      .addCase(downloadDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadDocument.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

// Export actions
export const { setUploadProgress, clearUploadProgress, clearError } = documentSlice.actions;

// Export selectors
export const selectDocuments = (state: { documents: DocumentState }): Document[] => 
  state.documents.documents;

export const selectDocumentById = (
  state: { documents: DocumentState },
  documentId: string
): Document | undefined => 
  state.documents.documents.find(doc => doc.id === documentId);

export const selectUploadProgress = (
  state: { documents: DocumentState },
  documentId: string
): number => 
  state.documents.currentUploadProgress[documentId] || 0;

export const selectDocumentLoading = (state: { documents: DocumentState }): boolean => 
  state.documents.loading;

export const selectDocumentError = (state: { documents: DocumentState }): string | null => 
  state.documents.error;

// Export reducer
export default documentSlice.reducer;