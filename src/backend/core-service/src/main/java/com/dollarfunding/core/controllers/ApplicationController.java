package com.dollarfunding.core.controllers;

// Spring Framework v3.1.0
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// Lombok v1.18.26
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// Jakarta Validation
import jakarta.validation.Valid;

// Project imports
import com.dollarfunding.core.services.ApplicationService;
import com.dollarfunding.core.dto.ApplicationDTO;

import java.util.UUID;

/**
 * Human Tasks:
 * 1. Configure rate limiting settings in application.properties for API endpoints
 * 2. Set up monitoring alerts for endpoint response times
 * 3. Review and adjust security roles with security team
 * 4. Configure API documentation generation
 */

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Slf4j
public class ApplicationController {

    private final ApplicationService applicationService;

    /**
     * Creates a new MCA application with validation.
     * Addresses requirement: Data Management - Management of merchant information and funding details
     */
    @PostMapping
    @PreAuthorize("hasRole('OPERATIONS')")
    public ResponseEntity<ApplicationDTO> createApplication(@RequestBody @Valid ApplicationDTO applicationDTO) {
        log.info("Received application creation request for merchant: {}", 
            applicationDTO.getMerchant() != null ? applicationDTO.getMerchant().getId() : "unknown");
        
        // Validate application DTO
        applicationDTO.validate();
        
        // Create application through service
        ApplicationDTO createdApplication = applicationService.createApplication(applicationDTO);
        
        log.debug("Application created successfully with ID: {}", createdApplication.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
    }

    /**
     * Retrieves application by ID with security check.
     * Addresses requirement: Integration Layer - REST APIs for system integration
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OPERATIONS')")
    public ResponseEntity<ApplicationDTO> getApplication(@PathVariable UUID id) {
        log.debug("Retrieving application with ID: {}", id);
        
        if (id == null) {
            log.warn("Attempted to retrieve application with null ID");
            return ResponseEntity.badRequest().build();
        }
        
        ApplicationDTO application = applicationService.getApplication(id);
        return ResponseEntity.ok(application);
    }

    /**
     * Updates an existing application with validation.
     * Addresses requirement: Data Management - Management of merchant information and funding details
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OPERATIONS')")
    public ResponseEntity<ApplicationDTO> updateApplication(
            @PathVariable UUID id,
            @RequestBody @Valid ApplicationDTO applicationDTO) {
        log.info("Updating application with ID: {}", id);
        
        if (id == null) {
            log.warn("Attempted to update application with null ID");
            return ResponseEntity.badRequest().build();
        }
        
        // Validate update DTO
        applicationDTO.validate();
        
        ApplicationDTO updatedApplication = applicationService.updateApplication(id, applicationDTO);
        log.debug("Application updated successfully: {}", id);
        
        return ResponseEntity.ok(updatedApplication);
    }

    /**
     * Triggers processing of an application with validation.
     * Addresses requirement: Processing Time - < 5 minutes per application processing time
     */
    @PostMapping("/{id}/process")
    @PreAuthorize("hasRole('OPERATIONS')")
    public ResponseEntity<ApplicationDTO> processApplication(@PathVariable UUID id) {
        log.info("Processing application with ID: {}", id);
        
        if (id == null) {
            log.warn("Attempted to process application with null ID");
            return ResponseEntity.badRequest().build();
        }
        
        try {
            ApplicationDTO processedApplication = applicationService.processApplication(id);
            log.debug("Application processed successfully: {}", id);
            return ResponseEntity.ok(processedApplication);
        } catch (IllegalStateException e) {
            log.error("Application processing failed for ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    /**
     * Retrieves applications by status with pagination.
     * Addresses requirement: Integration Layer - REST APIs for system integration
     */
    @GetMapping
    @PreAuthorize("hasRole('OPERATIONS')")
    public ResponseEntity<Page<ApplicationDTO>> getApplicationsByStatus(
            @RequestParam String status,
            Pageable pageable) {
        log.debug("Retrieving applications with status: {}, page: {}", status, pageable.getPageNumber());
        
        if (status == null || status.trim().isEmpty()) {
            log.warn("Attempted to retrieve applications with invalid status");
            return ResponseEntity.badRequest().build();
        }
        
        Page<ApplicationDTO> applications = applicationService.getApplicationsByStatus(status, pageable);
        return ResponseEntity.ok(applications);
    }
}