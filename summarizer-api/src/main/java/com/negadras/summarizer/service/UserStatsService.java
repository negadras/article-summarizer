package com.negadras.summarizer.service;

import com.negadras.summarizer.dto.UserStatsDTO;
import com.negadras.summarizer.entity.User;
import com.negadras.summarizer.repository.UserSummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * Service for calculating user statistics
 */
@Service
public class UserStatsService {
    
    private final UserSummaryRepository userSummaryRepository;
    
    @Autowired
    public UserStatsService(UserSummaryRepository userSummaryRepository) {
        this.userSummaryRepository = userSummaryRepository;
    }
    
    /**
     * Get statistics for a user
     * Uses caching to improve performance
     */
    @Cacheable(value = "userStats", key = "#user.id")
    public UserStatsDTO getUserStats(User user) {
        // Get total number of summaries
        int totalSummaries = (int) userSummaryRepository.countByUser(user);
        
        // Calculate words saved (difference between original and summary word counts)
        Integer originalWordCount = userSummaryRepository.sumOriginalWordCountByUser(user);
        Integer summaryWordCount = userSummaryRepository.sumSummaryWordCountByUser(user);
        
        int wordsSaved = 0;
        if (originalWordCount != null && summaryWordCount != null) {
            wordsSaved = originalWordCount - summaryWordCount;
        }
        
        // Estimate time saved (assuming average reading speed of 200 words per minute)
        int timeSaved = wordsSaved / 200;
        
        return new UserStatsDTO(totalSummaries, wordsSaved, timeSaved);
    }
}