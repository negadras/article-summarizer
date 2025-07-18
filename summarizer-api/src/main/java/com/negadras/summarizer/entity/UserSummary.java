package com.negadras.summarizer.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a summary created by a user
 */
@Entity
@Table(name = "user_summaries")
public class UserSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String originalContent;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String summaryContent;

    @Column(columnDefinition = "TEXT")
    private String keyPoints;

    @Column(name = "original_word_count")
    private int originalWordCount;

    @Column(name = "summary_word_count")
    private int summaryWordCount;

    @Column(name = "compression_ratio")
    private int compressionRatio;

    @Column(name = "is_saved")
    private boolean saved;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UserSummary() {
    }

    public UserSummary(User user, String title, String originalContent, String summaryContent,
                      String keyPoints, int originalWordCount, int summaryWordCount,
                      int compressionRatio) {
        this.user = user;
        this.title = title;
        this.originalContent = originalContent;
        this.summaryContent = summaryContent;
        this.keyPoints = keyPoints;
        this.originalWordCount = originalWordCount;
        this.summaryWordCount = summaryWordCount;
        this.compressionRatio = compressionRatio;
        this.saved = false;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Convert string of key points to list
    public List<String> getKeyPointsList() {
        if (keyPoints == null || keyPoints.isEmpty()) {
            return new ArrayList<>();
        }

        // Assuming key points are stored as comma-separated values
        String[] points = keyPoints.split("\\|");
        List<String> result = new ArrayList<>();

        for (String point : points) {
            if (!point.trim().isEmpty()) {
                result.add(point.trim());
            }
        }

        return result;
    }

    // Set key points from list
    public void setKeyPointsFromList(List<String> points) {
        if (points == null || points.isEmpty()) {
            this.keyPoints = "";
            return;
        }

        StringBuilder sb = new StringBuilder();
        for (String point : points) {
            if (sb.length() > 0) {
                sb.append("|");
            }
            sb.append(point.trim());
        }

        this.keyPoints = sb.toString();
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOriginalContent() {
        return originalContent;
    }

    public void setOriginalContent(String originalContent) {
        this.originalContent = originalContent;
    }

    public String getSummaryContent() {
        return summaryContent;
    }

    public void setSummaryContent(String summaryContent) {
        this.summaryContent = summaryContent;
    }

    public String getKeyPoints() {
        return keyPoints;
    }

    public void setKeyPoints(String keyPoints) {
        this.keyPoints = keyPoints;
    }

    public int getOriginalWordCount() {
        return originalWordCount;
    }

    public void setOriginalWordCount(int originalWordCount) {
        this.originalWordCount = originalWordCount;
    }

    public int getSummaryWordCount() {
        return summaryWordCount;
    }

    public void setSummaryWordCount(int summaryWordCount) {
        this.summaryWordCount = summaryWordCount;
    }

    public int getCompressionRatio() {
        return compressionRatio;
    }

    public void setCompressionRatio(int compressionRatio) {
        this.compressionRatio = compressionRatio;
    }

    public boolean isSaved() {
        return saved;
    }

    public void setSaved(boolean saved) {
        this.saved = saved;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
