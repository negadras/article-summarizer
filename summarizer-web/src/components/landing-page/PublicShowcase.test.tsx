import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import PublicShowcase from './PublicShowcase';
import {showcaseService} from '@/lib/showcaseService';

// Mock the showcaseService
vi.mock('@/lib/showcaseService', () => ({
  showcaseService: {
    getShowcaseSummaries: vi.fn()
  }
}));

// Mock window.location
const mockLocation = {
  reload: vi.fn()
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('PublicShowcase', () => {
  const mockShowcaseSummaries = {
    summaries: [
      {
        id: '1',
        title: 'Climate Change Impact',
        snippet: 'This is a test showcase summary about climate change',
        keyPoints: ['Point 1', 'Point 2', 'Point 3'],
        stats: {
          originalWords: 1000,
          summaryWords: 100,
          compressionRatio: 90
        },
        category: 'Environment',
        popularity: 95
      },
      {
        id: '2',
        title: 'Quantum Computing Advances',
        snippet: 'This is a test showcase summary about quantum computing',
        keyPoints: ['Point A', 'Point B', 'Point C'],
        stats: {
          originalWords: 2000,
          summaryWords: 200,
          compressionRatio: 90
        },
        category: 'Technology',
        popularity: 92
      },
      {
        id: '3',
        title: 'Remote Work Trends',
        snippet: 'This is a test showcase summary about remote work',
        keyPoints: ['Point X', 'Point Y', 'Point Z'],
        stats: {
          originalWords: 1500,
          summaryWords: 150,
          compressionRatio: 90
        },
        category: 'Business',
        popularity: 88
      }
    ],
    totalPages: 1,
    currentPage: 0
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock
    vi.mocked(showcaseService.getShowcaseSummaries).mockResolvedValue(mockShowcaseSummaries);

    // Reset window.location.reload
    mockLocation.reload = vi.fn();
  });

  it('should render loading state initially', () => {
    render(<PublicShowcase />);

    expect(screen.getByText('Popular')).toBeInTheDocument();
    expect(screen.getByText('Summaries')).toBeInTheDocument();
    expect(screen.getByText(/Discover how others are using ArticleAI/)).toBeInTheDocument();
    // Check for loading animation
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render showcase summaries when loaded', async () => {
    render(<PublicShowcase />);

    await waitFor(() => {
      expect(screen.getByText('Climate Change Impact')).toBeInTheDocument();
      expect(screen.getByText('Quantum Computing Advances')).toBeInTheDocument();
      expect(screen.getByText('Remote Work Trends')).toBeInTheDocument();
    });

    expect(showcaseService.getShowcaseSummaries).toHaveBeenCalledWith({ size: 3 });

    // Check for key points
    expect(screen.getByText('Point 1')).toBeInTheDocument();
    expect(screen.getByText('Point A')).toBeInTheDocument();
    expect(screen.getByText('Point X')).toBeInTheDocument();

    // Check for stats
    expect(screen.getByText('1000 words')).toBeInTheDocument();
    expect(screen.getByText('100 words')).toBeInTheDocument();
  });

  it('should render error state when API fails', async () => {
    vi.mocked(showcaseService.getShowcaseSummaries).mockRejectedValue(new Error('API Error'));

    render(<PublicShowcase />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load showcase summaries at this time.')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should reload page when clicking try again button in error state', async () => {
    vi.mocked(showcaseService.getShowcaseSummaries).mockRejectedValue(new Error('API Error'));

    render(<PublicShowcase />);

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    expect(mockLocation.reload).toHaveBeenCalled();
  });

  it('should display category and compression ratio', async () => {
    render(<PublicShowcase />);

    await waitFor(() => {
      expect(screen.getByText('Climate Change Impact')).toBeInTheDocument();
    });

    // Check for category and compression ratio
    expect(screen.getByText(/Environment/)).toBeInTheDocument();
    // Use getAllByText since there are multiple elements with this text
    expect(screen.getAllByText(/90% shorter/).length).toBeGreaterThan(0);
  });

  it('should display key points section for each summary', async () => {
    render(<PublicShowcase />);

    await waitFor(() => {
      expect(screen.getByText('Climate Change Impact')).toBeInTheDocument();
    });

    // Check for key points heading
    expect(screen.getAllByText('Key Points:').length).toBe(3);

    // Check for key points content
    expect(screen.getByText('Point 1')).toBeInTheDocument();
    expect(screen.getByText('Point 2')).toBeInTheDocument();
    expect(screen.getByText('Point 3')).toBeInTheDocument();
    expect(screen.getByText('Point A')).toBeInTheDocument();
    expect(screen.getByText('Point B')).toBeInTheDocument();
    expect(screen.getByText('Point C')).toBeInTheDocument();
  });

  it('should display view more examples button', async () => {
    render(<PublicShowcase />);

    await waitFor(() => {
      expect(screen.getByText('Climate Change Impact')).toBeInTheDocument();
    });

    expect(screen.getByText('View More Examples')).toBeInTheDocument();
  });
});
