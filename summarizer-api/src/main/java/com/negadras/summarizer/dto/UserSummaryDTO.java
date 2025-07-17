package com.negadras.summarizer.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for user summary data
 */
public record UserSummaryDTO(
    Long id,
    String title,
    String summaryContent,
    List<String> keyPoints,
    int originalWordCount,
    int summaryWordCount,
    int compressionRatio,
    boolean saved,
    LocalDateTime createdAt
) {}
