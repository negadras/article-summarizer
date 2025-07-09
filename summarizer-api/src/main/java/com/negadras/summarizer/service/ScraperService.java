package com.negadras.summarizer.service;

import com.negadras.summarizer.dto.Article;
import com.negadras.summarizer.exception.ArticleScrapingException;
import com.negadras.summarizer.util.TextUtils;
import org.jsoup.Jsoup;
import org.jsoup.helper.ValidationException;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ScraperService {

    private static final int MIN_CONTENT_LENGTH = 500;
    private static final int MIN_FALLBACK_CONTENT_LENGTH = 100;

    public Article scrapeArticleFromUrl(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .get();

            String title = extractTitle(doc);
            String content = extractContent(doc);

            if (content.length() < MIN_FALLBACK_CONTENT_LENGTH) {
                throw new ArticleScrapingException("Unable to extract sufficient content from the URL. The article may be behind a paywall or require JavaScript.");
            }

            int wordCount = TextUtils.countWords(content);

            return new Article(title, content, wordCount);
        } catch (IOException e) {
            throw new ArticleScrapingException("Failed to connect to the URL: " + url, e);
        } catch (ValidationException e) {
            throw new ArticleScrapingException("Invalid URL: " + url, e);
        } catch (IllegalArgumentException e) {
            throw new ArticleScrapingException("Invalid URL: " + url, e);
        }
    }

    private String extractTitle(Document doc) {
        String title = doc.title();
        if (title == null || title.trim().isEmpty()) {
            Element ogTitle = doc.selectFirst("meta[property=og:title]");
            if (ogTitle != null) {
                title = ogTitle.attr("content");
            }
        }
        return (title == null || title.trim().isEmpty()) ? "Untitled Article" : title;
    }

    private String extractContent(Document doc) {
        doc.select("script, style, nav, header, footer, aside, .advertisement, .ads, .social-share").remove();

        String content = "";
        Set<String> contentSelectors = new HashSet<>(Arrays.asList(
                "article",
                "[role=main]",
                ".post-content",
                ".article-content",
                ".entry-content",
                ".content",
                "main",
                ".post-body",
                ".article-body"
        ));

        for (String selector : contentSelectors) {
            Element element = doc.selectFirst(selector);
            if (element != null) {
                content = element.text().trim();
                if (content.length() > MIN_CONTENT_LENGTH) {
                    break;
                }
            }
        }

        if (content.length() < MIN_CONTENT_LENGTH) {
            content = doc.select("p").stream()
                    .map(Element::text)
                    .collect(Collectors.joining(" "));
        }

        return content
                .replaceAll("\\s+", " ")
                .replaceAll("\\n+", " ")
                .trim();
    }
}
