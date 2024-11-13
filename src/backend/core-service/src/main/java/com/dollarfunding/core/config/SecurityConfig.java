package com.dollarfunding.core.config;

// Spring Security 6.0.9
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationFilter;
import org.springframework.security.config.http.SessionCreationPolicy;

// Spring Framework 6.0.9
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// Auth0 1.5.1
import com.auth0.spring.security.api.JwtWebSecurityConfigurer;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;

import java.util.Arrays;
import java.util.List;
import java.time.Duration;

/**
 * Security configuration class implementing OAuth2 resource server with Auth0 integration
 * Addresses requirements from Section 7.1 Authentication and Authorization
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final String jwtIssuer;
    private final String jwtAudience;

    // Human Tasks:
    // 1. Configure Auth0 tenant and obtain domain and audience values
    // 2. Set up CORS allowed origins in application.properties
    // 3. Configure rate limiting rules in API Gateway
    // 4. Set up SSL certificate for TLS 1.3
    // 5. Configure security monitoring alerts

    public SecurityConfig(
            @Value("${auth0.issuer-uri}") String jwtIssuer,
            @Value("${auth0.audience}") String jwtAudience) {
        this.jwtIssuer = jwtIssuer;
        this.jwtAudience = jwtAudience;
    }

    /**
     * Configures HTTP security filter chain with JWT authentication and CORS
     * Implements requirements from Section 7.3.2 Security Controls
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Disable CSRF as we're using stateless JWT authentication
        http.csrf().disable()
            // Configure CORS
            .cors().configurationSource(corsConfigurationSource()).and()
            // Use stateless session management
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            // Configure authorization rules
            .authorizeHttpRequests()
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
            .requestMatchers("/api/v1/public/**").permitAll()
            .requestMatchers("/api/v1/applications/**").hasAnyRole("OPERATIONS", "ADMIN")
            .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated().and()
            // Configure OAuth2 resource server with JWT
            .oauth2ResourceServer()
            .jwt()
            .decoder(jwtDecoder());

        return http.build();
    }

    /**
     * Configures CORS settings for cross-origin requests
     * Implements requirements from Section 7.3.2 Security Controls
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "${cors.allowed-origins}".split(",")
        ));
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList(
            "X-Total-Count",
            "X-Page-Count",
            "X-Current-Page"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(Duration.ofHours(1).getSeconds());

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    /**
     * Configures JWT decoder with Auth0 settings
     * Implements requirements from Section 7.1 Authentication and Authorization
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        // Create JWT decoder for Auth0 tokens
        NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(jwtIssuer);

        // Configure token validators
        OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(jwtAudience);
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(jwtIssuer);
        OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<>(
            withIssuer,
            audienceValidator
        );

        // Configure decoder with validators and clock skew
        jwtDecoder.setJwtValidator(withAudience);
        // Allow for 30 seconds of clock skew
        ((NimbusJwtDecoder) jwtDecoder).setClockSkew(Duration.ofSeconds(30));

        return jwtDecoder;
    }

    /**
     * Custom JWT audience validator
     * Implements requirements from Section 7.1 Authentication and Authorization
     */
    private static class AudienceValidator implements OAuth2TokenValidator<Jwt> {
        private final String audience;

        AudienceValidator(String audience) {
            this.audience = audience;
        }

        @Override
        public OAuth2TokenValidatorResult validate(Jwt jwt) {
            if (jwt.getAudience().contains(audience)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                new OAuth2TokenValidatorException("Invalid audience for JWT token")
            );
        }
    }
}