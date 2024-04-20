package org.pvh;

import java.util.stream.Stream;
import javax.sql.DataSource;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.support.DatabaseStartupValidator;
import jakarta.persistence.EntityManagerFactory;

@SpringBootApplication
public class PVHApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(PVHApplication.class, args);
	}

	@Bean
	DatabaseStartupValidator databaseStartupValidator(DataSource dataSource) {
		// Wait for the database to be ready
		var dsv = new DatabaseStartupValidator();
		dsv.setDataSource(dataSource);
		dsv.setTimeout(30);
		return dsv;
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

}
