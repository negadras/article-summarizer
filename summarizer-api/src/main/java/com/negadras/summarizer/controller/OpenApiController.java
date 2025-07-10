package com.negadras.summarizer.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Controller responsible for serving OpenAPI specification from static YAML file.
 * Provides both JSON and YAML formats of the API documentation.
 */
@RestController
public class OpenApiController {

    private static final Logger logger = LoggerFactory.getLogger(OpenApiController.class);
    private static final String OPENAPI_FILE_PATH = "openapi.yaml";
    private static final String CACHE_JSON = "openapi-json";
    private static final String CACHE_YAML = "openapi-yaml";
    private static final String ERROR_FILE_NOT_FOUND = "OpenAPI specification file not found";

    private final ObjectMapper yamlMapper;
    private final ObjectMapper jsonMapper;

    public OpenApiController() {
        this.yamlMapper = new ObjectMapper(new YAMLFactory());
        this.jsonMapper = new ObjectMapper();
    }

    /**
     * Serves the OpenAPI specification in JSON format.
     *
     * @return ResponseEntity containing the OpenAPI specification as JSON
     */
    @Cacheable(CACHE_JSON)
    @GetMapping(value = "/v3/api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getApiDocs() {
        logger.debug("Serving OpenAPI specification in JSON format");

        try {
            String yamlContent = loadOpenApiFile();
            if (yamlContent == null) {
                return createNotFoundResponse();
            }

            String jsonContent = convertYamlToJson(yamlContent);
            logger.debug("Successfully converted OpenAPI YAML to JSON, size: {} characters", jsonContent.length());

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonContent);

        } catch (IOException e) {
            logger.error("Failed to process OpenAPI file for JSON conversion", e);
            return createErrorResponse("Failed to load API documentation");
        }
    }

    /**
     * Serves the OpenAPI specification in YAML format.
     *
     * @return ResponseEntity containing the OpenAPI specification as YAML
     */
    @Cacheable(CACHE_YAML)
    @GetMapping(value = "/openapi.yaml", produces = "application/yaml")
    public ResponseEntity<String> getOpenApiYaml() {
        logger.debug("Serving OpenAPI specification in YAML format");

        try {
            String yamlContent = loadOpenApiFile();
            if (yamlContent == null) {
                return createNotFoundResponse();
            }

            logger.debug("Successfully loaded OpenAPI YAML file, size: {} characters", yamlContent.length());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("application/yaml"))
                    .body(yamlContent);

        } catch (IOException e) {
            logger.error("Failed to load OpenAPI YAML file", e);
            return createErrorResponse("error: Failed to load API documentation");
        }
    }

    /**
     * Health check endpoint to verify OpenAPI file availability.
     *
     * @return ResponseEntity with health status
     */
    @GetMapping(value = "/v3/api-docs/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getApiDocsHealth() {
        logger.debug("Checking OpenAPI file availability");

        ClassPathResource resource = new ClassPathResource(OPENAPI_FILE_PATH);

        if (resource.exists()) {
            logger.debug("OpenAPI file is available");
            return ResponseEntity.ok("{\"status\":\"UP\",\"openapi\":\"available\"}");
        } else {
            logger.warn("OpenAPI file is missing: {}", OPENAPI_FILE_PATH);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("{\"status\":\"DOWN\",\"openapi\":\"missing\"}");
        }
    }

    /**
     * Loads the OpenAPI YAML file from classpath.
     *
     * @return String content of the YAML file, or null if not found
     * @throws IOException if file reading fails
     */
    private String loadOpenApiFile() throws IOException {
        ClassPathResource resource = new ClassPathResource(OPENAPI_FILE_PATH);

        if (!resource.exists()) {
            logger.warn("OpenAPI file not found: {}", OPENAPI_FILE_PATH);
            return null;
        }

        try (InputStream inputStream = resource.getInputStream()) {
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    /**
     * Converts YAML content to JSON format.
     *
     * @param yamlContent the YAML content to convert
     * @return JSON string representation
     * @throws IOException if conversion fails
     */
    private String convertYamlToJson(String yamlContent) throws IOException {
        JsonNode yamlNode = yamlMapper.readTree(yamlContent);
        return jsonMapper.writeValueAsString(yamlNode);
    }

    /**
     * Creates a standardized not found response.
     *
     * @return ResponseEntity with 404 status
     */
    private ResponseEntity<String> createNotFoundResponse() {
        logger.error(ERROR_FILE_NOT_FOUND);
        return ResponseEntity.notFound().build();
    }

    /**
     * Creates a standardized error response.
     *
     * @param message the error message
     * @return ResponseEntity with 500 status
     */
    private ResponseEntity<String> createErrorResponse(String message) {
        return ResponseEntity.internalServerError().body(message);
    }
}
