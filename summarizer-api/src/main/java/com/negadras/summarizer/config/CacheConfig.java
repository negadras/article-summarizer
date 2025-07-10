package com.negadras.summarizer.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class to enable caching for OpenAPI endpoints.
 * This improves performance by caching the converted YAML->JSON content
 * and avoiding repeated file I/O operations.
 */
@Configuration
@EnableCaching
public class CacheConfig {

}
