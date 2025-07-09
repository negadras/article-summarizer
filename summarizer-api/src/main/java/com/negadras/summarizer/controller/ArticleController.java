package com.negadras.summarizer.controller;

import com.negadras.summarizer.dto.Article;
import com.negadras.summarizer.dto.SummarizationResponse;
import com.negadras.summarizer.dto.SummarizeRequest;
import com.negadras.summarizer.service.ScraperService;
import com.negadras.summarizer.service.SummarizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/summarize")
public class ArticleController {

    private final ScraperService scraperService;
    private final SummarizationService summarizationService;

    public ArticleController(ScraperService scraperService,
                             SummarizationService summarizationService) {
        this.scraperService = scraperService;
        this.summarizationService = summarizationService;
    }

    @PostMapping("/text")
    public ResponseEntity<SummarizationResponse> summarizeText(@RequestBody SummarizeRequest request) {
        if (request.content() == null || request.content().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        SummarizationResponse response = summarizationService.summarizeArticle(
                request.content(), request.content().substring(0, Math.min(request.content().length(), 100))
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/url")
    public ResponseEntity<SummarizationResponse> summarizeUrl(@RequestBody SummarizeRequest request) {
        if (request.url() == null || request.url().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Article scrapedArticle = scraperService.scrapeArticleFromUrl(request.url());
        SummarizationResponse response = summarizationService.summarizeArticle(scrapedArticle.content(),
                scrapedArticle.title());

        return ResponseEntity.ok(response);
    }
}
