package com.negadras.summarizer.dto;

import java.util.List;

public record Summary(String content, List<String> keyPoints,
                       int wordCount, int compressionRatio) { }
