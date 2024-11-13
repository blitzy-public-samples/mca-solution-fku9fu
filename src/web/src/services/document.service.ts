// @package axios@1.4.0

/**
 * Human Tasks:
 * 1. Ensure AWS S3 bucket CORS configuration allows direct uploads via presigned URLs
 * 2. Configure document size limits in the backend API to match frontend MAX_UPLOAD_SIZE
 * 3. Set up appropriate virus scanning and file type validation on the backend
 */

import { Document, DocumentType, DocumentUploadResponse } from '../interfaces/document.interface';
import { apiClient, handleApiError } from '../config/api.config';
import axios from 'axios';

/**
 * Maximum file size for document uploads (10MB)
 * Aligned with backend configuration
 */
const MAX_UPLOAD_SIZE = 10485760;

/**
 * Service class for managing document operations in the MCA application
 * Implements Document Management requirement from 2. SYSTEM OVERVIEW/High-Level Description
 */
export class DocumentService {
    private readonly apiClient;

    constructor() {
        this.apiClient = apiClient;
    }

    /**
     * Uploads a document file and initiates AI processing
     * Implements Document Management requirement from 2. SYSTEM OVERVIEW/High-Level Description
     * 
     * @param file - The file to upload
     * @param type - The type of document being uploaded
     * @returns Promise with upload response containing document info and presigned URL
     * @throws Error if file size exceeds limit or upload fails
     */
    async uploadDocument(file: File, type: DocumentType): Promise<DocumentUploadResponse> {
        try {
            // Validate file size
            if (file.size > MAX_UPLOAD_SIZE) {
                throw new Error(`File size exceeds maximum limit of ${MAX_UPLOAD_SIZE / 1048576}MB`);
            }

            // Create form data for upload
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            // Get presigned URL and document metadata
            const response = await this.apiClient.post<DocumentUploadResponse>(
                '/api/v1/documents/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Upload file directly to S3 using presigned URL
            await axios.put(response.data.presignedUrl, file, {
                headers: {
                    'Content-Type': file.type,
                    'Content-Length': file.size.toString()
                }
            });

            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Downloads a document using its ID
     * Implements Document Management requirement from 2. SYSTEM OVERVIEW/High-Level Description
     * 
     * @param documentId - ID of the document to download
     * @returns Promise with document blob
     * @throws Error if download fails
     */
    async downloadDocument(documentId: string): Promise<Blob> {
        try {
            const response = await this.apiClient.get(`/api/v1/documents/${documentId}/download`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Retrieves document information by ID
     * Implements Document Management requirement from 2. SYSTEM OVERVIEW/High-Level Description
     * 
     * @param documentId - ID of the document to retrieve
     * @returns Promise with document information
     * @throws Error if retrieval fails
     */
    async getDocumentById(documentId: string): Promise<Document> {
        try {
            const response = await this.apiClient.get<Document>(`/api/v1/documents/${documentId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Initiates AI-powered document processing for classification and data extraction
     * Implements Document Processing requirement from 3. SCOPE/Core Features and Functionalities
     * 
     * @param documentId - ID of the document to process
     * @returns Promise with updated document information including classification results
     * @throws Error if processing fails
     */
    async processDocument(documentId: string): Promise<Document> {
        try {
            const response = await this.apiClient.post<Document>(
                `/api/v1/documents/${documentId}/process`
            );
            return response.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}