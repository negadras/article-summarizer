import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import InputSection from './input-section'

// Mock the custom hooks
vi.mock('@/hooks/use-mobile', () => ({
  useMobile: () => false
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('InputSection Component', () => {
  let queryClient: QueryClient
  const mockOnLoading = vi.fn()
  const mockOnResult = vi.fn()
  const mockOnError = vi.fn()

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('should render text input and URL input tabs', () => {
    renderWithProvider(
      <InputSection
        onLoading={mockOnLoading}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    )

    // Check for actual tab text from the component
    expect(screen.getByText('Paste Text')).toBeInTheDocument()
    expect(screen.getByText('From URL')).toBeInTheDocument()
  })

  it('should validate text input minimum length', async () => {
    renderWithProvider(
      <InputSection
        onLoading={mockOnLoading}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    )

    // Find the textarea and submit button with correct text
    const textarea = screen.getByPlaceholderText(/paste your article content here/i)
    const submitButton = screen.getByRole('button', { name: /generate summary/i })

    fireEvent.change(textarea, { target: { value: 'Too short' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/must be at least 100 words/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid text input', async () => {
    renderWithProvider(
      <InputSection
        onLoading={mockOnLoading}
        onResult={mockOnResult}
        onError={mockOnError}
      />
    )

    const longText = 'This is a long article content that exceeds 100 words. '.repeat(10)
    
    // Find elements with correct selectors
    const textarea = screen.getByPlaceholderText(/paste your article content here/i)
    const submitButton = screen.getByRole('button', { name: /generate summary/i })

    fireEvent.change(textarea, { target: { value: longText } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnLoading).toHaveBeenCalledWith(true)
    })
  })
})