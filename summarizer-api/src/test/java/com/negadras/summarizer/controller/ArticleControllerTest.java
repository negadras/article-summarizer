package com.negadras.summarizer.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.negadras.summarizer.dto.Article;
import com.negadras.summarizer.dto.SummarizationResponse;
import com.negadras.summarizer.dto.SummarizeRequest;
import com.negadras.summarizer.dto.Summary;
import com.negadras.summarizer.service.ScraperService;
import com.negadras.summarizer.service.SummarizationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ArticleController.class)
class ArticleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SummarizationService summarizationService;

    @MockitoBean
    private ScraperService scraperService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void summarizeText_withValidContent_shouldReturnSummarizationResponse() throws Exception {
        String content = "This is a test article content for summarization.";
        SummarizeRequest request = new SummarizeRequest(content, null);

        List<String> keyPoints = Arrays.asList("Key point 1", "Key point 2");
        Article article = new Article("Test Article", content, 9);
        Summary summary = new Summary("Test summary", keyPoints, 2, 77);
        SummarizationResponse response = new SummarizationResponse(article, summary);

        when(summarizationService.summarizeArticle(anyString(), anyString())).thenReturn(response);

        mockMvc.perform(post("/api/summarize/text")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.article.title").value("Test Article"))
                .andExpect(jsonPath("$.article.content").value(content))
                .andExpect(jsonPath("$.article.wordCount").value(9))
                .andExpect(jsonPath("$.summary.content").value("Test summary"))
                .andExpect(jsonPath("$.summary.keyPoints").isArray())
                .andExpect(jsonPath("$.summary.keyPoints[0]").value("Key point 1"))
                .andExpect(jsonPath("$.summary.keyPoints[1]").value("Key point 2"))
                .andExpect(jsonPath("$.summary.wordCount").value(2))
                .andExpect(jsonPath("$.summary.compressionRatio").value(77));
    }

    @Test
    void summarizeText_withNullContent_shouldReturnBadRequest() throws Exception {
        SummarizeRequest request = new SummarizeRequest(null, null);

        mockMvc.perform(post("/api/summarize/text")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void summarizeText_withEmptyContent_shouldReturnBadRequest() throws Exception {
        SummarizeRequest request = new SummarizeRequest("", null);

        mockMvc.perform(post("/api/summarize/text")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void summarizeUrl_withValidUrl_shouldReturnSummarizationResponse() throws Exception {
        String url = "https://example.com/article";
        SummarizeRequest request = new SummarizeRequest(null, url);

        Article scrapedArticle = new Article("Scraped Article", "Scraped content", 2);
        List<String> keyPoints = Arrays.asList("URL key point 1", "URL key point 2");
        Summary summary = new Summary("URL summary", keyPoints, 2, 0);
        SummarizationResponse response = new SummarizationResponse(scrapedArticle, summary);

        when(scraperService.scrapeArticleFromUrl(url)).thenReturn(scrapedArticle);
        when(summarizationService.summarizeArticle(anyString(), anyString())).thenReturn(response);

        mockMvc.perform(post("/api/summarize/url")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.article.title").value("Scraped Article"))
                .andExpect(jsonPath("$.article.content").value("Scraped content"))
                .andExpect(jsonPath("$.article.wordCount").value(2))
                .andExpect(jsonPath("$.summary.content").value("URL summary"))
                .andExpect(jsonPath("$.summary.keyPoints").isArray())
                .andExpect(jsonPath("$.summary.keyPoints[0]").value("URL key point 1"))
                .andExpect(jsonPath("$.summary.keyPoints[1]").value("URL key point 2"));
    }

    @Test
    void summarizeUrl_withNullUrl_shouldReturnBadRequest() throws Exception {
        SummarizeRequest request = new SummarizeRequest(null, null);

        mockMvc.perform(post("/api/summarize/url")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void summarizeUrl_withEmptyUrl_shouldReturnBadRequest() throws Exception {
        SummarizeRequest request = new SummarizeRequest(null, "");

        mockMvc.perform(post("/api/summarize/url")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }


    @Test
    void summarizeText_withLongContent_shouldUseTruncatedTitle() throws Exception {
        String longContent = "This is a very long article content that exceeds 100 characters and should be truncated " +
                "when used as a title parameter for the summarization service call.";
        SummarizeRequest request = new SummarizeRequest(longContent, null);

        List<String> keyPoints = List.of("Long content key point");
        Article article = new Article("Long Article", longContent, 26);
        Summary summary = new Summary("Long content summary", keyPoints, 3, 88);
        SummarizationResponse response = new SummarizationResponse(article, summary);

        when(summarizationService.summarizeArticle(anyString(), anyString())).thenReturn(response);

        mockMvc.perform(post("/api/summarize/text")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.article.title").value("Long Article"))
                .andExpect(jsonPath("$.article.content").value(longContent))
                .andExpect(jsonPath("$.summary.content").value("Long content summary"));
    }

    @Test
    void summarizeText_withMalformedJson_shouldReturnBadRequest() throws Exception {
        String malformedJson = "{ \"content\": \"test\" invalid json }";

        mockMvc.perform(post("/api/summarize/text")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malformedJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void summarizeUrl_withMalformedJson_shouldReturnBadRequest() throws Exception {
        String malformedJson = "{ \"url\": \"https://example.com\" invalid json }";

        mockMvc.perform(post("/api/summarize/url")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malformedJson))
                .andExpect(status().isBadRequest());
    }
}
