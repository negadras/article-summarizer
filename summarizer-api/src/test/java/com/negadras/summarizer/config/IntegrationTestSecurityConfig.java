package com.negadras.summarizer.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@TestConfiguration
@EnableWebSecurity
public class IntegrationTestSecurityConfig {

    @Bean("integrationTestSecurityFilterChain")
    @Order(1)
    public SecurityFilterChain integrationTestSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/**")
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll()
            )
            .build();
    }
}
