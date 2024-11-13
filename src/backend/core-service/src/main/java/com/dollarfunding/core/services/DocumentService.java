package com.dollarfunding.core.services;

// Spring Framework v6.0.9
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// Lombok v1.18.26
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// Project imports
import com.dollarfunding.core.entities.Document;
import com.dollarfunding.core.repositories.DocumentRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Human Tasks:
 * 1. Configure transaction management settings in application.properties
 * 2. Set up appropriate logging levels for document operations
 * 3. Configure document size limits and allowed types in application configuration
 * 4. Set up monitoring for document processing operations
 */

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;

    /**
     * Creates a new document record for an application with initial metadata.
     * Addresses requirement: Document Management - Secure storage of application documents
     *
     * @param applicationId The UUID of the application
     * @param type The document type
     * @param storagePath The secure storage path
     * @return Created document entity
     */
    public Document createDocument(UUID applicationId, String type, String storagePath) {
        log.info("Creating new document for application: {}, type: {}", applicationId, type);

        if (applicationId == null || type == null || storagePath == null) {
            throw new IllegalArgumentException("Application ID, type, and storage path are required");
        }

        Map<String, Object> initialMetadata = new HashMap<>();
        initialMetadata.put("originalFileName", storagePath.substring(storagePath.lastIndexOf('/') + 1));
        initialMetadata.put("uploadTimestamp", LocalDateTime.now().toString());
        initialMetadata.put("processingStatus", "PENDING");

        Document document = Document.builder()
                .applicationId(applicationId)
                .type(type)
                .storagePath(storagePath)
                .status("UPLOADED")
                .metadata(initialMetadata)
                .build();

        Document savedDocument = documentRepository.save(document);
        log.debug("Document created successfully with ID: {}", savedDocument.getId());
        
        return savedDocument;
    }

    /**
     * Retrieves all documents for a specific application with pagination.
     * Addresses requirement: Data Domains - MCA applications document management
     *
     * @param applicationId The UUID of the application
     * @param pageable Pagination parameters
     * @return Page of documents for the application
     */
    public Page<Document> getApplicationDocuments(UUID applicationId, Pageable pageable) {
        log.debug("Retrieving documents for application: {}", applicationId);

        if (applicationId == null) {
            throw new IllegalArgumentException("Application ID cannot be null");
        }

        return documentRepository.findByApplicationId(applicationId, pageable);
    }

    /**
     * Updates document classification and metadata after AI processing.
     * Addresses requirement: Document Processing - Document classification and data extraction
     *
     * @param documentId The UUID of the document
     * @param classification The AI-determined classification
     * @param extractedData The data extracted from the document
     * @return Updated document entity
     */
    public Document updateDocumentClassification(UUID documentId, String classification, Map<String, Object> extractedData) {
        log.info("Updating classification for document: {}", documentId);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + documentId));

        try {
            document.updateClassification(classification, extractedData);
            Document updatedDocument = documentRepository.save(document);
            log.info("Document classification updated successfully. ID: {}, Classification: {}", 
                    documentId, classification);
            return updatedDocument;
        } catch (IllegalArgumentException e) {
            log.error("Failed to update document classification. ID: {}, Error: {}", documentId, e.getMessage());
            throw e;
        }
    }

    /**
     * Retrieves documents of a specific type with pagination support.
     * Addresses requirement: Document Management - Document type-based retrieval
     *
     * @param type The document type
     * @param pageable Pagination parameters
     * @return Page of documents of specified type
     */
    public Page<Document> getDocumentsByType(String type, Pageable pageable) {
        log.debug("Retrieving documents of type: {}", type);

        if (type == null || type.trim().isEmpty()) {
            throw new IllegalArgumentException("Document type cannot be null or empty");
        }

        return documentRepository.findByType(type, pageable);
    }
}