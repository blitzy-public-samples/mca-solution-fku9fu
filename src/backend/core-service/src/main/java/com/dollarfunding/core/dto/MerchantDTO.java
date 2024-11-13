package com.dollarfunding.core.dto;

// Lombok - v1.18.26
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Jackson - v2.15.2
import com.fasterxml.jackson.databind.JsonNode;

// Jakarta Validation - v3.0.2
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Java Core
import java.math.BigDecimal;
import java.util.UUID;
import java.util.Objects;

// Internal imports
import com.dollarfunding.core.entities.Merchant;

/*
Human Tasks:
1. Review EIN validation rules with compliance team
2. Confirm address field validation requirements with business team
3. Set up field-level encryption for sensitive data transfer
*/

/**
 * Data Transfer Object for merchant information in the MCA application processing system.
 * Implements validation and secure handling of sensitive merchant data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MerchantDTO {

    // Requirement: Data Management - Merchant Information
    private UUID id;

    // Requirement: Form Validation - Business name validation
    @NotNull(message = "Legal name is required")
    @Size(min = 2, max = 100, message = "Legal name must be between 2 and 100 characters")
    private String legalName;

    @Size(max = 100, message = "DBA name cannot exceed 100 characters")
    private String dbaName;

    // Requirement: Data Security - Sensitive data validation
    @Pattern(regexp = "^\\d{9}$", message = "EIN must be exactly 9 digits")
    private String ein;

    // Requirement: Data Management - Address validation
    @NotNull(message = "Address is required")
    private JsonNode address;

    // Requirement: Form Validation - Industry classification
    @NotNull(message = "Industry is required")
    private String industry;

    // Requirement: Form Validation - Financial information
    @NotNull(message = "Revenue is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Revenue must be greater than zero")
    private BigDecimal revenue;

    /**
     * Creates a DTO instance from a Merchant entity with validation.
     * Requirement: Data Management - Merchant Information
     */
    public static MerchantDTO fromEntity(Merchant merchant) {
        Objects.requireNonNull(merchant, "Merchant entity cannot be null");
        merchant.validateBusinessRules();

        return MerchantDTO.builder()
                .id(merchant.getId())
                .legalName(merchant.getLegalName())
                .dbaName(merchant.getDbaName())
                .ein(merchant.getEin())
                .address(merchant.getAddress())
                .industry(merchant.getIndustry())
                .revenue(merchant.getRevenue())
                .build();
    }

    /**
     * Converts DTO to a Merchant entity with validation.
     * Requirement: Data Security - Data integrity checks
     */
    public Merchant toEntity() {
        validate();

        Merchant merchant = Merchant.builder()
                .id(this.id)
                .legalName(this.legalName)
                .dbaName(this.dbaName)
                .ein(this.ein)
                .address(this.address)
                .industry(this.industry)
                .revenue(this.revenue)
                .build();

        merchant.validateBusinessRules();
        return merchant;
    }

    /**
     * Validates DTO fields according to business rules.
     * Requirement: Form Validation - Field validation rules
     */
    public boolean validate() {
        // Validate legal name
        if (legalName == null || legalName.length() < 2 || legalName.length() > 100) {
            throw new IllegalStateException("Legal name must be between 2 and 100 characters");
        }

        // Validate EIN if provided
        if (ein != null && !ein.matches("^\\d{9}$")) {
            throw new IllegalStateException("EIN must be exactly 9 digits");
        }

        // Validate revenue
        if (revenue == null || revenue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Revenue must be greater than zero");
        }

        // Validate industry
        if (industry == null || industry.trim().isEmpty()) {
            throw new IllegalStateException("Industry must be specified");
        }

        // Validate address structure
        if (address == null || !address.has("street") || !address.has("city") || 
            !address.has("state") || !address.has("zip")) {
            throw new IllegalStateException("Address must contain street, city, state, and zip");
        }

        return true;
    }
}