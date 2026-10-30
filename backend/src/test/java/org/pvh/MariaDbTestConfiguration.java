package org.pvh;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.mariadb.MariaDBContainer;

@TestConfiguration(proxyBeanMethods = false)
public class MariaDbTestConfiguration {

    @Bean
    @ServiceConnection
    MariaDBContainer mariaDb() {
        // same version as compose.yaml
        return new MariaDBContainer("mariadb:13.0.2");
    }
}
