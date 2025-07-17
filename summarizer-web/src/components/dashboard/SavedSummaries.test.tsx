import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import SavedSummaries from './SavedSummaries';
import {userSummaryService} from '@/lib/userSummaryService';
import {useToast} from '@/hooks/use-toast';

// Mock the userSummaryService
vi.mock('@/lib/userSummaryService', () => ({
  userSummaryService: {
    getUserSummaries: vi.fn(),
    toggleSavedStatus: vi.fn()
  }
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

// Mock window.location
const mockLocation = {
  href: ''
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

describe('SavedSummaries', () => {
  const mockToast = {
    toast: vi.fn()
  };

  const mockSavedSummaries = {
    summaries: [
      {
        id: '1',
        title: 'Test Summary 1',
        summaryContent: 'This is a test summary content',
        keyPoints: ['Point 1', 'Point 2'],
        originalWordCount: 1000,
        summaryWordCount: 100,
        compressionRatio: 90,
        saved: true,
        createdAt: '2025-07-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Test Summary 2',
        summaryContent: 'This is another test summary content',
        keyPoints: ['Point A', 'Point B'],
        originalWordCount: 2000,
        summaryWordCount: 200,
        compressionRatio: 90,
        saved: true,
        createdAt: '2025-07-14T10:30:00Z'
      }
    ],
    totalPages: 1,
    currentPage: 0,
    totalCount: 2
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mocks
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(userSummaryService.getUserSummaries).mockResolvedValue(mockSavedSummaries);
    vi.mocked(userSummaryService.toggleSavedStatus).mockResolvedValue(true);

    // Reset window.location.href
    mockLocation.href = '';
  });

  it('should render loading state initially', () => {
    render(<SavedSummaries />);

    expect(screen.getByText('Saved Summaries')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Saved Summaries' })).toBeInTheDocument();
    // Check for loading animation
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render saved summaries when loaded', async () => {
    render(<SavedSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
      expect(screen.getByText('Test Summary 2')).toBeInTheDocument();
    });

    expect(userSummaryService.getUserSummaries).toHaveBeenCalledWith({
      saved: true,
      page: 0,
      size: 3,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  });

  it('should render empty state when no saved summaries', async () => {
    vi.mocked(userSummaryService.getUserSummaries).mockResolvedValue({
      summaries: [],
      totalPages: 0,
      currentPage: 0,
      totalCount: 0
    });

    render(<SavedSummaries />);

    await waitFor(() => {
      expect(screen.getByText('No saved summaries yet.')).toBeInTheDocument();
    });
  });

  it('should render error state when API fails', async () => {
    vi.mocked(userSummaryService.getUserSummaries).mockRejectedValue(new Error('API Error'));

    render(<SavedSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load saved summaries.')).toBeInTheDocument();
    });
  });

  it('should navigate to summary detail when clicking on a summary', async () => {
    render(<SavedSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Summary 1'));

    expect(mockLocation.href).toBe('/summary/1');
  });

  it('should unsave a summary when clicking unsave button', async () => {
    render(<SavedSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
    });

    // Find and click the unsave button
    const unsaveButtons = screen.getAllByText('Unsave');
    fireEvent.click(unsaveButtons[0]);

    await waitFor(() => {
      expect(userSummaryService.toggleSavedStatus).toHaveBeenCalledWith('1', false);
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Summary Unsaved'
      }));
    });
  });

  it('should handle unsave errors gracefully', async () => {
    vi.mocked(userSummaryService.toggleSavedStatus).mockResolvedValue(false);

    render(<SavedSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
    });

    // Find and click the unsave button
    const unsaveButtons = screen.getAllByText('Unsave');
    fireEvent.click(unsaveButtons[0]);

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        variant: 'destructive'
      }));
    });
  });

  it('should navigate to all saved summaries when clicking view all', async () => {
    render(<SavedSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View All Saved'));

    expect(mockLocation.href).toBe('/summaries/saved');
  });
});
