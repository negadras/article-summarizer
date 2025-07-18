import {SummarizationResponse} from "./api";

// Public showcase summary type
export interface PublicSummary {
  id: string;
  title: string;
  snippet: string; // Short preview of the summary
  keyPoints: string[];
  stats: {
    originalWords: number;
    summaryWords: number;
    compressionRatio: number;
  };
  category?: string;
  popularity: number; // Metric for sorting showcase items
}

// User summary history type
export interface UserSummary extends SummarizationResponse {
  id: string;
  userId: string;
  createdAt: string; // ISO date string
  isSaved: boolean;
  tags?: string[];
  lastViewed?: string; // ISO date string
}

// User preferences type
export interface UserPreferences {
  dashboardLayout?: 'grid' | 'list';
  defaultSummarizeOption?: 'text' | 'url';
  theme?: 'light' | 'dark' | 'system';
}

// User stats type
export interface UserStats {
  totalSummaries: number;
  wordsSaved: number;
  timeSaved: number; // estimated in minutes
}

// Extended user type with preferences and stats
export interface ExtendedUser {
  id: string;
  username: string;
  email: string;
  role: string;
  preferences?: UserPreferences;
  stats?: UserStats;
}

// Public showcase API params
export interface GetShowcaseParams {
  page?: number;
  limit?: number;
  category?: string;
}

// Public showcase API response
export interface ShowcaseResponse {
  summaries: PublicSummary[];
  totalPages: number;
  currentPage: number;
}

// User summaries API params
export interface GetUserSummariesParams {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'title' | 'wordCount';
  sortOrder?: 'asc' | 'desc';
  saved?: boolean;
}

// User summaries API response
export interface UserSummariesResponse {
  summaries: UserSummary[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}
