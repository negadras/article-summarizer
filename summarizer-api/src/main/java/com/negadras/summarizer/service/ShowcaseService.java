package com.negadras.summarizer.service;

import com.negadras.summarizer.dto.ShowcaseSummaryDTO;
import com.negadras.summarizer.entity.UserSummary;
import com.negadras.summarizer.repository.UserSummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Random;

/**
 * Service for retrieving showcase summaries
 */
@Service
public class ShowcaseService {
    
    private final UserSummaryRepository userSummaryRepository;
    private final Random random = new Random();
    
    @Autowired
    public ShowcaseService(UserSummaryRepository userSummaryRepository) {
        this.userSummaryRepository = userSummaryRepository;
    }
    
    /**
     * Get showcase summaries with pagination and optional category filtering
     * Uses caching to improve performance
     */
    @Cacheable(value = "showcaseSummaries", key = "{#page, #size, #category}")
    public Page<ShowcaseSummaryDTO> getShowcaseSummaries(int page, int size, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        Page<UserSummary> summariesPage;
        if (category != null && !category.isEmpty()) {
            summariesPage = userSummaryRepository.findPopularSummariesByCategory(pageable, category);
        } else {
            summariesPage = userSummaryRepository.findPopularSummaries(pageable, size * 3); // Get more than needed for randomization
        }
        
        return summariesPage.map(this::convertToDTO);
    }
    
    /**
     * Convert entity to DTO with anonymization
     */
    private ShowcaseSummaryDTO convertToDTO(UserSummary summary) {
        // Create a snippet from the summary content (first 150 characters)
        String snippet = summary.getSummaryContent();
        if (snippet.length() > 150) {
            snippet = snippet.substring(0, 147) + "...";
        }
        
        // Determine a category based on the title (simplified approach)
        String category = determineCategory(summary.getTitle());
        
        // Generate a random popularity score (in a real app, this would be based on actual metrics)
        int popularity = 80 + random.nextInt(20);
        
        return new ShowcaseSummaryDTO(
                summary.getId().toString(), // Convert to string to hide actual IDs
                summary.getTitle(),
                snippet,
                summary.getKeyPointsList(),
                new ShowcaseSummaryDTO.SummaryStats(
                        summary.getOriginalWordCount(),
                        summary.getSummaryWordCount(),
                        summary.getCompressionRatio()
                ),
                category,
                popularity
        );
    }
    
    /**
     * Simple method to determine a category based on the title
     * In a real app, this would use more sophisticated categorization
     */
    private String determineCategory(String title) {
        String lowerTitle = title.toLowerCase();
        
        if (lowerTitle.contains("technology") || lowerTitle.contains("tech") || 
            lowerTitle.contains("ai") || lowerTitle.contains("software")) {
            return "Technology";
        } else if (lowerTitle.contains("business") || lowerTitle.contains("economy") || 
                   lowerTitle.contains("finance") || lowerTitle.contains("market")) {
            return "Business";
        } else if (lowerTitle.contains("science") || lowerTitle.contains("research") || 
                   lowerTitle.contains("study")) {
            return "Science";
        } else if (lowerTitle.contains("health") || lowerTitle.contains("medical") || 
                   lowerTitle.contains("wellness")) {
            return "Health";
        } else {
            return "General";
        }
    }
}