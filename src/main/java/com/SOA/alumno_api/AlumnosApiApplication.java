package com.soa.alumno_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.soa.alumno_api")
@EnableJpaRepositories(basePackages = "com.soa.alumno_api")
@EntityScan(basePackages = "com.soa.alumno_api")
public class AlumnosApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlumnosApiApplication.class, args);
    }
}
