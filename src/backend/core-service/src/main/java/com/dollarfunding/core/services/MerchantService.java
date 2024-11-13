package com.dollarfunding.core.services;

// Spring Framework - v6.0.11
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

// Lombok - v1.18.26
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

// Java Core - v17
import java.util.Optional;
import java.util.UUID;

// Application Components
import com.dollarfunding.core.entities.Merchant;
import com.dollarfunding.core.dto.MerchantDTO;
import com.dollarfunding.core.repositories.MerchantRepository;

/*
Human Tasks:
1. Configure AWS KMS key for field-level encryption
2. Set up audit logging infrastructure
3. Verify EIN validation rules with compliance team
4. Configure data retention policies in database
*/

/**
 * Service class implementing business logic for merchant management with field-level encryption
 * and validation in the MCA application processing system.
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class MerchantService {

    private final MerchantRepository merchantRepository;

    /**
     * Creates a new merchant after validation and field encryption.
     * 
     * Requirement: Data Management - Merchant Information
     * Implements business logic for managing merchant information with field-level encryption
     */
    @Transactional
    public MerchantDTO createMerchant(MerchantDTO merchantDTO) {
        log.info("Creating new merchant with legal name: {}", merchantDTO.getLegalName());
        
        // Validate merchant data
        merchantDTO.validate();
        
        // Check for existing merchant with same EIN
        if (merchantRepository.existsByEin(merchantDTO.getEin())) {
            log.error("Merchant with EIN {} already exists", merchantDTO.getEin());
            throw new IllegalStateException("Merchant with provided EIN already exists");
        }
        
        // Convert DTO to entity and validate business rules
        Merchant merchant = merchantDTO.toEntity();
        merchant.validateBusinessRules();
        
        // Save merchant with encrypted fields
        Merchant savedMerchant = merchantRepository.save(merchant);
        log.info("Successfully created merchant with ID: {}", savedMerchant.getId());
        
        return MerchantDTO.fromEntity(savedMerchant);
    }

    /**
     * Updates existing merchant information with field encryption.
     * 
     * Requirement: Data Security
     * Implements AES-256 field-level encryption for sensitive merchant information
     */
    @Transactional
    public MerchantDTO updateMerchant(UUID id, MerchantDTO merchantDTO) {
        log.info("Updating merchant with ID: {}", id);
        
        // Validate update data
        merchantDTO.validate();
        
        // Find existing merchant
        Merchant existingMerchant = merchantRepository.findById(id)
            .orElseThrow(() -> {
                log.error("Merchant not found with ID: {}", id);
                return new IllegalStateException("Merchant not found");
            });
        
        // Update entity fields from DTO
        Merchant updatedMerchant = merchantDTO.toEntity();
        updatedMerchant.setId(existingMerchant.getId());
        updatedMerchant.validateBusinessRules();
        
        // Save updated merchant with encrypted fields
        Merchant savedMerchant = merchantRepository.save(updatedMerchant);
        log.info("Successfully updated merchant with ID: {}", savedMerchant.getId());
        
        return MerchantDTO.fromEntity(savedMerchant);
    }

    /**
     * Retrieves merchant by ID with decrypted fields.
     * 
     * Requirement: Data Security
     * Implements secure data handling for sensitive merchant information
     */
    public Optional<MerchantDTO> getMerchantById(UUID id) {
        log.info("Retrieving merchant with ID: {}", id);
        
        return merchantRepository.findById(id)
            .map(merchant -> {
                log.debug("Found merchant with ID: {}", id);
                return MerchantDTO.fromEntity(merchant);
            });
    }

    /**
     * Retrieves merchant by encrypted EIN.
     * 
     * Requirement: Form Validation
     * Enforces validation rules for merchant data including EIN
     */
    public Optional<MerchantDTO> getMerchantByEin(String ein) {
        log.info("Retrieving merchant by EIN");
        
        return merchantRepository.findByEin(ein)
            .map(merchant -> {
                log.debug("Found merchant by EIN");
                return MerchantDTO.fromEntity(merchant);
            });
    }

    /**
     * Retrieves paginated list of merchants in an industry.
     * 
     * Requirement: Data Management - Merchant Information
     * Implements business logic for managing merchant information and relationships
     */
    public Page<MerchantDTO> getMerchantsByIndustry(String industry, Pageable pageable) {
        log.info("Retrieving merchants by industry: {}", industry);
        
        return merchantRepository.findByIndustry(industry, pageable)
            .map(merchant -> {
                log.debug("Converting merchant {} to DTO", merchant.getId());
                return MerchantDTO.fromEntity(merchant);
            });
    }

    /**
     * Validates merchant data according to business rules.
     * 
     * Requirement: Form Validation
     * Enforces validation rules for merchant data including business name and financial information
     */
    public boolean validateMerchant(MerchantDTO merchantDTO) {
        log.info("Validating merchant data");
        
        try {
            // Validate DTO fields
            merchantDTO.validate();
            
            // Convert to entity and validate business rules
            Merchant merchant = merchantDTO.toEntity();
            merchant.validateBusinessRules();
            
            log.info("Merchant validation successful");
            return true;
        } catch (Exception e) {
            log.error("Merchant validation failed: {}", e.getMessage());
            throw e;
        }
    }
}