package com.dollarfunding.core.repositories;

// Spring Data JPA v3.1.0
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.dollarfunding.core.entities.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for Document entity providing data access operations and custom queries.
 * Addresses requirements:
 * - Document Management: AI-powered classification and secure storage of application documents
 * - Document Processing: Document classification, OCR processing, Data extraction
 * - Data Domains: MCA applications, Bank statements, Business documentation
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {

    /**
     * Retrieves all documents associated with a specific application with pagination support.
     * Addresses requirement: Data Domains - MCA applications document management
     *
     * @param applicationId The UUID of the application
     * @param pageable Pagination and sorting parameters
     * @return Page of documents for the specified application
     */
    Page<Document> findByApplicationId(UUID applicationId, Pageable pageable);

    /**
     * Retrieves all documents of a specific type with pagination support.
     * Addresses requirement: Document Management - Document type-based retrieval
     *
     * @param type The document type (e.g., "ISO_APPLICATION", "BANK_STATEMENT")
     * @param pageable Pagination and sorting parameters
     * @return Page of documents of the specified type
     */
    Page<Document> findByType(String type, Pageable pageable);

    /**
     * Retrieves all documents with a specific classification with pagination support.
     * Addresses requirement: Document Processing - AI-powered classification retrieval
     *
     * @param classification The AI-determined document classification
     * @param pageable Pagination and sorting parameters
     * @return Page of documents with the specified classification
     */
    Page<Document> findByClassification(String classification, Pageable pageable);

    /**
     * Retrieves documents uploaded within a specific date range with pagination support.
     * Addresses requirement: Document Management - Time-based document retrieval
     *
     * @param startDate Start of the date range
     * @param endDate End of the date range
     * @param pageable Pagination and sorting parameters
     * @return Page of documents uploaded within the specified date range
     */
    Page<Document> findByUploadedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    /**
     * Retrieves documents of a specific type for a given application.
     * Addresses requirement: Data Domains - Application-specific document retrieval
     *
     * @param applicationId The UUID of the application
     * @param type The document type
     * @return List of matching documents
     */
    List<Document> findByApplicationIdAndType(UUID applicationId, String type);

    /**
     * Counts the total number of documents associated with an application.
     * Addresses requirement: Document Management - Application document tracking
     *
     * @param applicationId The UUID of the application
     * @return Count of documents for the specified application
     */
    long countByApplicationId(UUID applicationId);
}