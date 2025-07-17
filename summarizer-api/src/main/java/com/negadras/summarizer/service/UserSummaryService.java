package com.negadras.summarizer.service;

import com.negadras.summarizer.dto.SummarizationResponse;
import com.negadras.summarizer.dto.UserSummaryDTO;
import com.negadras.summarizer.entity.User;
import com.negadras.summarizer.entity.UserSummary;
import com.negadras.summarizer.repository.UserSummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for managing user summaries
 */
@Service
public class UserSummaryService {
    
    private final UserSummaryRepository userSummaryRepository;
    
    @Autowired
    public UserSummaryService(UserSummaryRepository userSummaryRepository) {
        this.userSummaryRepository = userSummaryRepository;
    }
    
    /**
     * Get user summaries with pagination and optional filtering
     */
    public Page<UserSummaryDTO> getUserSummaries(User user, int page, int size, Boolean saved, String sortBy, String sortOrder) {
        Sort sort = createSort(sortBy, sortOrder);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UserSummary> summariesPage;
        if (saved != null) {
            summariesPage = userSummaryRepository.findByUserAndSaved(user, saved, pageable);
        } else {
            summariesPage = userSummaryRepository.findByUser(user, pageable);
        }
        
        return summariesPage.map(this::convertToDTO);
    }
    
    /**
     * Get a specific user summary by ID
     */
    public Optional<UserSummaryDTO> getUserSummary(User user, Long summaryId) {
        return userSummaryRepository.findByIdAndUser(summaryId, user)
                .map(this::convertToDTO);
    }
    
    /**
     * Toggle saved status for a summary
     */
    @Transactional
    public boolean toggleSavedStatus(User user, Long summaryId, boolean saved) {
        Optional<UserSummary> summaryOpt = userSummaryRepository.findByIdAndUser(summaryId, user);
        
        if (summaryOpt.isPresent()) {
            UserSummary summary = summaryOpt.get();
            summary.setSaved(saved);
            userSummaryRepository.save(summary);
            return true;
        }
        
        return false;
    }
    
    /**
     * Create a new user summary from a summarization response
     */
    @Transactional
    public UserSummaryDTO createUserSummary(User user, SummarizationResponse response, String originalContent) {
        UserSummary summary = new UserSummary();
        summary.setUser(user);
        summary.setTitle(response.article().title());
        summary.setOriginalContent(originalContent);
        summary.setSummaryContent(response.summary().content());
        summary.setKeyPointsFromList(response.summary().keyPoints());
        summary.setOriginalWordCount(response.article().wordCount());
        summary.setSummaryWordCount(response.summary().wordCount());
        summary.setCompressionRatio(response.summary().compressionRatio());
        summary.setSaved(false);
        
        UserSummary savedSummary = userSummaryRepository.save(summary);
        return convertToDTO(savedSummary);
    }
    
    /**
     * Convert entity to DTO
     */
    private UserSummaryDTO convertToDTO(UserSummary summary) {
        return new UserSummaryDTO(
                summary.getId(),
                summary.getTitle(),
                summary.getSummaryContent(),
                summary.getKeyPointsList(),
                summary.getOriginalWordCount(),
                summary.getSummaryWordCount(),
                summary.getCompressionRatio(),
                summary.isSaved(),
                summary.getCreatedAt()
        );
    }
    
    /**
     * Create sort object based on parameters
     */
    private Sort createSort(String sortBy, String sortOrder) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        String sortField;
        switch (sortBy != null ? sortBy.toLowerCase() : "createdat") {
            case "title":
                sortField = "title";
                break;
            case "wordcount":
                sortField = "originalWordCount";
                break;
            case "createdat":
            default:
                sortField = "createdAt";
                break;
        }
        
        return Sort.by(direction, sortField);
    }
}