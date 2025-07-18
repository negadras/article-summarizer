package com.negadras.summarizer.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.negadras.summarizer.dto.Article;
import com.negadras.summarizer.dto.SummarizationResponse;
import com.negadras.summarizer.dto.Summary;
import com.negadras.summarizer.exception.SummarizationException;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.negadras.summarizer.util.TextUtils.countWords;

@Service
public class SummarizationService {

    private static final String AI_PROMPT_TEMPLATE = """
        Please analyze and summarize the following article for a professional audience who wants to quickly understand the key concepts and actionable insights.
        
        Requirements:
        1. SUMMARY: Write a 2-3 sentence paragraph that explains:
           - What the article is about
           - The main problem it addresses or solution it provides
           - Who would benefit from reading it
        
        2. KEY POINTS: Provide exactly 3-5 distinct, actionable takeaways that:
           - Focus on practical insights or implementations
           - Avoid repeating information from the summary
           - Are specific enough to be useful
           - Each point should be 10-20 words maximum
        
        3. QUALITY STANDARDS:
           - Be accurate and professional
           - Avoid redundancy between summary and key points
           - Focus on value for the reader
        
        Article content:
        %s
        
        Respond in valid JSON format:
        {
          "summary": "2-3 sentence summary focusing on what, why, and who",
          "keyPoints": ["actionable insight 1", "specific takeaway 2", "practical point 3"]
        }
        """;

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public SummarizationService(ChatClient chatClient, ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    public SummarizationResponse summarizeArticle(String content, String title) {
        int originalWordCount = countWords(content);
        String prompt = String.format(AI_PROMPT_TEMPLATE, content);

        try {
            String aiResponseContent = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            String summaryContent;
            List<String> keyPoints;

            try {
                JsonNode jsonNode = objectMapper.readTree(aiResponseContent);
                summaryContent = jsonNode.has("summary") ? jsonNode.get("summary").asText() : "";
                keyPoints = jsonNode.has("keyPoints") && jsonNode.get("keyPoints").isArray() ? parseKeyPoints(jsonNode.get("keyPoints")) : new ArrayList<>();
            } catch (JsonProcessingException e) {
                // Fallback to regex parsing if JSON parsing fails
                summaryContent = parseWithRegex(aiResponseContent, "\"summary\":\\s*\"(.*?)\"");
                String keyPointsRaw = parseWithRegex(aiResponseContent, "\"keyPoints\":\\s*\\[(.*?)\\]");
                keyPoints = Arrays.stream(keyPointsRaw.split(","))
                        .map(s -> s.trim().replaceAll("^\"|\"$", ""))
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
            }

            int summaryWordCount = countWords(summaryContent);
            int compressionRatio = originalWordCount > 0 ? (int) (((double) (originalWordCount - summaryWordCount) / originalWordCount) * 100) : 0;

            Article article = new Article(title, content, originalWordCount);
            Summary summary = new Summary(summaryContent, keyPoints, summaryWordCount, compressionRatio);

            return new SummarizationResponse(article, summary);
        } catch (NonTransientAiException e) {
            throw e;
        } catch (Exception e) {
            throw new SummarizationException("Failed to summarize the article.", e);
        }
    }

    private List<String> parseKeyPoints(JsonNode keyPointsNode) {
        List<String> keyPoints = new ArrayList<>();
        for (JsonNode keyPointNode : keyPointsNode) {
            keyPoints.add(keyPointNode.asText());
        }

        return keyPoints;
    }

    private String parseWithRegex(String text, String regex) {
        Pattern pattern = Pattern.compile(regex, Pattern.DOTALL);
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group(1) : "";
    }
}
