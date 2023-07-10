package org.pvh.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

/**
 * Starting from Spring Boot 2, if Spring Security is present, endpoints are secured by default using Spring Security’s
 * content-negotiation strategy.
 */
@Configuration
@ConditionalOnProperty(name = "pvh.security.enable", havingValue = "false")
public class DisableSecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().configurationSource(request -> new CorsConfiguration().applyPermitDefaultValues())
                .and().authorizeRequests().anyRequest().permitAll().and().csrf().disable();
        return http.build();
    }

}
