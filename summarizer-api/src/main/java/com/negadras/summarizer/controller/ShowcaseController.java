package com.negadras.summarizer.controller;

import com.negadras.summarizer.dto.ShowcaseSummaryDTO;
import com.negadras.summarizer.service.ShowcaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for retrieving showcase summaries
 */
@RestController
@RequestMapping("/api/summaries/showcase")
public class ShowcaseController {

    private final ShowcaseService showcaseService;

    @Autowired
    public ShowcaseController(ShowcaseService showcaseService) {
        this.showcaseService = showcaseService;
    }

    /**
     * Get showcase summaries with pagination and optional category filtering
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getShowcaseSummaries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "3") int size,
            @RequestParam(required = false) String category) {

        Page<ShowcaseSummaryDTO> summariesPage = showcaseService.getShowcaseSummaries(page, size, category);

        Map<String, Object> response = new HashMap<>();
        response.put("summaries", summariesPage.getContent());
        response.put("currentPage", summariesPage.getNumber());
        response.put("totalPages", summariesPage.getTotalPages());

        return ResponseEntity.ok(response);
    }
}
