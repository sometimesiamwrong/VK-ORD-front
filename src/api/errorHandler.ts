/**
 * Error Handler
 *
 * Central error processing for converting HTTP/Axios errors into typed ApiError instances.
 * Used throughout the application for consistent error handling.
 *
 * @example
 * ```ts
 * try {
 *   await api.call()
 * } catch (error) {
 *   const apiError = handleApiError(error)
 *   toast.error(apiError.userMessage)
 *   logger.error(apiError)
 * }
 * ```
 */

import type { AxiosError } from 'axios'
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  ServerError,
  NetworkError,
  TimeoutError,
  isApiError
} from './errors'
import type { BrokenRule } from '../types'

/**
 * Main error handler function
 *
 * Converts any error (especially Axios errors) into our typed ApiError hierarchy
 *
 * @param error - Any error thrown by axios or application code
 * @param fallbackMessage - Default message if error can't be parsed
 * @returns Typed ApiError instance
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = 'Произошла ошибка'
): ApiError {
  // If it's already our custom ApiError, return as-is
  if (isApiError(error)) {
    return error
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    return handleAxiosError(error)
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return new ApiError(
      'UNKNOWN_ERROR',
      error.message || fallbackMessage,
      undefined,
      error
    )
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new ApiError('UNKNOWN_ERROR', error || fallbackMessage)
  }

  // Handle completely unknown errors
  return new ApiError(
    'UNKNOWN_ERROR',
    fallbackMessage,
    { originalError: error }
  )
}

/**
 * Handle Axios-specific errors
 */
function handleAxiosError(error: AxiosError): ApiError {
  // No response from server (network error, CORS, etc.)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new TimeoutError()
    }
    return new NetworkError(error.message || 'Ошибка сети')
  }

  const { status, data } = error.response

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return handleBadRequest(data, error)

    case 401:
      return new AuthenticationError(
        extractMessage(data) || 'Требуется авторизация'
      )

    case 403:
      return new AuthorizationError(
        extractMessage(data) || 'Недостаточно прав доступа'
      )

    case 404:
      return new NotFoundError(
        'Ресурс',
        extractMessage(data)
      )

    case 409:
      return new ConflictError(
        extractMessage(data) || 'Конфликт данных',
        data
      )

    case 422:
      // Unprocessable entity - treat as validation error
      return handleBadRequest(data, error)

    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(
        extractMessage(data) || 'Внутренняя ошибка сервера'
      )

    default:
      return new ApiError(
        `HTTP_${status}`,
        extractMessage(data) || `Ошибка HTTP ${status}`,
        data,
        error,
        status
      )
  }
}

/**
 * Handle 400 Bad Request errors (typically validation errors)
 */
function handleBadRequest(data: unknown, originalError: AxiosError): ApiError {
  // Check for broken rules array (our backend format)
  const brokenRules = extractBrokenRules(data)
  if (brokenRules && brokenRules.length > 0) {
    return new ValidationError(brokenRules)
  }

  // Fallback to generic validation error
  const message = extractMessage(data) || 'Ошибка валидации данных'
  return new ValidationError(
    [{ code: 0, message, domain: 'unknown' }],
    message
  )
}

/**
 * Extract broken rules from response data
 *
 * Handles multiple response formats:
 * - { brokenRules: BrokenRule[] }
 * - BrokenRule[] (direct array)
 * - { errors: { field: string[] } } (ASP.NET format)
 */
function extractBrokenRules(data: unknown): BrokenRule[] | null {
  if (!data || typeof data !== 'object') return null

  // Format 1: { brokenRules: [...] } - from our interceptor
  const withBrokenRules = data as { brokenRules?: BrokenRule[] }
  if (Array.isArray(withBrokenRules.brokenRules)) {
    return withBrokenRules.brokenRules
  }

  // Format 2: Direct array of broken rules
  if (Array.isArray(data)) {
    return data.map((item, index) => ({
      code: item.code || item.Code || index,
      message: item.message || item.Message || String(item),
      domain: item.domain || item.Domain || 'unknown'
    }))
  }

  // Format 3: ASP.NET validation format { errors: { field: [messages] } }
  const aspNetFormat = data as { errors?: Record<string, string[]> }
  if (aspNetFormat.errors && typeof aspNetFormat.errors === 'object') {
    const rules: BrokenRule[] = []
    Object.entries(aspNetFormat.errors).forEach(([field, messages]) => {
      messages.forEach((msg, idx) => {
        rules.push({
          code: idx,
          message: msg,
          domain: field
        })
      })
    })
    if (rules.length > 0) return rules
  }

  return null
}

/**
 * Extract user-friendly message from response data
 *
 * Handles multiple response formats
 */
function extractMessage(data: unknown): string | null {
  if (!data) return null

  if (typeof data === 'string') {
    return data.trim() || null
  }

  if (typeof data !== 'object') return null

  const obj = data as Record<string, unknown>

  // Try common message field names
  const messageFields = ['message', 'Message', 'errorMessage', 'error', 'title']
  for (const field of messageFields) {
    const value = obj[field]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  // Try nested error object
  if (obj.error && typeof obj.error === 'object') {
    return extractMessage(obj.error)
  }

  return null
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    error.isAxiosError === true
  )
}

/**
 * Get user-friendly error message from any error
 *
 * Convenience function for quick error message extraction
 */
export function getErrorMessage(error: unknown, fallback = 'Произошла ошибка'): string {
  const apiError = handleApiError(error, fallback)
  return apiError.userMessage
}

/**
 * Check if error is retryable
 *
 * Determines if the error is temporary and request can be retried
 */
export function isRetryableError(error: unknown): boolean {
  if (!isApiError(error)) {
    error = handleApiError(error)
  }

  const apiError = error as ApiError

  // Retry on network errors, timeouts, and 5xx errors
  return (
    apiError instanceof NetworkError ||
    apiError instanceof TimeoutError ||
    (apiError.statusCode !== undefined && apiError.statusCode >= 500)
  )
}

/**
 * Check if error requires authentication
 *
 * Used to redirect to login page
 */
export function requiresAuthentication(error: unknown): boolean {
  const apiError = isApiError(error) ? error : handleApiError(error)
  return apiError instanceof AuthenticationError
}
