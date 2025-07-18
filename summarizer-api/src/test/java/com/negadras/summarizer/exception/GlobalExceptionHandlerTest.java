package com.negadras.summarizer.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleNonTransientAiException_OpenAIAuthError_ReturnsServiceUnavailable() {
        // Given
        String errorMessage = "HTTP 401 - {\"error\": {\"message\": \"Incorrect API key provided\", \"type\": \"invalid_api_key\"}}";
        NonTransientAiException exception = new NonTransientAiException(errorMessage);

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleNonTransientAiException(exception);

        // Then
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("Service temporarily unavailable.", response.getBody().message());
        assertEquals("Our AI summarization service is currently experiencing issues. Please try again later or contact support if the problem persists.",
                     response.getBody().details());
    }

    @Test
    void handleNonTransientAiException_InvalidApiKeyError_ReturnsServiceUnavailable() {
        // Given
        String errorMessage = "invalid_api_key: The API key is invalid";
        NonTransientAiException exception = new NonTransientAiException(errorMessage);

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleNonTransientAiException(exception);

        // Then
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("Service temporarily unavailable.", response.getBody().message());
        assertEquals("Our AI summarization service is currently experiencing issues. Please try again later or contact support if the problem persists.",
                     response.getBody().details());
    }

    @Test
    void handleNonTransientAiException_OtherAIError_ReturnsBadGateway() {
        // Given
        String errorMessage = "HTTP 429 - Rate limit exceeded";
        NonTransientAiException exception = new NonTransientAiException(errorMessage);

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleNonTransientAiException(exception);

        // Then
        assertEquals(HttpStatus.BAD_GATEWAY, response.getStatusCode());
        assertEquals("Service temporarily unavailable.", response.getBody().message());
        assertEquals("Our AI service is currently experiencing issues. Please try again later.",
                     response.getBody().details());
    }

    @Test
    void handleApiConfigurationException_ReturnsServiceUnavailable() {
        // Given
        ApiConfigurationException exception = new ApiConfigurationException("Missing API key configuration");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleApiConfigurationException(exception);

        // Then
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("Service temporarily unavailable.", response.getBody().message());
        assertEquals("Our summarization service is currently experiencing configuration issues. Please try again later or contact support if the problem persists.", response.getBody().details());
    }

    @Test
    void handleSummarizationException_ReturnsInternalServerError() {
        // Given
        SummarizationException exception = new SummarizationException("Failed to process text", new RuntimeException("Test cause"));

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleSummarizationException(exception);

        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Unable to generate summary.", response.getBody().message());
        assertEquals("We encountered an issue while processing your article. Please try again with a different article or contact support if the problem persists.", response.getBody().details());
    }

    @Test
    void handleHttpMessageNotReadableException_ReturnsBadRequest() {
        // Given
        HttpMessageNotReadableException exception = new HttpMessageNotReadableException("Invalid JSON", (Throwable) null);

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleHttpMessageNotReadableException(exception);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid request format.", response.getBody().message());
        assertEquals("Please check your request data and try again. Make sure all required fields are included and properly formatted.", response.getBody().details());
    }

    @Test
    void handleIOException_ReturnsInternalServerError() {
        // Given
        IOException exception = new IOException("File not found");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleIOException(exception);

        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Unable to process your request.", response.getBody().message());
        assertEquals("We're experiencing technical difficulties. Please try again later or contact support if the problem persists.", response.getBody().details());
    }

    @Test
    void handleArticleScrapingException_PaywallError_ReturnsBadRequest() {
        // Given
        ArticleScrapingException exception = new ArticleScrapingException("Unable to extract sufficient content from the URL. The article may be behind a paywall or require JavaScript.");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleArticleScrapingException(exception);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Unable to access article content.", response.getBody().message());
        assertEquals("The article may be behind a paywall or require special access. Please try a different article or check if you can access it directly.", response.getBody().details());
    }

    @Test
    void handleArticleScrapingException_ConnectionError_ReturnsBadRequest() {
        // Given
        ArticleScrapingException exception = new ArticleScrapingException("Failed to connect to the URL: http://example.com");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleArticleScrapingException(exception);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Unable to reach the article URL.", response.getBody().message());
        assertEquals("Please check the URL and try again. The website may be temporarily unavailable.", response.getBody().details());
    }

    @Test
    void handleArticleScrapingException_InvalidUrlError_ReturnsBadRequest() {
        // Given
        ArticleScrapingException exception = new ArticleScrapingException("Invalid URL: not-a-url");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleArticleScrapingException(exception);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid article URL.", response.getBody().message());
        assertEquals("Please check that the URL is correct and points to a valid article.", response.getBody().details());
    }

    @Test
    void handleGlobalException_ReturnsInternalServerError() {
        // Given
        RuntimeException exception = new RuntimeException("Unexpected error");

        // When
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleGlobalException(exception);

        // Then
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Something went wrong.", response.getBody().message());
        assertEquals("We encountered an unexpected issue. Please try again later or contact support if the problem persists.", response.getBody().details());
    }
}
