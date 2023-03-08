package org.pvh.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Starting from Spring Boot 2, if Spring Security is present, endpoints are secured by default using Spring Security’s
 * content-negotiation strategy.
 */
@Configuration
@ConditionalOnProperty(name = "pvh.security.enable", havingValue = "false")
public class DisableSecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // @formatter:off
        http.authorizeRequests().anyRequest().permitAll().and().csrf().disable();
        // @formatter:on
        return http.build();
    }

}
