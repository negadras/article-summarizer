package com.negadras.summarizer.exception;

import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.IOException;

/**
 * Global exception handler for the application.
 * This class is annotated with @ControllerAdvice, which makes it a global exception
 * handler for the entire application.
 * When any controller in the application throws an exception that is handled by one of
 * the @ExceptionHandler methods in this class,Spring will automatically invoke that method.
 * This provides a centralized place to handle exceptions and return consistent error responses to the client.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Invalid request format.",
                "Please check your request data and try again. Make sure all required fields are included and properly formatted."
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ErrorResponse> handleIOException(IOException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Unable to process your request.",
                "We're experiencing technical difficulties. Please try again later or contact support if the problem persists."
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ArticleScrapingException.class)
    public ResponseEntity<ErrorResponse> handleArticleScrapingException(ArticleScrapingException ex) {
        String originalMessage = ex.getMessage();

        // Keep user-friendly messages from ScraperService, make generic ones more helpful
        String userMessage;
        if (originalMessage != null && (
                originalMessage.contains("Unable to extract sufficient content") ||
                        originalMessage.contains("paywall") ||
                        originalMessage.contains("JavaScript")
        )) {
            userMessage = "Unable to access article content.";
        } else if (originalMessage != null && originalMessage.contains("Failed to connect")) {
            userMessage = "Unable to reach the article URL.";
        } else if (originalMessage != null && originalMessage.contains("Invalid URL")) {
            userMessage = "Invalid article URL.";
        } else {
            userMessage = "Unable to process the article.";
        }

        String userDetails;
        if (originalMessage != null && originalMessage.contains("paywall")) {
            userDetails = "The article may be behind a paywall or require special access. Please try a different article or check if you can access it directly.";
        } else if (originalMessage != null && originalMessage.contains("Failed to connect")) {
            userDetails = "Please check the URL and try again. The website may be temporarily unavailable.";
        } else if (originalMessage != null && originalMessage.contains("Invalid URL")) {
            userDetails = "Please check that the URL is correct and points to a valid article.";
        } else {
            userDetails = "Please verify the article URL is accessible and try again, or contact support if the problem persists.";
        }

        ErrorResponse errorResponse = new ErrorResponse(userMessage, userDetails);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ApiConfigurationException.class)
    public ResponseEntity<ErrorResponse> handleApiConfigurationException(ApiConfigurationException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Service temporarily unavailable.",
                "Our summarization service is currently experiencing configuration issues. Please try again later or contact support if the problem persists."
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.SERVICE_UNAVAILABLE);
    }

    @ExceptionHandler(NonTransientAiException.class)
    public ResponseEntity<ErrorResponse> handleNonTransientAiException(NonTransientAiException ex) {
        String message = ex.getMessage();

        if (message != null && (message.contains("401") || message.contains("invalid_api_key") || message.contains("Incorrect API key"))) {
            ErrorResponse errorResponse = new ErrorResponse(
                    "Service temporarily unavailable.",
                    "Our AI summarization service is currently experiencing issues. Please try again later or contact support if the problem persists."
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.SERVICE_UNAVAILABLE);
        }

        ErrorResponse errorResponse = new ErrorResponse(
                "Service temporarily unavailable.",
                "Our AI service is currently experiencing issues. Please try again later."
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_GATEWAY);
    }

    @ExceptionHandler(SummarizationException.class)
    public ResponseEntity<ErrorResponse> handleSummarizationException(SummarizationException ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Unable to generate summary.",
                "We encountered an issue while processing your article. Please try again with a different article or contact support if the problem persists."
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse(
                "Something went wrong.",
                "We encountered an unexpected issue. Please try again later or contact support if the problem persists."
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
