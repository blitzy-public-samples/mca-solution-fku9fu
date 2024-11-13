package com.dollarfunding.core;

// Spring Boot 3.1.x
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.SpringApplication;

// Spring Framework 6.0.x
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.context.annotation.Bean;
import org.springframework.core.task.Executor;

// Internal configurations
import com.dollarfunding.core.config.DatabaseConfig;
import com.dollarfunding.core.config.SecurityConfig;

/**
 * Human Tasks:
 * 1. Configure application.properties with appropriate database credentials
 * 2. Set up Auth0 tenant and configure security properties
 * 3. Configure async task executor thread pool sizes based on production load
 * 4. Set up monitoring for async task execution metrics
 * 5. Configure scheduled task cron expressions in application.properties
 */

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class CoreServiceApplication {

    /**
     * Main application entry point that bootstraps the Spring Boot application
     * Addresses requirement: Core Service Architecture - Java Spring Boot service handling business logic
     */
    public static void main(String[] args) {
        SpringApplication.run(CoreServiceApplication.class, args);
    }

    /**
     * Configures async task executor with thread pool settings for optimal performance
     * Addresses requirement: System Integration - Asynchronous processing support for API operations
     */
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Configure core thread pool properties
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("AsyncThread-");
        
        // Configure thread pool behavior
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.setKeepAliveSeconds(120);
        executor.setAllowCoreThreadTimeOut(true);
        
        // Configure rejection policy
        executor.setRejectedExecutionHandler(new ThreadPoolTaskExecutor.CallerRunsPolicy());
        
        // Initialize the executor
        executor.initialize();
        
        return executor;
    }
}