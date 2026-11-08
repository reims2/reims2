package org.pvh.security;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@SecurityScheme(name = "session", type = SecuritySchemeType.APIKEY, in = SecuritySchemeIn.COOKIE, paramName = "SESSION")
@OpenAPIDefinition(info = @Info(title = "REIMS2", version = "v0"), security = @SecurityRequirement(name = "session"))
public class WebSecurityConfig {

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // admins can do everything users can
    @Bean
    static RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.fromHierarchy("ROLE_ADMIN > ROLE_USER");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SessionUserRepository sessionUserRepository(UserDetailsService userDetailsService) {
        return new SessionUserRepository(userDetailsService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, SessionUserRepository sessionUserRepository) throws Exception {
        http
            // spa() writes the XSRF-TOKEN cookie on every response to a request without one
            .csrf(csrf -> csrf.spa().ignoringRequestMatchers("/api/auth/signin"))
            .securityContext(context -> context.securityContextRepository(sessionUserRepository))
            .authorizeHttpRequests(request -> request
                .requestMatchers("/api", "/api/auth/signin", "/api/auth/signout").permitAll()
                .requestMatchers("/error").permitAll()
                // only /api is routed publicly, prod exposes no actuator endpoint that leaks secrets
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers(
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/webjars/**")
                .permitAll()
                .anyRequest().authenticated())
            .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .requestCache(cache -> cache.disable())
            // AuthController's signout instead
            .logout(logout -> logout.disable());
        return http.build();
    }

}
