import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import RecentSummaries from './RecentSummaries';
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

describe('RecentSummaries', () => {
  const mockToast = {
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: []
  };

  const mockRecentSummaries = {
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
        saved: false,
        createdAt: '2025-07-14T10:30:00Z'
      },
      {
        id: '3',
        title: 'Test Summary 3',
        summaryContent: 'This is yet another test summary content',
        keyPoints: ['Point X', 'Point Y'],
        originalWordCount: 1500,
        summaryWordCount: 150,
        compressionRatio: 90,
        saved: false,
        createdAt: '2025-07-13T10:30:00Z'
      }
    ],
    totalPages: 1,
    currentPage: 0,
    totalCount: 3
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mocks
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(userSummaryService.getUserSummaries).mockResolvedValue(mockRecentSummaries);
    vi.mocked(userSummaryService.toggleSavedStatus).mockResolvedValue(true);

    // Reset window.location.href
    mockLocation.href = '';
  });

  it('should render loading state initially', () => {
    render(<RecentSummaries />);

    expect(screen.getByText('Recent Summaries')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent Summaries' })).toBeInTheDocument();
    // Check for loading animation
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render recent summaries when loaded', async () => {
    render(<RecentSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
      expect(screen.getByText('Test Summary 2')).toBeInTheDocument();
      expect(screen.getByText('Test Summary 3')).toBeInTheDocument();
    });

    expect(userSummaryService.getUserSummaries).toHaveBeenCalledWith({
      page: 0,
      size: 3,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  });

  it('should render empty state when no recent summaries', async () => {
    vi.mocked(userSummaryService.getUserSummaries).mockResolvedValue({
      summaries: [],
      totalPages: 0,
      currentPage: 0,
      totalCount: 0
    });

    render(<RecentSummaries />);

    await waitFor(() => {
      expect(screen.getByText("You haven't created any summaries yet.")).toBeInTheDocument();
    });
  });

  it('should render error state when API fails', async () => {
    vi.mocked(userSummaryService.getUserSummaries).mockRejectedValue(new Error('API Error'));

    render(<RecentSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load recent summaries at this time.')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should navigate to summary detail when clicking view full summary', async () => {
    render(<RecentSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
    });

    const viewButtons = screen.getAllByText('View Full Summary');
    fireEvent.click(viewButtons[0]);

    expect(mockLocation.href).toBe('/summary/1');
  });

  it('should toggle saved status when clicking bookmark button', async () => {
    render(<RecentSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 2')).toBeInTheDocument();
    });

    // Find the bookmark button for the unsaved summary
    const bookmarkButtons = screen.getAllByRole('button', {
      name: /save this summary/i
    });

    fireEvent.click(bookmarkButtons[0]);

    await waitFor(() => {
      expect(userSummaryService.toggleSavedStatus).toHaveBeenCalledWith(expect.any(String), true);
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Summary Saved'
      }));
    });
  });

  it('should toggle saved status when clicking bookmarked button', async () => {
    render(<RecentSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
    });

    // Find the bookmark button for the saved summary
    const bookmarkButtons = screen.getAllByRole('button', {
      name: /remove from saved summaries/i
    });

    fireEvent.click(bookmarkButtons[0]);

    await waitFor(() => {
      expect(userSummaryService.toggleSavedStatus).toHaveBeenCalledWith(expect.any(String), false);
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Summary Unsaved'
      }));
    });
  });

  it('should handle toggle errors gracefully', async () => {
    vi.mocked(userSummaryService.toggleSavedStatus).mockResolvedValue(false);

    render(<RecentSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 2')).toBeInTheDocument();
    });

    // Find the bookmark button for the unsaved summary
    const bookmarkButtons = screen.getAllByRole('button', {
      name: /save this summary/i
    });

    fireEvent.click(bookmarkButtons[0]);

    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Error',
        variant: 'destructive'
      }));
    });
  });

  it('should navigate to all summaries when clicking view all', async () => {
    render(<RecentSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('View All Summaries'));

    expect(mockLocation.href).toBe('/summaries/all');
  });

  it('should format dates correctly', async () => {
    render(<RecentSummaries />);

    await waitFor(() => {
      expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
    });

    // Check for formatted date (Jul 15, 2025)
    expect(screen.getByText(text => text.includes('Jul 15, 2025'))).toBeInTheDocument();
  });
});
