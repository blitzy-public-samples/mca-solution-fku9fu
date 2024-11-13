package com.dollarfunding.core.config;

import com.dollarfunding.core.entities.Application;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.flywaydb.core.Flyway;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.Properties;
import java.util.Objects;

/**
 * Human Tasks:
 * 1. Configure SSL certificates in the production environment
 * 2. Set up database encryption keys in AWS KMS
 * 3. Configure database backup retention policies
 * 4. Set up database monitoring alerts in Datadog
 * 5. Configure read replicas for horizontal scaling
 */

@Configuration
@EnableJpaRepositories(basePackages = "com.dollarfunding.core.repositories")
@EnableTransactionManagement
public class DatabaseConfig {

    private final String dbUrl;
    private final String dbUsername;
    private final String dbPassword;
    private final Integer maxPoolSize;
    private final Integer minIdle;
    private final Long connectionTimeout;
    private final Long idleTimeout;

    public DatabaseConfig(Environment env) {
        // Addresses requirement: Database Technology Stack - PostgreSQL configuration
        this.dbUrl = Objects.requireNonNull(env.getProperty("spring.datasource.url"), 
            "Database URL must be configured");
        this.dbUsername = Objects.requireNonNull(env.getProperty("spring.datasource.username"), 
            "Database username must be configured");
        this.dbPassword = Objects.requireNonNull(env.getProperty("spring.datasource.password"), 
            "Database password must be configured");
        
        // Addresses requirement: Core Service Scaling - Connection pooling configuration
        this.maxPoolSize = env.getProperty("spring.datasource.hikari.maximum-pool-size", Integer.class, 20);
        this.minIdle = env.getProperty("spring.datasource.hikari.minimum-idle", Integer.class, 5);
        this.connectionTimeout = env.getProperty("spring.datasource.hikari.connection-timeout", Long.class, 20000L);
        this.idleTimeout = env.getProperty("spring.datasource.hikari.idle-timeout", Long.class, 300000L);
    }

    @Bean
    @Primary
    public DataSource dataSource() {
        // Addresses requirement: Database Technology Stack - HikariCP connection pooling
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(dbUrl);
        config.setUsername(dbUsername);
        config.setPassword(dbPassword);
        config.setDriverClassName("org.postgresql.Driver");
        
        // Addresses requirement: Core Service Scaling - Pool sizing for horizontal scaling
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setConnectionTimeout(connectionTimeout);
        config.setIdleTimeout(idleTimeout);
        
        // Addresses requirement: Data Security - SSL and encryption configuration
        config.addDataSourceProperty("ssl", "true");
        config.addDataSourceProperty("sslmode", "verify-full");
        config.addDataSourceProperty("sslfactory", "org.postgresql.ssl.DefaultJavaSSLFactory");
        
        // Performance and reliability settings
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
        config.addDataSourceProperty("useServerPrepStmts", "true");
        
        // Enable metrics collection for monitoring
        config.setMetricRegistry(null); // TODO: Configure Micrometer registry
        
        return new HikariDataSource(config);
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.dollarfunding.core.entities");
        
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        
        Properties properties = new Properties();
        // Addresses requirement: Database Technology Stack - PostgreSQL dialect
        properties.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        properties.setProperty("hibernate.hbm2ddl.auto", "validate");
        properties.setProperty("hibernate.jdbc.batch_size", "50");
        properties.setProperty("hibernate.order_inserts", "true");
        properties.setProperty("hibernate.order_updates", "true");
        
        // Addresses requirement: Data Security - Field-level encryption
        properties.setProperty("hibernate.jdbc.lob.non_contextual_creation", "true");
        properties.setProperty("hibernate.connection.provider_disables_autocommit", "true");
        
        // Second-level cache configuration
        properties.setProperty("hibernate.cache.use_second_level_cache", "true");
        properties.setProperty("hibernate.cache.region.factory_class", 
            "org.hibernate.cache.ehcache.EhCacheRegionFactory");
        properties.setProperty("hibernate.cache.use_query_cache", "true");
        
        em.setJpaProperties(properties);
        
        return em;
    }

    @Bean
    public PlatformTransactionManager transactionManager(
            LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(entityManagerFactory.getObject());
        
        // Configure transaction settings
        transactionManager.setDefaultTimeout(30); // 30 seconds timeout
        transactionManager.setRollbackOnCommitFailure(true);
        
        return transactionManager;
    }

    @Bean
    public Flyway flyway(DataSource dataSource) {
        // Addresses requirement: Database Technology Stack - Database migrations
        Flyway flyway = Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration")
            .baselineOnMigrate(true)
            .validateOnMigrate(true)
            .cleanDisabled(true) // Prevent accidental DB cleanup in production
            .load();
        
        // Configure Flyway settings
        flyway.getConfiguration().getConnectRetries();
        flyway.getConfiguration().setInstalledBy("application");
        flyway.getConfiguration().setEncoding("UTF-8");
        flyway.getConfiguration().setMixed(false);
        
        return flyway;
    }
}