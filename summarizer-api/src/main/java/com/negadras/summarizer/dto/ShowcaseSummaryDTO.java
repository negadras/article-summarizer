package com.negadras.summarizer.dto;

import java.util.List;

/**
 * DTO for showcase summary data (anonymized)
 */
public record ShowcaseSummaryDTO(
    String id,
    String title,
    String snippet,
    List<String> keyPoints,
    SummaryStats stats,
    String category,
    int popularity
) {
    // Nested record for summary statistics
    public record SummaryStats(
        int originalWords,
        int summaryWords,
        int compressionRatio
    ) {}
}
