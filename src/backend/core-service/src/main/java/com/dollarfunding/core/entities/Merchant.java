package com.dollarfunding.core.entities;

// Jakarta Persistence API - v3.1.0
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

// Lombok - v1.18.26
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Hibernate Types - v2.21.1
import com.vladmihalcea.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

// Jackson - v2.15.2
import com.fasterxml.jackson.databind.JsonNode;

// Java Core - v17
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/*
Human Tasks:
1. Configure AWS KMS key for field-level encryption
2. Set up audit logging infrastructure
3. Configure data retention policies in infrastructure
4. Verify EIN validation rules with business team
*/

@Entity
@Table(name = "merchants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TypeDef(name = "json", typeClass = JsonType.class)
@EntityListeners(AuditingEntityListener.class)
public class Merchant {

    // Requirement: Data Management - Merchant Information
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Requirement: Form Validation - Business name (2-100 chars)
    @NotNull
    @Size(min = 2, max = 100, message = "Legal name must be between 2 and 100 characters")
    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Size(max = 100)
    @Column(name = "dba_name")
    private String dbaName;

    // Requirement: Form Validation - EIN (9 digits with checksum)
    @Pattern(regexp = "^\\d{9}$", message = "EIN must be exactly 9 digits")
    @Column(name = "ein", length = 9)
    private String ein;

    // Requirement: Data Management - Business Details
    @Type(type = "json")
    @Column(name = "address", columnDefinition = "jsonb")
    private JsonNode address;

    @NotNull
    @Column(name = "industry", nullable = false)
    private String industry;

    // Requirement: Data Management - Financial Data
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "revenue", precision = 19, scale = 2)
    private BigDecimal revenue;

    @Builder.Default
    @Column(name = "application_ids")
    @ElementCollection
    @CollectionTable(name = "merchant_applications", joinColumns = @JoinColumn(name = "merchant_id"))
    private Set<UUID> applicationIds = new HashSet<>();

    // Requirement: Data Retention - 7-year retention policy
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Type(type = "json")
    @Column(name = "metadata", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();

    @PrePersist
    protected void onCreate() {
        // Requirement: Data Management - Audit Logging
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        
        if (this.metadata == null) {
            this.metadata = new HashMap<>();
        }
        
        if (this.applicationIds == null) {
            this.applicationIds = new HashSet<>();
        }
        
        // Add creation audit metadata
        this.metadata.put("created_timestamp", now.toString());
        this.metadata.put("creation_source", "system");
        
        validateBusinessRules();
    }

    @PreUpdate
    protected void onUpdate() {
        // Requirement: Data Management - Change Tracking
        LocalDateTime now = LocalDateTime.now();
        this.updatedAt = now;
        
        // Track field changes in metadata
        Map<String, Object> changeLog = new HashMap<>();
        changeLog.put("update_timestamp", now.toString());
        changeLog.put("previous_update", this.metadata.get("last_update"));
        
        this.metadata.put("last_update", now.toString());
        this.metadata.put("change_history", changeLog);
        
        validateBusinessRules();
    }

    public void addApplication(UUID applicationId) {
        // Requirement: Data Management - Application Relationships
        Objects.requireNonNull(applicationId, "Application ID cannot be null");
        
        this.applicationIds.add(applicationId);
        
        // Track application association
        Map<String, Object> applicationLog = new HashMap<>();
        applicationLog.put("application_id", applicationId.toString());
        applicationLog.put("association_timestamp", LocalDateTime.now().toString());
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> applications = (List<Map<String, Object>>) 
            this.metadata.computeIfAbsent("applications", k -> new ArrayList<>());
        
        applications.add(applicationLog);
    }

    public boolean validateBusinessRules() {
        // Requirement: Form Validation
        if (legalName == null || legalName.length() < 2 || legalName.length() > 100) {
            throw new IllegalStateException("Legal name must be between 2 and 100 characters");
        }

        // Validate EIN if provided
        if (ein != null) {
            if (!ein.matches("^\\d{9}$")) {
                throw new IllegalStateException("EIN must be exactly 9 digits");
            }
            // Additional checksum validation could be added here
        }

        // Validate revenue
        if (revenue == null || revenue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Revenue must be greater than zero");
        }

        // Validate industry
        if (industry == null || industry.trim().isEmpty()) {
            throw new IllegalStateException("Industry must be specified");
        }

        // Validate address if provided
        if (address != null) {
            if (!address.has("street") || !address.has("city") || 
                !address.has("state") || !address.has("zip")) {
                throw new IllegalStateException("Address must contain street, city, state, and zip");
            }
        }

        return true;
    }
}