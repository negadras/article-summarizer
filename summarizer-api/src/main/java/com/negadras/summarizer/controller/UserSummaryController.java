package com.negadras.summarizer.controller;

import com.negadras.summarizer.dto.UserSummaryDTO;
import com.negadras.summarizer.entity.User;
import com.negadras.summarizer.service.UserSummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller for managing user summaries
 */
@RestController
@RequestMapping("/api/users/me/summaries")
public class UserSummaryController {

    private final UserSummaryService userSummaryService;

    @Autowired
    public UserSummaryController(UserSummaryService userSummaryService) {
        this.userSummaryService = userSummaryService;
    }

    /**
     * Get user summaries with pagination and optional filtering
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserSummaries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean saved,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        Page<UserSummaryDTO> summariesPage = userSummaryService.getUserSummaries(
                user, page, size, saved, sortBy, sortOrder);

        Map<String, Object> response = new HashMap<>();
        response.put("summaries", summariesPage.getContent());
        response.put("currentPage", summariesPage.getNumber());
        response.put("totalPages", summariesPage.getTotalPages());
        response.put("totalCount", summariesPage.getTotalElements());

        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific user summary by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryDTO> getUserSummary(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        Optional<UserSummaryDTO> summary = userSummaryService.getUserSummary(user, id);

        return summary.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Save a summary
     */
    @PostMapping("/{id}/save")
    public ResponseEntity<Void> saveSummary(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        boolean success = userSummaryService.toggleSavedStatus(user, id, true);

        return success ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    /**
     * Unsave a summary
     */
    @DeleteMapping("/{id}/save")
    public ResponseEntity<Void> unsaveSummary(
            @PathVariable Long id,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        boolean success = userSummaryService.toggleSavedStatus(user, id, false);

        return success ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
