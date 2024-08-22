package org.pvh;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.support.DatabaseStartupValidator;

import javax.sql.DataSource;
import java.util.stream.Stream;

@SpringBootApplication
public class PVHApplication extends SpringBootServletInitializer {

    public static void main(String[] args) {
        SpringApplication.run(PVHApplication.class, args);
    }

    @Bean
    static BeanFactoryPostProcessor dependsOnPostProcessor() {
        return bf -> {
            // Entity initialization should wait for the database to be ready
            String[] jpa = bf.getBeanNamesForType(EntityManagerFactory.class);
            Stream.of(jpa)
                .map(bf::getBeanDefinition)
                .forEach(it -> it.setDependsOn("databaseStartupValidator"));
        };
    }

    @Bean
    DatabaseStartupValidator databaseStartupValidator(DataSource dataSource) {
        // Wait for the database to be ready
        var dsv = new DatabaseStartupValidator();
        dsv.setDataSource(dataSource);
        dsv.setTimeout(30);
        return dsv;
    }

}
