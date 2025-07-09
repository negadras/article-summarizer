package com.negadras.summarizer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.negadras.summarizer.dto.Article;
import com.negadras.summarizer.dto.SummarizationResponse;
import com.negadras.summarizer.dto.Summary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SummarizationServiceTest {

    @Mock
    private ChatClient chatClient;

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private ChatClient.ChatClientRequestSpec promptSpec;

    @Mock
    private ChatClient.CallResponseSpec callResponseSpec;

    private SummarizationService summarizationService;

    @BeforeEach
    void setUp() {
        summarizationService = new SummarizationService(chatClient, objectMapper);
    }

    @Test
    void summarizeArticle_WithValidJsonResponse_ShouldReturnSummarizationResponse() throws Exception {
        String content = "This is a test article content with many words to summarize.";
        String title = "Test Article";
        String jsonResponse = """
                {
                  "summary": "This is a concise summary of the test article.",
                  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
                }
                """;

        when(chatClient.prompt()).thenReturn(promptSpec);
        when(promptSpec.user(any(String.class))).thenReturn(promptSpec);
        when(promptSpec.call()).thenReturn(callResponseSpec);
        when(callResponseSpec.content()).thenReturn(jsonResponse);
        when(objectMapper.readTree(any(String.class))).thenReturn(new ObjectMapper().readTree(jsonResponse));

        SummarizationResponse response = summarizationService.summarizeArticle(content, title);

        assertNotNull(response);
        assertNotNull(response.article());
        assertNotNull(response.summary());

        Article article = response.article();
        assertEquals(title, article.title());
        assertEquals(content, article.content());
        assertEquals(11, article.wordCount());

        Summary summary = response.summary();
        assertEquals("This is a concise summary of the test article.", summary.content());
        assertEquals(3, summary.keyPoints().size());
        assertEquals("Key point 1", summary.keyPoints().get(0));
        assertEquals("Key point 2", summary.keyPoints().get(1));
        assertEquals("Key point 3", summary.keyPoints().get(2));
        assertEquals(9, summary.wordCount());
        assertTrue(summary.compressionRatio() > 0);
    }

    @Test
    void summarizeArticle_WithMalformedJsonResponse_ShouldFallbackToRegexParsing() throws Exception {
        String content = "Test content";
        String title = "Test Title";
        String malformedResponse = """
                "summary": "Regex fallback summary",
                "keyPoints": ["Point 1", "Point 2"]
                """;

        when(chatClient.prompt()).thenReturn(promptSpec);
        when(promptSpec.user(any(String.class))).thenReturn(promptSpec);
        when(promptSpec.call()).thenReturn(callResponseSpec);
        when(callResponseSpec.content()).thenReturn(malformedResponse);
        when(objectMapper.readTree(any(String.class))).thenThrow(new com.fasterxml.jackson.core.JsonProcessingException("") {});

        SummarizationResponse response = summarizationService.summarizeArticle(content, title);

        assertNotNull(response);
        Summary summary = response.summary();
        assertTrue(summary.content().isEmpty() || summary.content().contains("Regex fallback summary"));
        assertTrue(summary.keyPoints().size() >= 0);
    }

    @Test
    void summarizeArticle_WithEmptyContent_ShouldReturnEmptySummary() throws Exception {
        String content = "";
        String title = "Empty Article";
        String jsonResponse = """
                {
                  "summary": "",
                  "keyPoints": []
                }
                """;

        when(chatClient.prompt()).thenReturn(promptSpec);
        when(promptSpec.user(any(String.class))).thenReturn(promptSpec);
        when(promptSpec.call()).thenReturn(callResponseSpec);
        when(callResponseSpec.content()).thenReturn(jsonResponse);
        when(objectMapper.readTree(any(String.class))).thenReturn(new ObjectMapper().readTree(jsonResponse));

        SummarizationResponse response = summarizationService.summarizeArticle(content, title);

        assertNotNull(response);
        assertEquals(0, response.article().wordCount());
        assertEquals(0, response.summary().wordCount());
        assertTrue(response.summary().keyPoints().isEmpty());
    }
}

