package com.negadras.summarizer.exception;

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
        String details = ex.getMessage();
        ErrorResponse errorResponse = new ErrorResponse("Invalid request body.", details);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ErrorResponse> handleIOException(IOException ex) {
        ErrorResponse errorResponse = new ErrorResponse("An error occurred while processing the request.", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(ArticleScrapingException.class)
    public ResponseEntity<ErrorResponse> handleArticleScrapingException(ArticleScrapingException ex) {
        ErrorResponse errorResponse = new ErrorResponse("Failed to scrape the article.", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(SummarizationException.class)
    public ResponseEntity<ErrorResponse> handleSummarizationException(SummarizationException ex) {
        ErrorResponse errorResponse = new ErrorResponse("Failed to summarize the article.", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        ErrorResponse errorResponse = new ErrorResponse("An unexpected error occurred.", ex.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
