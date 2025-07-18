package com.negadras.summarizer.repository;

import com.negadras.summarizer.entity.User;
import com.negadras.summarizer.entity.UserSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for managing user summaries
 */
@Repository
public interface UserSummaryRepository extends JpaRepository<UserSummary, Long> {
    
    /**
     * Find all summaries for a specific user with pagination
     */
    Page<UserSummary> findByUser(User user, Pageable pageable);
    
    /**
     * Find all saved/unsaved summaries for a specific user with pagination
     */
    Page<UserSummary> findByUserAndSaved(User user, boolean saved, Pageable pageable);
    
    /**
     * Find a specific summary by ID and user
     */
    Optional<UserSummary> findByIdAndUser(Long id, User user);
    
    /**
     * Count the total number of summaries for a user
     */
    long countByUser(User user);
    
    /**
     * Calculate the total number of words in original content for a user
     */
    @Query("SELECT SUM(us.originalWordCount) FROM UserSummary us WHERE us.user = :user")
    Integer sumOriginalWordCountByUser(@Param("user") User user);
    
    /**
     * Calculate the total number of words in summary content for a user
     */
    @Query("SELECT SUM(us.summaryWordCount) FROM UserSummary us WHERE us.user = :user")
    Integer sumSummaryWordCountByUser(@Param("user") User user);
    
    /**
     * Find popular summaries for showcase (anonymized)
     * This query could be customized based on specific criteria for "popular" summaries
     */
    @Query(value = "SELECT * FROM user_summaries ORDER BY created_at DESC LIMIT :limit", 
           nativeQuery = true)
    Page<UserSummary> findPopularSummaries(Pageable pageable, @Param("limit") int limit);
    
    /**
     * Find popular summaries by category
     */
    @Query(value = "SELECT * FROM user_summaries WHERE title ILIKE %:category% ORDER BY created_at DESC", 
           nativeQuery = true)
    Page<UserSummary> findPopularSummariesByCategory(Pageable pageable, @Param("category") String category);
}