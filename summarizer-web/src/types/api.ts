import {z} from "zod";

// API request/response schemas
export const submitTextSchema = z.object({
  content: z.string().min(100, "Article must be at least 100 words"),
  title: z.string().optional(),
});

export const submitUrlSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
});

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

// User summary types
export interface UserSummary {
  id: string;
  title: string;
  summaryContent: string;
  keyPoints: string[];
  originalWordCount: number;
  summaryWordCount: number;
  compressionRatio: number;
  saved: boolean;
  createdAt: string;
}

export interface GetUserSummariesParams {
  page?: number;
  size?: number;
  saved?: boolean;
  sortBy?: 'createdAt' | 'title' | 'wordCount';
  sortOrder?: 'asc' | 'desc';
}

export interface UserSummariesResponse {
  summaries: UserSummary[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

// User stats types
export interface UserStats {
  totalSummaries: number;
  wordsSaved: number;
  timeSaved: number; // in minutes
}

// Showcase types
export interface ShowcaseSummary {
  id: string;
  title: string;
  snippet: string;
  keyPoints: string[];
  stats: {
    originalWords: number;
    summaryWords: number;
    compressionRatio: number;
  };
  category?: string;
  popularity: number;
}

export interface GetShowcaseParams {
  page?: number;
  size?: number;
  category?: string;
}

export interface ShowcaseResponse {
  summaries: ShowcaseSummary[];
  totalPages: number;
  currentPage: number;
}
