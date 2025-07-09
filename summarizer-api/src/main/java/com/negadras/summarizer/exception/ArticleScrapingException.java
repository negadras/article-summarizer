package com.negadras.summarizer.exception;

public class ArticleScrapingException extends RuntimeException {
    public ArticleScrapingException(String message) {
        super(message);
    }

    public ArticleScrapingException(String message, Throwable cause) {
        super(message, cause);
    }
}
