package com.dollarfunding.core.entities;

// jakarta.persistence-api v3.1.0
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

// lombok v1.18.26
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// hibernate-types-60 v2.21.1
import com.vladmihalcea.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Human Tasks:
 * 1. Ensure PostgreSQL JSON column type support is configured in application.properties
 * 2. Configure S3 bucket permissions for document storage
 * 3. Set up appropriate database indexes for applicationId and status columns
 * 4. Configure document classification service integration
 */

@Entity
@Table(name = "documents", indexes = {
    @Index(name = "idx_document_application_id", columnList = "applicationId"),
    @Index(name = "idx_document_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "json", typeClass = JsonType.class)
public class Document {

    // Addresses requirement: Data Security - Unique identifier for secure document reference
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Addresses requirement: Data Domains - Links document to specific MCA application
    @NotNull(message = "Application ID is required")
    private UUID applicationId;

    // Addresses requirement: Document Classification - Stores document type (e.g., "ISO_APPLICATION", "BANK_STATEMENT")
    @NotNull(message = "Document type is required")
    @Column(length = 50)
    private String type;

    // Addresses requirement: Data Security - Secure storage path in S3
    @NotNull(message = "Storage path is required")
    @Column(length = 512)
    private String storagePath;

    // Addresses requirement: Document Classification - AI-determined document classification
    @Column(length = 100)
    private String classification;

    // Addresses requirement: Document Processing - Tracking document lifecycle
    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    private LocalDateTime processedAt;

    // Document processing status (UPLOADED, PROCESSING, CLASSIFIED, ERROR)
    @NotNull(message = "Status is required")
    @Column(length = 20)
    private String status;

    // Addresses requirement: Document Processing - Stores extracted metadata and processing results
    @Type(type = "json")
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @PrePersist
    protected void onCreate() {
        // Initialize upload timestamp
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }

        // Initialize metadata map if null
        if (metadata == null) {
            metadata = new HashMap<>();
        }

        // Set initial status if not specified
        if (status == null) {
            status = "UPLOADED";
        }

        // Add basic metadata
        metadata.put("createdAt", uploadedAt.toString());
        metadata.put("version", "1.0");
    }

    @PreUpdate
    protected void onUpdate() {
        // Update metadata version
        metadata.put("lastModified", LocalDateTime.now().toString());
        int version = metadata.containsKey("version") ? 
            Integer.parseInt(metadata.get("version").toString().split("\\.")[0]) + 1 : 1;
        metadata.put("version", version + ".0");

        // Validate state transitions
        if ("CLASSIFIED".equals(status) && classification == null) {
            throw new IllegalStateException("Classification must be set when status is CLASSIFIED");
        }

        // Update processing timestamp when status changes to PROCESSED
        if ("PROCESSED".equals(status) && processedAt == null) {
            processedAt = LocalDateTime.now();
        }
    }

    /**
     * Updates document classification and metadata after AI processing
     * Addresses requirement: Document Classification - AI-powered classification
     */
    public void updateClassification(String classification, Map<String, Object> extractedData) {
        if (classification == null || classification.trim().isEmpty()) {
            throw new IllegalArgumentException("Classification cannot be null or empty");
        }

        this.classification = classification;
        this.status = "CLASSIFIED";
        this.processedAt = LocalDateTime.now();

        // Update metadata with AI processing results
        metadata.put("classificationTimestamp", processedAt.toString());
        metadata.put("extractedData", extractedData);
        metadata.put("classificationType", "AI");
        
        // Validate classification against allowed types
        if (!isValidClassification(classification)) {
            throw new IllegalArgumentException("Invalid classification type: " + classification);
        }
    }

    private boolean isValidClassification(String classification) {
        return classification.matches("^(ISO_APPLICATION|BANK_STATEMENT|BUSINESS_LICENSE|TAX_RETURN|VOIDED_CHECK|OTHER)$");
    }
}