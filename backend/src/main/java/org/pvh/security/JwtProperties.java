package org.pvh.security;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties("pvh.jwt")
public record JwtProperties(
    // HS512 needs a key of at least 512 bits
    @NotNull @Size(min = 64) String secret,
    @NotNull Duration expiration) {
}
