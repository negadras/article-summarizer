package com.negadras.summarizer.controller;

import com.negadras.summarizer.dto.Article;
import com.negadras.summarizer.dto.SummarizationResponse;
import com.negadras.summarizer.dto.SummarizeRequest;
import com.negadras.summarizer.dto.UserSummaryDTO;
import com.negadras.summarizer.entity.User;
import com.negadras.summarizer.service.ScraperService;
import com.negadras.summarizer.service.SummarizationService;
import com.negadras.summarizer.service.UserSummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/summarize")
public class ArticleController {

    private final ScraperService scraperService;
    private final UserSummaryService userSummaryService;
    private final SummarizationService summarizationService;

    @Autowired
    public ArticleController(ScraperService scraperService,
                             UserSummaryService userSummaryService,
                             SummarizationService summarizationService) {

        this.scraperService = scraperService;
        this.userSummaryService = userSummaryService;
        this.summarizationService = summarizationService;
    }

    @PostMapping("/text")
    public ResponseEntity<SummarizationResponse> summarizeText(
            @RequestBody SummarizeRequest request,
            Authentication authentication) {
        if (request.content() == null || request.content().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        SummarizationResponse response = summarizationService.summarizeArticle(
                request.content(), request.content().substring(0, Math.min(request.content().length(), 100))
        );

        // Save summary for authenticated users
        saveSummary(authentication, response, request.content());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/url")
    public ResponseEntity<SummarizationResponse> summarizeUrl(
            @RequestBody SummarizeRequest request,
            Authentication authentication) {
        if (request.url() == null || request.url().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Article scrapedArticle = scraperService.scrapeArticleFromUrl(request.url());
        SummarizationResponse response = summarizationService.summarizeArticle(scrapedArticle.content(),
                scrapedArticle.title());

        // Save summary for authenticated users
        saveSummary(authentication, response, scrapedArticle.content());

        return ResponseEntity.ok(response);
    }

    private void saveSummary(Authentication authentication, SummarizationResponse response, String request) {
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            UserSummaryDTO userSummary = userSummaryService.createUserSummary(user, response, request);

            System.out.println("Created summary with ID: " + userSummary.id() + " for user: " + user.getUsername());
        }
    }
}
