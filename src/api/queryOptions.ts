/**
 * Query Options Factory
 *
 * Provides standardized query and mutation options with:
 * - Consistent stale time and cache time
 * - Error handling
 * - Retry logic
 * - Type safety
 *
 * @example
 * ```ts
 * const listOptions = createQueryOptions({
 *   queryKey: queryKeys.counterparties.list(),
 *   queryFn: () => CounterpartiesService.getList(),
 *   staleTime: 5 * 60 * 1000, // 5 minutes
 * })
 * ```
 */

import type { UseQueryOptions, UseMutationOptions, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Default configuration for queries
 */
export const DEFAULT_QUERY_CONFIG = {
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  retry: 1,
  refetchOnWindowFocus: false,
} as const

/**
 * Default configuration for mutations
 */
export const DEFAULT_MUTATION_CONFIG = {
  retry: 0,
} as const

/**
 * Create standardized query options
 */
export function createQueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  return {
    ...DEFAULT_QUERY_CONFIG,
    ...options,
  }
}

/**
 * Create standardized mutation options with automatic error handling
 */
export function createMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    successMessage?: string
    errorMessage?: string
  }
): UseMutationOptions<TData, TError, TVariables, TContext> {
  const { successMessage, errorMessage, onSuccess, onError, ...restOptions } = options

  return {
    ...DEFAULT_MUTATION_CONFIG,
    ...restOptions,
    onSuccess: (data, variables, context) => {
      if (successMessage) {
        toast.success(successMessage)
      }
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      const message = errorMessage || extractErrorMessage(error)
      toast.error(message)
      onError?.(error, variables, context)
    },
  }
}

/**
 * Create mutation options with automatic cache invalidation
 */
export function createMutationWithInvalidation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  queryClient: QueryClient,
  options: UseMutationOptions<TData, TError, TVariables, TContext> & {
    successMessage?: string
    errorMessage?: string
    invalidateKeys: readonly (readonly unknown[])[]
  }
): UseMutationOptions<TData, TError, TVariables, TContext> {
  const { invalidateKeys, onSuccess, ...restOptions } = options

  return createMutationOptions({
    ...restOptions,
    onSuccess: async (data, variables, context) => {
      // Invalidate all specified query keys
      await Promise.all(
        invalidateKeys.map((key) =>
          queryClient.invalidateQueries({ queryKey: key as readonly unknown[] })
        )
      )
      onSuccess?.(data, variables, context)
    },
  })
}

/**
 * Extract error message from various error formats
 */
function extractErrorMessage(error: unknown): string {
  if (!error) return 'Произошла ошибка'

  if (typeof error === 'string') {
    return error.trim() || 'Произошла ошибка'
  }

  // Axios error with brokenRules array (from interceptor)
  const brokenRulesError = error as {
    brokenRules?: Array<{ message?: string | null }>
  }
  if (Array.isArray(brokenRulesError?.brokenRules) && brokenRulesError.brokenRules.length > 0) {
    const messages = brokenRulesError.brokenRules
      .map((rule) => rule?.message?.trim())
      .filter(Boolean)
      .join('\n')
    if (messages) return messages
  }

  // Axios error
  const axiosError = error as {
    message?: string
    response?: {
      data?: unknown
      status?: number
    }
  }

  // Backend message
  if (
    typeof axiosError?.response?.data === 'object' &&
    axiosError.response.data !== null
  ) {
    const dataObj = axiosError.response.data as {
      message?: string
      errorMessage?: string
    }
    const payloadMessage = dataObj.message || dataObj.errorMessage
    if (payloadMessage?.trim()) {
      return payloadMessage.trim()
    }
  }

  // Response data as string
  if (
    typeof axiosError?.response?.data === 'string' &&
    axiosError.response.data.trim()
  ) {
    return axiosError.response.data.trim()
  }

  // Top-level message
  if (axiosError?.message?.trim()) {
    return axiosError.message.trim()
  }

  return 'Произошла ошибка'
}

/**
 * Prefetch helper for SSR or optimistic data loading
 */
export async function prefetchQuery<TData>(
  queryClient: QueryClient,
  options: UseQueryOptions<TData>
): Promise<void> {
  await queryClient.prefetchQuery(options)
}

/**
 * Set query data helper for optimistic updates
 */
export function setQueryData<TData>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  data: TData | ((old: TData | undefined) => TData)
): void {
  queryClient.setQueryData(queryKey, data)
}

/**
 * Get query data helper
 */
export function getQueryData<TData>(
  queryClient: QueryClient,
  queryKey: readonly unknown[]
): TData | undefined {
  return queryClient.getQueryData(queryKey)
}
