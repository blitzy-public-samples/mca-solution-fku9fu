package com.dollarfunding.core.repositories;

// Spring Data JPA v3.1.0
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import com.dollarfunding.core.entities.Application;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Repository interface for Application entity providing data access operations and custom queries.
 * 
 * Human Tasks:
 * 1. Configure appropriate database connection pool settings for high throughput
 * 2. Set up query result caching if needed for frequently accessed data
 * 3. Monitor query performance and adjust fetch strategies if needed
 */

// Addresses requirement: Data Management - Provides standardized data access layer for application processing
@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    
    /**
     * Addresses requirement: Data Management - Retrieves all applications for a specific merchant
     * with pagination support for efficient data access
     */
    Page<Application> findByMerchantId(UUID merchantId, Pageable pageable);
    
    /**
     * Addresses requirement: Processing Time - Enables efficient status-based querying
     * to support processing time targets through optimized pagination
     */
    Page<Application> findByStatus(String status, Pageable pageable);
    
    /**
     * Addresses requirement: Processing Time - Supports date range queries for SLA monitoring
     * and processing time analysis
     */
    Page<Application> findBySubmittedAtBetween(
        LocalDateTime startDate,
        LocalDateTime endDate,
        Pageable pageable
    );
    
    /**
     * Addresses requirement: Automation Rate - Provides metrics tracking capability
     * for monitoring automation success rate through status counts
     */
    long countByStatus(String status);
    
    /**
     * Addresses requirement: Data Management - Supports business rule enforcement
     * through filtered queries based on status and amount thresholds
     */
    Page<Application> findByStatusAndRequestedAmountGreaterThan(
        String status,
        BigDecimal minAmount,
        Pageable pageable
    );
}