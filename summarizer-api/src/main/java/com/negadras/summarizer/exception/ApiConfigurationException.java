package com.negadras.summarizer.exception;

public class ApiConfigurationException extends RuntimeException {

    public ApiConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }

    public ApiConfigurationException(String message) {
        super(message);
    }
}