package org.pvh.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class JwtPropertiesTest {

    @EnableConfigurationProperties(JwtProperties.class)
    static class Config {
    }

    private final ApplicationContextRunner runner = new ApplicationContextRunner().withUserConfiguration(Config.class);

    @Test
    void bindsSecretAndExpiration() {
        runner.withPropertyValues("pvh.jwt.secret=" + "x".repeat(64), "pvh.jwt.expiration=56d")
            .run(context -> assertThat(context.getBean(JwtProperties.class).expiration()).isEqualTo(Duration.ofDays(56)));
    }

    @Test
    void shortSecret_failsAtStartup() {
        runner.withPropertyValues("pvh.jwt.secret=" + "x".repeat(63), "pvh.jwt.expiration=56d")
            .run(context -> assertThat(context).hasFailed());
        runner.withPropertyValues("pvh.jwt.secret=" + "x".repeat(64))
            .run(context -> assertThat(context).hasFailed());
    }
}
