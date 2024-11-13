// @package axios@1.4.0

/**
 * Human Tasks:
 * 1. Ensure AWS S3 bucket CORS configuration allows direct uploads from the web frontend
 * 2. Configure document size limits in the backend API to match frontend MAX_UPLOAD_SIZE
 * 3. Set up proper IAM roles and permissions for S3 bucket access
 */

import { apiClient } from '../config/api.config';
import { Document, DocumentUploadResponse } from '../interfaces/document.interface';
import axios from 'axios';

/**
 * Maximum allowed file size for upload (10MB)
 * Implements Document Management requirement for secure file handling
 */
const MAX_UPLOAD_SIZE = 10485760;

/**
 * Service responsible for handling document storage operations
 * Implements Document Management requirement from 2. SYSTEM OVERVIEW/High-Level Description
 */
const StorageService = {
  /**
   * Uploads a document file to the storage service using presigned URL with size validation
   * Implements Document Processing requirement from 3. SCOPE/Core Features and Functionalities
   */
  uploadDocument: async (file: File, metadata: Record<string, any>): Promise<Document> => {
    // Validate file size
    if (file.size > MAX_UPLOAD_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MAX_UPLOAD_SIZE} bytes`);
    }

    try {
      // Request presigned URL from API
      const response = await apiClient.post<DocumentUploadResponse>('/api/v1/documents/upload', {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        metadata
      });

      const { document, presignedUrl } = response.data;

      // Upload file directly to storage using presigned URL
      await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
          'Content-Length': file.size.toString()
        },
        maxBodyLength: MAX_UPLOAD_SIZE,
        maxContentLength: MAX_UPLOAD_SIZE
      });

      return document;
    } catch (error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  },

  /**
   * Downloads a document file using its ID via temporary URL
   * Implements Document Management requirement from 2. SYSTEM OVERVIEW/High-Level Description
   */
  downloadDocument: async (documentId: string): Promise<Blob> => {
    try {
      // Request download URL from API
      const response = await apiClient.get<{ url: string }>(`/api/v1/documents/${documentId}/download`);
      
      // Download file using temporary URL
      const fileResponse = await axios.get(response.data.url, {
        responseType: 'blob'
      });

      return fileResponse.data;
    } catch (error) {
      throw new Error(`Failed to download document: ${error.message}`);
    }
  },

  /**
   * Retrieves a temporary URL for document preview with expiration
   * Implements Document Management requirement from 2. SYSTEM OVERVIEW/High-Level Description
   */
  getDocumentUrl: async (documentId: string): Promise<string> => {
    try {
      const response = await apiClient.get<{ url: string }>(`/api/v1/documents/${documentId}/url`);
      return response.data.url;
    } catch (error) {
      throw new Error(`Failed to get document URL: ${error.message}`);
    }
  },

  /**
   * Deletes a document from storage permanently
   * Implements Document Management requirement from 2. SYSTEM OVERVIEW/High-Level Description
   */
  deleteDocument: async (documentId: string): Promise<void> => {
    try {
      await apiClient.delete(`/api/v1/documents/${documentId}`);
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }
};

export default StorageService;