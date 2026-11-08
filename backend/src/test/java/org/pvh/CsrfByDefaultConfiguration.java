package org.pvh;

import jakarta.servlet.http.Cookie;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.MockMvcBuilderCustomizer;
import org.springframework.context.annotation.Bean;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

/**
 * Sends the same token as cookie and header, like the frontend, so the real CSRF check runs. Spring Security's csrf()
 * helper would swap the shared CsrfFilter's repository instead. SecurityIntegrationTest checks requests without one.
 */
@TestConfiguration(proxyBeanMethods = false)
public class CsrfByDefaultConfiguration {

    @Bean
    MockMvcBuilderCustomizer csrfByDefault() {
        return builder -> builder.defaultRequest(get("/").cookie(new Cookie("XSRF-TOKEN", "test")).header("X-XSRF-TOKEN", "test"));
    }
}
