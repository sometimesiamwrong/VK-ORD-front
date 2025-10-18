/**
 * React Query Client Configuration
 *
 * Configures global defaults for queries and mutations with centralized
 * error handling and retry logic.
 */

import { QueryClient } from '@tanstack/react-query'
import { handleApiError, isRetryableError, requiresAuthentication } from './errorHandler'
import { logger } from '../utils/logger'

const defaultOptions = {
  queries: {
    /**
     * Retry logic based on error type
     * - Retries network errors, timeouts, and 5xx errors up to 2 times
     * - Does not retry 4xx errors (except 429 Too Many Requests)
     */
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 4xx errors (except 429)
      const apiError = handleApiError(error)
      if (apiError.statusCode) {
        const status = apiError.statusCode
        if (status >= 400 && status < 500 && status !== 429) {
          return false
        }
      }

      // Don't retry authentication errors (redirects will be handled elsewhere)
      if (requiresAuthentication(error)) {
        return false
      }

      // Retry retryable errors (network, timeout, 5xx) up to 2 times
      return failureCount < 2 && isRetryableError(error)
    },

    /**
     * Global query error handler
     * Logs all query errors for debugging
     */
    onError: (error: unknown) => {
      const apiError = handleApiError(error)
      logger.apiError(apiError, 'Query failed')
    },

    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
  },
  mutations: {
    /**
     * Mutations should not retry by default
     * Individual mutations can override this if needed
     */
    retry: false,

    /**
     * Global mutation error handler
     * Logs all mutation errors for debugging
     * UI notifications should be handled in individual mutation hooks
     */
    onError: (error: unknown) => {
      const apiError = handleApiError(error)
      logger.apiError(apiError, 'Mutation failed')
    },
  },
}

export const queryClient = new QueryClient({
  defaultOptions,
})
