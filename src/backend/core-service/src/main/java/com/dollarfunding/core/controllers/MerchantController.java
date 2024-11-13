package com.dollarfunding.core.controllers;

// Spring Web - v6.0.11
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// Spring Security - v6.0.9
import org.springframework.security.access.prepost.PreAuthorize;

// Jakarta Validation - v3.0.2
import jakarta.validation.Valid;

// Lombok - v1.18.26
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

// Java Core
import java.util.UUID;
import java.util.Optional;

// Application Components
import com.dollarfunding.core.services.MerchantService;
import com.dollarfunding.core.dto.MerchantDTO;

/*
Human Tasks:
1. Configure Spring Security roles (OPERATIONS, API)
2. Set up API documentation with OpenAPI/Swagger
3. Configure rate limiting for API endpoints
4. Set up API monitoring and alerting
5. Review and implement CORS policy
*/

/**
 * REST controller handling merchant-related HTTP endpoints in the MCA application.
 * Implements secure APIs for merchant management with field-level encryption.
 */
@RestController
@RequestMapping("/api/v1/merchants")
@Slf4j
@RequiredArgsConstructor
public class MerchantController {

    private final MerchantService merchantService;

    /**
     * Creates a new merchant with encrypted sensitive fields.
     * 
     * Requirement: Data Management - Merchant Information
     * Implements secure merchant creation with field-level encryption
     */
    @PostMapping
    @PreAuthorize("hasRole('OPERATIONS')")
    public ResponseEntity<MerchantDTO> createMerchant(@RequestBody @Valid MerchantDTO merchantDTO) {
        log.info("REST request to create merchant: {}", merchantDTO.getLegalName());
        
        MerchantDTO createdMerchant = merchantService.createMerchant(merchantDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMerchant);
    }

    /**
     * Updates an existing merchant with encrypted sensitive fields.
     * 
     * Requirement: Integration - REST APIs
     * Implements secure merchant update endpoint with validation
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OPERATIONS')")
    public ResponseEntity<MerchantDTO> updateMerchant(
            @PathVariable UUID id,
            @RequestBody @Valid MerchantDTO merchantDTO) {
        log.info("REST request to update merchant: {}", id);
        
        MerchantDTO updatedMerchant = merchantService.updateMerchant(id, merchantDTO);
        return ResponseEntity.ok(updatedMerchant);
    }

    /**
     * Retrieves merchant by ID with decrypted fields.
     * 
     * Requirement: Security - Authentication & Authorization
     * Implements secure data access with role-based authorization
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OPERATIONS', 'API')")
    public ResponseEntity<MerchantDTO> getMerchantById(@PathVariable UUID id) {
        log.info("REST request to get merchant by ID: {}", id);
        
        Optional<MerchantDTO> merchantDTO = merchantService.getMerchantById(id);
        return merchantDTO
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves merchant by encrypted EIN.
     * 
     * Requirement: Data Management - Merchant Information
     * Implements secure merchant lookup by EIN with field-level encryption
     */
    @GetMapping("/ein/{ein}")
    @PreAuthorize("hasAnyRole('OPERATIONS', 'API')")
    public ResponseEntity<MerchantDTO> getMerchantByEin(@PathVariable String ein) {
        log.info("REST request to get merchant by EIN");
        
        Optional<MerchantDTO> merchantDTO = merchantService.getMerchantByEin(ein);
        return merchantDTO
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves paginated list of merchants by industry.
     * 
     * Requirement: Integration - REST APIs
     * Implements paginated merchant query endpoint
     */
    @GetMapping("/industry/{industry}")
    @PreAuthorize("hasAnyRole('OPERATIONS', 'API')")
    public ResponseEntity<Page<MerchantDTO>> getMerchantsByIndustry(
            @PathVariable String industry,
            Pageable pageable) {
        log.info("REST request to get merchants by industry: {}", industry);
        
        Page<MerchantDTO> merchants = merchantService.getMerchantsByIndustry(industry, pageable);
        return ResponseEntity.ok(merchants);
    }
}