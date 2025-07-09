package com.negadras.summarizer.dto;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DtoValidationTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void article_ShouldSerializeAndDeserializeCorrectly() throws JsonProcessingException {
        Article article = new Article("Test Title", "Test Content", 2);
        
        String json = objectMapper.writeValueAsString(article);
        Article deserializedArticle = objectMapper.readValue(json, Article.class);
        
        assertEquals(article.title(), deserializedArticle.title());
        assertEquals(article.content(), deserializedArticle.content());
        assertEquals(article.wordCount(), deserializedArticle.wordCount());
    }

    @Test
    void summary_ShouldSerializeAndDeserializeCorrectly() throws JsonProcessingException {
        List<String> keyPoints = Arrays.asList("Point 1", "Point 2", "Point 3");
        Summary summary = new Summary("Test summary content", keyPoints, 3, 75);
        
        String json = objectMapper.writeValueAsString(summary);
        Summary deserializedSummary = objectMapper.readValue(json, Summary.class);
        
        assertEquals(summary.content(), deserializedSummary.content());
        assertEquals(summary.keyPoints(), deserializedSummary.keyPoints());
        assertEquals(summary.wordCount(), deserializedSummary.wordCount());
        assertEquals(summary.compressionRatio(), deserializedSummary.compressionRatio());
    }

    @Test
    void summarizeRequest_ShouldSerializeAndDeserializeCorrectly() throws JsonProcessingException {
        SummarizeRequest request = new SummarizeRequest("Test content", "https://example.com");
        
        String json = objectMapper.writeValueAsString(request);
        SummarizeRequest deserializedRequest = objectMapper.readValue(json, SummarizeRequest.class);
        
        assertEquals(request.content(), deserializedRequest.content());
        assertEquals(request.url(), deserializedRequest.url());
    }

    @Test
    void summarizationResponse_ShouldSerializeAndDeserializeCorrectly() throws JsonProcessingException {
        Article article = new Article("Test Title", "Test Content", 2);
        List<String> keyPoints = Arrays.asList("Point 1", "Point 2");
        Summary summary = new Summary("Test summary", keyPoints, 2, 0);
        SummarizationResponse response = new SummarizationResponse(article, summary);
        
        String json = objectMapper.writeValueAsString(response);
        SummarizationResponse deserializedResponse = objectMapper.readValue(json, SummarizationResponse.class);
        
        assertEquals(response.article().title(), deserializedResponse.article().title());
        assertEquals(response.article().content(), deserializedResponse.article().content());
        assertEquals(response.article().wordCount(), deserializedResponse.article().wordCount());
        assertEquals(response.summary().content(), deserializedResponse.summary().content());
        assertEquals(response.summary().keyPoints(), deserializedResponse.summary().keyPoints());
        assertEquals(response.summary().wordCount(), deserializedResponse.summary().wordCount());
        assertEquals(response.summary().compressionRatio(), deserializedResponse.summary().compressionRatio());
    }

    @Test
    void summarizeRequest_WithNullValues_ShouldHandleGracefully() throws JsonProcessingException {
        SummarizeRequest request = new SummarizeRequest(null, null);
        
        String json = objectMapper.writeValueAsString(request);
        SummarizeRequest deserializedRequest = objectMapper.readValue(json, SummarizeRequest.class);
        
        assertNull(deserializedRequest.content());
        assertNull(deserializedRequest.url());
    }

    @Test
    void summary_WithEmptyKeyPoints_ShouldHandleGracefully() throws JsonProcessingException {
        List<String> emptyKeyPoints = Arrays.asList();
        Summary summary = new Summary("Test summary", emptyKeyPoints, 2, 0);
        
        String json = objectMapper.writeValueAsString(summary);
        Summary deserializedSummary = objectMapper.readValue(json, Summary.class);
        
        assertEquals(summary.content(), deserializedSummary.content());
        assertTrue(deserializedSummary.keyPoints().isEmpty());
        assertEquals(summary.wordCount(), deserializedSummary.wordCount());
        assertEquals(summary.compressionRatio(), deserializedSummary.compressionRatio());
    }

    @Test
    void article_WithZeroWordCount_ShouldHandleGracefully() throws JsonProcessingException {
        Article article = new Article("Empty Title", "", 0);
        
        String json = objectMapper.writeValueAsString(article);
        Article deserializedArticle = objectMapper.readValue(json, Article.class);
        
        assertEquals(article.title(), deserializedArticle.title());
        assertEquals(article.content(), deserializedArticle.content());
        assertEquals(0, deserializedArticle.wordCount());
    }

    @Test
    void summary_WithNegativeCompressionRatio_ShouldHandleGracefully() throws JsonProcessingException {
        List<String> keyPoints = Arrays.asList("Point 1");
        Summary summary = new Summary("Long summary content", keyPoints, 3, -10);
        
        String json = objectMapper.writeValueAsString(summary);
        Summary deserializedSummary = objectMapper.readValue(json, Summary.class);
        
        assertEquals(summary.content(), deserializedSummary.content());
        assertEquals(summary.keyPoints(), deserializedSummary.keyPoints());
        assertEquals(summary.wordCount(), deserializedSummary.wordCount());
        assertEquals(-10, deserializedSummary.compressionRatio());
    }

    @Test
    void jsonProperties_ShouldMatchExpectedFormat() throws JsonProcessingException {
        Article article = new Article("Title", "Content", 1);
        List<String> keyPoints = Arrays.asList("Point");
        Summary summary = new Summary("Summary", keyPoints, 1, 0);
        SummarizationResponse response = new SummarizationResponse(article, summary);
        
        String json = objectMapper.writeValueAsString(response);
        
        assertTrue(json.contains("\"title\":\"Title\""));
        assertTrue(json.contains("\"content\":\"Content\""));
        assertTrue(json.contains("\"wordCount\":1"));
        assertTrue(json.contains("\"keyPoints\":[\"Point\"]"));
        assertTrue(json.contains("\"compressionRatio\":0"));
    }
}