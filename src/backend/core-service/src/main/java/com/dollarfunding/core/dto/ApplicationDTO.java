package com.dollarfunding.core.dto;

// Lombok - v1.18.26
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Jackson - v2.14.2
import com.fasterxml.jackson.annotation.JsonInclude;

// Jakarta Validation - v3.0.2
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Java Core
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/*
Human Tasks:
1. Configure environment-specific validation rules for requested amounts
2. Set up metadata field validation rules with business team
3. Review document validation requirements for different application statuses
*/

/**
 * Data Transfer Object for MCA applications with validation and transformation capabilities.
 * Implements comprehensive validation rules and handles data transfer between service layer and API controllers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicationDTO {

    // Requirement: Application Data Management - Unique identifier for applications
    private UUID id;

    // Requirement: Data Management - Application status tracking
    @NotNull(message = "Status is required")
    private String status;

    // Requirement: Data Management - Audit trail timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Requirement: Data Management - Review status tracking
    private String reviewStatus;

    // Requirement: Form Validation Rules - Currency amount validation
    @NotNull(message = "Requested amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Requested amount must be greater than zero")
    private BigDecimal requestedAmount;

    // Requirement: Data Management - Merchant information
    @NotNull(message = "Merchant information is required")
    private MerchantDTO merchant;

    // Requirement: Data Management - Document tracking
    @Size(min = 1, message = "At least one document is required for submitted applications")
    private List<UUID> documentIds;

    // Requirement: Data Management - Additional application metadata
    private Map<String, Object> metadata;

    /**
     * Validates the application data according to business rules.
     * Requirement: Form Validation Rules - Comprehensive validation
     */
    public boolean validate() {
        // Validate status values
        if (status != null && !isValidStatus(status)) {
            throw new IllegalStateException("Invalid status. Must be one of: DRAFT, SUBMITTED, APPROVED, REJECTED");
        }

        // Validate requested amount format and value
        if (requestedAmount != null) {
            if (requestedAmount.scale() > 2) {
                throw new IllegalStateException("Requested amount cannot have more than 2 decimal places");
            }
        }

        // Validate merchant data if present
        if (merchant != null) {
            merchant.validate();
            
            // Validate merchant revenue against requested amount
            if (requestedAmount != null && merchant.getRevenue() != null) {
                if (requestedAmount.compareTo(merchant.getRevenue().multiply(new BigDecimal("0.2"))) > 0) {
                    throw new IllegalStateException("Requested amount cannot exceed 20% of annual revenue");
                }
            }
        }

        // Validate timestamps
        LocalDateTime now = LocalDateTime.now();
        if (createdAt != null && createdAt.isAfter(now)) {
            throw new IllegalStateException("Created date cannot be in the future");
        }
        if (updatedAt != null && updatedAt.isAfter(now)) {
            throw new IllegalStateException("Updated date cannot be in the future");
        }

        // Validate required metadata fields
        if (metadata != null) {
            validateMetadata();
        }

        // Validate documents for submitted applications
        if ("SUBMITTED".equals(status)) {
            if (documentIds == null || documentIds.isEmpty()) {
                throw new IllegalStateException("Submitted applications must have at least one document");
            }
        }

        return true;
    }

    /**
     * Creates a DTO from an Application entity.
     * Requirement: Application Data Management - Entity to DTO conversion
     */
    public static ApplicationDTO fromEntity(Application entity) {
        if (entity == null) {
            throw new IllegalArgumentException("Application entity cannot be null");
        }

        ApplicationDTO dto = ApplicationDTO.builder()
                .id(entity.getId())
                .status(entity.getStatus())
                .reviewStatus(entity.getReviewStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .requestedAmount(entity.getRequestedAmount())
                .merchant(entity.getMerchant() != null ? MerchantDTO.fromEntity(entity.getMerchant()) : null)
                .documentIds(entity.getDocuments().stream()
                        .map(doc -> doc.getId())
                        .toList())
                .metadata(entity.getMetadata())
                .build();

        // Validate the created DTO
        dto.validate();
        return dto;
    }

    /**
     * Validates the metadata map according to business rules.
     * Requirement: Form Validation Rules - Metadata validation
     */
    private void validateMetadata() {
        // Required metadata fields based on application status
        List<String> requiredFields = switch(status) {
            case "SUBMITTED" -> List.of("submittedBy", "submissionDate", "brokerCode");
            case "APPROVED" -> List.of("approvedBy", "approvalDate", "terms");
            case "REJECTED" -> List.of("rejectedBy", "rejectionDate", "reason");
            default -> List.of();
        };

        for (String field : requiredFields) {
            if (!metadata.containsKey(field) || metadata.get(field) == null) {
                throw new IllegalStateException("Required metadata field missing: " + field);
            }
        }
    }

    /**
     * Validates if the given status is one of the allowed values.
     * Requirement: Form Validation Rules - Status validation
     */
    private boolean isValidStatus(String status) {
        return List.of("DRAFT", "SUBMITTED", "APPROVED", "REJECTED")
                .contains(status);
    }
}