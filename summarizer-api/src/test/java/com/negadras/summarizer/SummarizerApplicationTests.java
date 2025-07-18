package com.negadras.summarizer;

import com.negadras.summarizer.controller.ArticleController;
import com.negadras.summarizer.dto.Article;
import com.negadras.summarizer.dto.SummarizationResponse;
import com.negadras.summarizer.dto.SummarizeRequest;
import com.negadras.summarizer.dto.Summary;
import com.negadras.summarizer.service.ScraperService;
import com.negadras.summarizer.service.SummarizationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(com.negadras.summarizer.config.IntegrationTestSecurityConfig.class)
class SummarizerApplicationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ArticleController articleController;

    @MockitoBean
    private SummarizationService summarizationService;

    @Autowired
    private ScraperService scraperService;

    @Test
    void contextLoads() { }

    @Test
    void allBeansAreLoaded() {
        assertThat(articleController).isNotNull();
        assertThat(summarizationService).isNotNull();
        assertThat(scraperService).isNotNull();
    }

    @Test
    void summarizeTextEndpoint_Integration() {
        SummarizeRequest request = new SummarizeRequest("This is a sample text for testing purposes.", null);

        // Mock the service response
        SummarizationResponse mockResponse = new SummarizationResponse(
                new Article("Test Title", request.content(), 8),
                new Summary("Test summary", List.of("Key point"), 2, 75)
        );

        when(summarizationService.summarizeArticle(anyString(), anyString()))
                .thenReturn(mockResponse);

        ResponseEntity<SummarizationResponse> response = restTemplate.postForEntity(
                "/api/summarize/text",
                request,
                SummarizationResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void summarizeUrlEndpoint_withBadRequest_returns400() {
        SummarizeRequest request = new SummarizeRequest(null, "");

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/summarize/url",
                request,
                String.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
