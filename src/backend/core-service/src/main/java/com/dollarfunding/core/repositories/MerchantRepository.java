package com.dollarfunding.core.repositories;

// Spring Data JPA - v3.1.0
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

// Core Java - v17
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// Application Entities
import com.dollarfunding.core.entities.Merchant;

/*
Human Tasks:
1. Verify database indexing strategy for frequently queried fields
2. Configure audit logging for repository operations
3. Set up data retention policies in the database
4. Review and implement field-level encryption for sensitive data
*/

/**
 * Repository interface for managing Merchant entity persistence operations with secure data access patterns
 * and audit logging support.
 */
@Repository
public interface MerchantRepository extends JpaRepository<Merchant, UUID> {
    
    /**
     * Requirement: Data Management - Merchant Information
     * Finds merchants by their legal business name using case-insensitive matching.
     * Supports partial name search with field-level security controls.
     *
     * @param legalName the legal name of the business to search for
     * @return List of merchants matching the legal name
     */
    List<Merchant> findByLegalName(String legalName);
    
    /**
     * Requirement: Data Security
     * Finds a merchant by their encrypted Employer Identification Number (EIN).
     * Implements secure data access with AES-256 encryption.
     *
     * @param ein the encrypted EIN to search for
     * @return Optional containing merchant if found
     */
    Optional<Merchant> findByEin(String ein);
    
    /**
     * Requirement: Data Management - Merchant Information
     * Finds merchant associated with a specific MCA application ID.
     * Supports relationship tracking between merchants and applications.
     *
     * @param applicationId the UUID of the application to search for
     * @return Optional containing merchant if found
     */
    Optional<Merchant> findByApplicationIdsContaining(UUID applicationId);
    
    /**
     * Requirement: Data Management - Merchant Information
     * Finds merchants in a specific industry with pagination support.
     * Implements data retention policies for 7-year record keeping.
     *
     * @param industry the industry classification to search for
     * @param pageable pagination parameters
     * @return Page of merchants in the specified industry
     */
    Page<Merchant> findByIndustry(String industry, Pageable pageable);
    
    /**
     * Requirement: Data Security
     * Checks if a merchant exists with the given encrypted EIN.
     * Supports duplicate prevention and data integrity.
     *
     * @param ein the encrypted EIN to check
     * @return true if merchant exists, false otherwise
     */
    boolean existsByEin(String ein);
}