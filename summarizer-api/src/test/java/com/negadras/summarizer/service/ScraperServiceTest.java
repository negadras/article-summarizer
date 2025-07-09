package com.negadras.summarizer.service;

import com.negadras.summarizer.exception.ArticleScrapingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
class ScraperServiceTest {

    private ScraperService scraperService;

    @BeforeEach
    void setUp() {
        scraperService = new ScraperService();
    }

    static Stream<Arguments> invalidUrlTestCases() {
        return Stream.of(
                Arguments.of("invalid-url", ArticleScrapingException.class),
                Arguments.of("https://nonexistent-domain-12345.com/article", ArticleScrapingException.class),
                Arguments.of(null, ArticleScrapingException.class),
                Arguments.of("", ArticleScrapingException.class),
                Arguments.of("not-a-valid-url", ArticleScrapingException.class)
        );
    }

    @ParameterizedTest
    @MethodSource("invalidUrlTestCases")
    void scrapeArticleFromUrl_withInvalidInputs_shouldThrowException(String url, Class<? extends Exception> expectedException) {
        assertThrows(expectedException, () -> scraperService.scrapeArticleFromUrl(url));
    }

    @Test
    void scrapeArticleFromUrl_withHttpsUrl_shouldNotThrowException() {
        String httpsUrl = "https://httpbin.org/html";
        assertDoesNotThrow(() -> scraperService.scrapeArticleFromUrl(httpsUrl));
    }
}
