package com.negadras.summarizer.dto;

/**
 * DTO for user statistics
 */
public record UserStatsDTO(
    int totalSummaries,
    int wordsSaved,
    int timeSaved
) {}
