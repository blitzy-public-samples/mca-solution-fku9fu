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
import com.dollarfunding.core.entities.Application;
import com.dollarfunding.core.repositories.ApplicationRepository;
import com.dollarfunding.core.dto.ApplicationDTO;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.Set;

/**
 * Human Tasks:
 * 1. Configure transaction timeout settings in application.properties
 * 2. Set up monitoring alerts for processing time SLAs
 * 3. Configure document processing error thresholds
 * 4. Review and adjust automation rules with business team
 */

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final DocumentService documentService;

    /**
     * Creates a new MCA application with initial validation.
     * Addresses requirement: Application Processing - Automated processing of MCA applications
     */
    public ApplicationDTO createApplication(ApplicationDTO applicationDTO) {
        log.info("Creating new application with requested amount: {}", applicationDTO.getRequestedAmount());
        
        // Validate application DTO
        applicationDTO.validate();
        
        // Convert DTO to entity
        Application application = Application.builder()
            .status("RECEIVED")
            .requestedAmount(applicationDTO.getRequestedAmount())
            .merchantId(applicationDTO.getMerchant().getId())
            .submittedAt(LocalDateTime.now())
            .build();
            
        // Validate business rules
        application.validateBusinessRules();
        
        // Save application
        Application savedApplication = applicationRepository.save(application);
        log.debug("Application created successfully with ID: {}", savedApplication.getId());
        
        return ApplicationDTO.fromEntity(savedApplication);
    }

    /**
     * Retrieves application by ID with associated documents.
     * Addresses requirement: Data Management - Manages merchant information and documents
     */
    public ApplicationDTO getApplication(UUID applicationId) {
        log.debug("Retrieving application with ID: {}", applicationId);
        
        Objects.requireNonNull(applicationId, "Application ID cannot be null");
        
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));
            
        // Load associated documents
        Page<Document> documents = documentService.getApplicationDocuments(applicationId, Pageable.unpaged());
        Set<UUID> documentIds = documents.map(Document::getId).toSet();
        application.setDocumentIds(documentIds);
        
        return ApplicationDTO.fromEntity(application);
    }

    /**
     * Updates existing application with validation.
     * Addresses requirement: Data Management - Manages funding details
     */
    public ApplicationDTO updateApplication(UUID applicationId, ApplicationDTO applicationDTO) {
        log.info("Updating application: {}", applicationId);
        
        Application existingApplication = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));
            
        // Validate update DTO
        applicationDTO.validate();
        
        // Update entity fields
        existingApplication.setRequestedAmount(applicationDTO.getRequestedAmount());
        existingApplication.setStatus(applicationDTO.getStatus());
        
        // Validate business rules
        existingApplication.validateBusinessRules();
        
        // Save changes
        Application updatedApplication = applicationRepository.save(existingApplication);
        log.debug("Application updated successfully: {}", applicationId);
        
        return ApplicationDTO.fromEntity(updatedApplication);
    }

    /**
     * Processes application through automated workflow.
     * Addresses requirements: 
     * - Application Processing - < 5 minutes processing time
     * - Automation Rate - Supports 93% automation rate
     */
    public ApplicationDTO processApplication(UUID applicationId) {
        log.info("Starting automated processing for application: {}", applicationId);
        
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new IllegalArgumentException("Application not found: " + applicationId));
            
        // Validate initial status
        if (!"RECEIVED".equals(application.getStatus())) {
            throw new IllegalStateException("Application must be in RECEIVED status for processing");
        }
        
        LocalDateTime startTime = LocalDateTime.now();
        
        try {
            // Update status to processing
            application.setStatus("PROCESSING");
            applicationRepository.save(application);
            
            // Load and process documents
            Page<Document> documents = documentService.getApplicationDocuments(applicationId, Pageable.unpaged());
            
            for (Document document : documents.getContent()) {
                documentService.updateDocumentClassification(
                    document.getId(),
                    "PROCESSED",
                    Map.of("processedAt", LocalDateTime.now().toString())
                );
            }
            
            // Validate business rules
            boolean validationResult = application.validateBusinessRules();
            
            // Update final status based on validation
            application.setStatus(validationResult ? "UNDER_REVIEW" : "REJECTED");
            
            // Check processing time SLA
            Duration processingTime = Duration.between(startTime, LocalDateTime.now());
            if (processingTime.toMinutes() >= 5) {
                log.warn("Processing time exceeded 5 minutes for application: {}", applicationId);
            }
            
            Application processedApplication = applicationRepository.save(application);
            log.info("Application processed successfully: {}", applicationId);
            
            return ApplicationDTO.fromEntity(processedApplication);
            
        } catch (Exception e) {
            log.error("Error processing application: {}", applicationId, e);
            application.setStatus("ERROR");
            applicationRepository.save(application);
            throw new RuntimeException("Application processing failed", e);
        }
    }

    /**
     * Retrieves applications by status with pagination.
     * Addresses requirement: Data Management - Manages merchant information
     */
    public Page<ApplicationDTO> getApplicationsByStatus(String status, Pageable pageable) {
        log.debug("Retrieving applications with status: {}", status);
        
        Objects.requireNonNull(status, "Status cannot be null");
        Objects.requireNonNull(pageable, "Pageable cannot be null");
        
        return applicationRepository.findByStatus(status, pageable)
            .map(ApplicationDTO::fromEntity);
    }
}