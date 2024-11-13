package com.dollarfunding.core.entities;

// jakarta.persistence-api v3.1.0
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// lombok v1.18.26
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// hibernate-types-60 v2.21.1
import com.vladmihalcea.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Human Tasks:
 * 1. Configure PostgreSQL JSON column type support in application.properties
 * 2. Set up audit logging infrastructure
 * 3. Configure appropriate database indexes for status and merchantId columns
 * 4. Verify business rule thresholds with product team
 */

@Entity
@Table(name = "applications", indexes = {
    @Index(name = "idx_application_status", columnList = "status"),
    @Index(name = "idx_application_merchant", columnList = "merchantId"),
    @Index(name = "idx_application_submitted", columnList = "submittedAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "json", typeClass = JsonType.class)
@EntityListeners(AuditingEntityListener.class)
public class Application {

    // Addresses requirement: Data Management - Unique identifier for application tracking
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Addresses requirement: Application Processing - Status tracking for workflow
    @NotNull(message = "Status is required")
    @Column(nullable = false, length = 20)
    private String status;

    // Addresses requirement: Data Management - Links application to merchant
    @NotNull(message = "Merchant ID is required")
    private UUID merchantId;

    // Addresses requirement: Data Management - Tracks associated documents
    @ElementCollection
    @CollectionTable(
        name = "application_documents",
        joinColumns = @JoinColumn(name = "application_id")
    )
    @Builder.Default
    private Set<UUID> documentIds = new HashSet<>();

    // Addresses requirement: Data Management - Funding request details
    @NotNull(message = "Requested amount is required")
    @Positive(message = "Requested amount must be positive")
    @Column(precision = 19, scale = 2)
    private BigDecimal requestedAmount;

    // Addresses requirement: Application Processing - Review status tracking
    @Column(length = 20)
    private String reviewStatus;

    // Addresses requirement: Processing Time - Timestamps for SLA tracking
    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime processedAt;

    private LocalDateTime reviewedAt;

    // Addresses requirement: Data Management - Flexible metadata storage
    @Type(type = "json")
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @PrePersist
    protected void onCreate() {
        // Initialize submission timestamp
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }

        // Initialize collections if null
        if (metadata == null) {
            metadata = new HashMap<>();
        }
        if (documentIds == null) {
            documentIds = new HashSet<>();
        }

        // Validate required fields
        if (requestedAmount != null && (requestedAmount.compareTo(BigDecimal.valueOf(1000)) < 0 
            || requestedAmount.compareTo(BigDecimal.valueOf(5000000)) > 0)) {
            throw new IllegalArgumentException("Requested amount must be between $1,000 and $5,000,000");
        }

        // Set initial status
        if (status == null) {
            status = "RECEIVED";
        }

        // Add creation metadata
        metadata.put("createdAt", submittedAt.toString());
        metadata.put("version", "1.0");
        metadata.put("source", "system");
    }

    @PreUpdate
    protected void onUpdate() {
        // Update metadata
        metadata.put("lastModified", LocalDateTime.now().toString());
        metadata.put("previousStatus", status);

        // Validate state transitions
        if ("PROCESSING".equals(status) && processedAt == null) {
            processedAt = LocalDateTime.now();
        }
        if ("UNDER_REVIEW".equals(reviewStatus) && reviewedAt == null) {
            reviewedAt = LocalDateTime.now();
        }

        // Validate status transitions
        validateStatusTransition();

        // Update processing time metrics
        if (processedAt != null && submittedAt != null) {
            long processingTimeSeconds = java.time.Duration.between(submittedAt, processedAt).getSeconds();
            metadata.put("processingTimeSeconds", processingTimeSeconds);
            
            // Addresses requirement: Processing Time - Flag if exceeding 5-minute target
            if (processingTimeSeconds > 300) {
                metadata.put("slaExceeded", true);
                metadata.put("slaExceededBy", processingTimeSeconds - 300);
            }
        }
    }

    public void addDocument(UUID documentId) {
        Objects.requireNonNull(documentId, "Document ID cannot be null");
        
        documentIds.add(documentId);
        
        // Track document association
        Map<String, Object> documentLog = new HashMap<>();
        documentLog.put("documentId", documentId.toString());
        documentLog.put("associatedAt", LocalDateTime.now().toString());
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> documents = (List<Map<String, Object>>) 
            metadata.computeIfAbsent("documents", k -> new ArrayList<>());
        
        documents.add(documentLog);
    }

    public boolean validateBusinessRules() {
        // Validate requested amount range
        if (requestedAmount == null || 
            requestedAmount.compareTo(BigDecimal.valueOf(1000)) < 0 || 
            requestedAmount.compareTo(BigDecimal.valueOf(5000000)) > 0) {
            throw new IllegalStateException("Requested amount must be between $1,000 and $5,000,000");
        }

        // Validate required documents exist
        if (documentIds == null || documentIds.isEmpty()) {
            throw new IllegalStateException("At least one document is required");
        }

        // Validate merchant association
        if (merchantId == null) {
            throw new IllegalStateException("Merchant ID is required");
        }

        // Validate status
        if (status == null || !isValidStatus(status)) {
            throw new IllegalStateException("Invalid application status: " + status);
        }

        // Track validation in metadata
        Map<String, Object> validationLog = new HashMap<>();
        validationLog.put("validatedAt", LocalDateTime.now().toString());
        validationLog.put("result", "PASSED");
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> validations = (List<Map<String, Object>>) 
            metadata.computeIfAbsent("validations", k -> new ArrayList<>());
        
        validations.add(validationLog);

        return true;
    }

    private void validateStatusTransition() {
        String currentStatus = this.status;
        Set<String> validTransitions = getValidStatusTransitions(currentStatus);
        
        if (!validTransitions.contains(status)) {
            throw new IllegalStateException(
                String.format("Invalid status transition from %s to %s", currentStatus, status)
            );
        }
    }

    private Set<String> getValidStatusTransitions(String currentStatus) {
        Map<String, Set<String>> validTransitions = new HashMap<>();
        validTransitions.put("RECEIVED", Set.of("PROCESSING", "REJECTED"));
        validTransitions.put("PROCESSING", Set.of("UNDER_REVIEW", "REJECTED", "ERROR"));
        validTransitions.put("UNDER_REVIEW", Set.of("APPROVED", "REJECTED"));
        validTransitions.put("APPROVED", Set.of("FUNDED", "CANCELLED"));
        validTransitions.put("REJECTED", Set.of());
        validTransitions.put("ERROR", Set.of("PROCESSING", "REJECTED"));
        validTransitions.put("FUNDED", Set.of());
        validTransitions.put("CANCELLED", Set.of());
        
        return validTransitions.getOrDefault(currentStatus, Set.of());
    }

    private boolean isValidStatus(String status) {
        return status.matches("^(RECEIVED|PROCESSING|UNDER_REVIEW|APPROVED|REJECTED|ERROR|FUNDED|CANCELLED)$");
    }
}