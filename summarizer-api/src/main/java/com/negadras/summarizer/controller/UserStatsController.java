package com.negadras.summarizer.controller;

import com.negadras.summarizer.dto.UserStatsDTO;
import com.negadras.summarizer.entity.User;
import com.negadras.summarizer.service.UserStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for retrieving user statistics
 */
@RestController
@RequestMapping("/api/users/me/stats")
public class UserStatsController {

    private final UserStatsService userStatsService;

    @Autowired
    public UserStatsController(UserStatsService userStatsService) {
        this.userStatsService = userStatsService;
    }

    /**
     * Get statistics for the authenticated user
     */
    @GetMapping
    public ResponseEntity<UserStatsDTO> getUserStats(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        User user = (User) authentication.getPrincipal();
        UserStatsDTO stats = userStatsService.getUserStats(user);

        return ResponseEntity.ok(stats);
    }
}
