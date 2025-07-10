import { z } from "zod";

// API request/response schemas
export const submitTextSchema = z.object({
  content: z.string().min(100, "Article must be at least 100 words"),
  title: z.string().optional(),
});

export const submitUrlSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
});

export type SubmitTextRequest = z.infer<typeof submitTextSchema>;
export type SubmitUrlRequest = z.infer<typeof submitUrlSchema>;

// Response types to match Spring Boot backend
export interface SummarizationResponse {
  article: {
    title: string;
    content: string;
    wordCount: number;
  };
  summary: {
    content: string;
    keyPoints: string[];
    wordCount: number;
    compressionRatio: number;
  };
}