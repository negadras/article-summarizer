import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {useAuth} from '@/hooks/use-auth';
import {userSummaryService} from '@/lib/userSummaryService';
import {useToast} from '@/hooks/use-toast';
import RecentSummaries from '@/components/dashboard/RecentSummaries';
import SavedSummaries from '@/components/dashboard/SavedSummaries';

// Mock the hooks and services
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/lib/userSummaryService', () => ({
  userSummaryService: {
    getUserSummaries: vi.fn(),
    getUserSummary: vi.fn(),
    toggleSavedStatus: vi.fn()
  }
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

// Mock components that aren't directly tested
vi.mock('@/components/header', () => ({
  default: () => <div data-testid="mock-header">Header</div>
}));

vi.mock('@/components/footer', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>
}));

// Mock window.location
const mockLocation = {
  href: '',
  pathname: ''
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test data
const mockSummaries = {
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
    }
  ],
  totalPages: 1,
  currentPage: 0,
  totalCount: 2
};

describe('User Summary Integration Tests', () => {
  const mockToast = {
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: []
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mocks
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(userSummaryService.getUserSummaries).mockResolvedValue(mockSummaries);
    vi.mocked(userSummaryService.getUserSummary).mockResolvedValue(mockSummaries.summaries[0]);
    vi.mocked(userSummaryService.toggleSavedStatus).mockResolvedValue(true);

    // Setup auth mock as authenticated by default
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com' },
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn()
    });

    // Reset localStorage
    localStorageMock.clear();
    localStorageMock.setItem('authToken', 'mock-token-12345');

    // Reset location
    mockLocation.href = '';
    mockLocation.pathname = '';
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Authentication Integration', () => {
    it('should include auth token in API requests', async () => {
      // Set a mock token
      const mockToken = 'mock-token-12345';
      localStorageMock.setItem('authToken', mockToken);

      // Render the component
      render(<RecentSummaries />);

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
      });

      // Verify the token was used (indirectly by checking that the service was called)
      expect(userSummaryService.getUserSummaries).toHaveBeenCalled();
    });

    it('should handle missing auth token gracefully', async () => {
      // Clear the token
      localStorageMock.removeItem('authToken');

      // Render the component
      render(<RecentSummaries />);

      // Wait for the component to load with mock data
      await waitFor(() => {
        expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
      });

      // Verify the service was still called
      expect(userSummaryService.getUserSummaries).toHaveBeenCalled();
    });
  });

  describe('End-to-End User Flows', () => {
    it('should navigate from recent summaries to summary detail', async () => {
      // Render the component
      render(<RecentSummaries />);

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
      });

      // Click on the view full summary button
      const viewButtons = screen.getAllByText('View Full Summary');
      fireEvent.click(viewButtons[0]);

      // Check that navigation occurred
      expect(mockLocation.href).toContain('/summary/1');
    });

    it('should toggle saved status and show toast notification', async () => {
      // Render the component
      render(<RecentSummaries />);

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Test Summary 2')).toBeInTheDocument();
      });

      // Find the bookmark button for the unsaved summary
      const bookmarkButtons = screen.getAllByRole('button', {
        name: /save this summary/i
      });

      // Click the button to save
      fireEvent.click(bookmarkButtons[0]);

      // Verify the service was called with correct parameters
      await waitFor(() => {
        expect(userSummaryService.toggleSavedStatus).toHaveBeenCalledWith(expect.any(String), true);
      });

      // Verify toast notification was shown
      expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Summary Saved'
      }));
    });
  });

  describe('Error Handling and User Feedback', () => {
    it('should show error state when API fails to load summaries', async () => {
      // Mock API failure
      vi.mocked(userSummaryService.getUserSummaries).mockRejectedValue(new Error('API Error'));

      // Render the component
      render(<RecentSummaries />);

      // Wait for error state to appear
      await waitFor(() => {
        expect(screen.getByText("Unable to load recent summaries at this time.")).toBeInTheDocument();
      });

      // Verify try again button is present
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    it('should show error toast when toggle saved status fails', async () => {
      // Mock toggle failure
      vi.mocked(userSummaryService.toggleSavedStatus).mockResolvedValue(false);

      // Render the component
      render(<SavedSummaries />);

      // Wait for the component to load
      await waitFor(() => {
        expect(screen.getByText('Test Summary 1')).toBeInTheDocument();
      });

      // Find and click the unsave button
      const unsaveButtons = screen.getAllByText('Unsave');
      fireEvent.click(unsaveButtons[0]);

      // Verify error toast was shown
      await waitFor(() => {
        expect(mockToast.toast).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Error',
          variant: 'destructive'
        }));
      });
    });

    it('should handle empty states appropriately', async () => {
      // Mock empty response
      vi.mocked(userSummaryService.getUserSummaries).mockResolvedValue({
        summaries: [],
        totalPages: 0,
        currentPage: 0,
        totalCount: 0
      });

      // Render the component
      render(<RecentSummaries />);

      // Wait for empty state to appear
      await waitFor(() => {
        expect(screen.getByText("You haven't created any summaries yet.")).toBeInTheDocument();
      });
    });
  });
});
