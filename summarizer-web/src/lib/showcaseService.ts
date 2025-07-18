import {GetShowcaseParams, ShowcaseResponse, ShowcaseSummary} from "@/types/api";
import {cacheService} from "./cacheService";

/**
 * Service for fetching public showcase summaries with optimized performance
 */
export const showcaseService = {
  /**
   * Get public showcase summaries with optional filtering and pagination
   * Uses enhanced caching for better performance
   */
  getShowcaseSummaries: async (params?: GetShowcaseParams): Promise<ShowcaseResponse> => {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.category) queryParams.append('category', params.category);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      // Create cache key based on the request parameters
      const cacheKey = `showcase_${queryString}`;

      return cacheService.getOrFetch(
        cacheKey,
        async () => {
          try {
            // For development purposes, return mock data
            return {
              summaries: getMockShowcaseSummaries(),
              totalPages: 1,
              currentPage: 0
            };

          } catch (error) {
            console.error('Error fetching showcase summaries:', error);

            // Return mock data as fallback
            return {
              summaries: getMockShowcaseSummaries(),
              totalPages: 1,
              currentPage: 0
            };
          }
        },
        300 // Cache for 5 minutes (public data can be cached longer)
      );
    } catch (error) {
      console.error('Error in getShowcaseSummaries:', error);

      // Return mock data for now (in a real app, we'd handle this differently)
      return {
        summaries: getMockShowcaseSummaries(),
        totalPages: 1,
        currentPage: 0
      };
    }
  },
  /**
   * Clear showcase cache
   * This should be called when showcase data might have changed
   */
  clearCache: () => {
    cacheService.clearByPrefix('showcase_');
  }
};

/**
 * Get mock showcase summaries for development and fallback
 */
function getMockShowcaseSummaries(): ShowcaseSummary[] {
  return [
    {
      id: "1",
      title: "The Impact of Climate Change on Global Agriculture",
      snippet: "Climate change is affecting agricultural productivity worldwide through rising temperatures, changing precipitation patterns, and extreme weather events...",
      keyPoints: [
        "Global crop yields could decrease by up to 30% by 2050",
        "Adaptation strategies include drought-resistant crops and precision farming",
        "Small-scale farmers in developing countries face the greatest risks"
      ],
      stats: {
        originalWords: 2450,
        summaryWords: 245,
        compressionRatio: 90
      },
      category: "Environment",
      popularity: 95
    },
    {
      id: "2",
      title: "Advancements in Quantum Computing: A 2025 Perspective",
      snippet: "Quantum computing has made significant strides in the past year, with several breakthroughs in qubit stability and quantum error correction...",
      keyPoints: [
        "IBM and Google achieved quantum advantage in new problem domains",
        "Error correction improvements have increased quantum circuit depth",
        "Financial and pharmaceutical industries lead in quantum application development"
      ],
      stats: {
        originalWords: 3200,
        summaryWords: 320,
        compressionRatio: 90
      },
      category: "Technology",
      popularity: 92
    },
    {
      id: "3",
      title: "The Evolution of Remote Work: Post-Pandemic Trends",
      snippet: "Remote work has evolved from a pandemic necessity to a permanent fixture in the global workplace, with companies adopting hybrid models...",
      keyPoints: [
        "70% of companies now offer permanent hybrid work options",
        "Productivity metrics show improvements in remote work settings",
        "Office spaces are being redesigned for collaboration rather than daily work"
      ],
      stats: {
        originalWords: 1800,
        summaryWords: 180,
        compressionRatio: 90
      },
      category: "Business",
      popularity: 88
    }
  ];
}
