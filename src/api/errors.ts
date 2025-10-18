/**
 * Error Classes for API and Application Errors
 *
 * Provides a hierarchical error system with specific error types
 * for different failure scenarios.
 *
 * @example
 * ```ts
 * throw new ValidationError([{ code: 1, message: 'Invalid INN', domain: 'party' }])
 * throw new AuthenticationError('Session expired')
 * throw new NetworkError()
 * ```
 */

import type { BrokenRule } from '../types'

/**
 * Base API error class
 *
 * All custom errors extend this class
 */
export class ApiError extends Error {
  public readonly timestamp: Date
  public readonly isApiError = true

  constructor(
    public readonly code: string,
    public readonly userMessage: string,
    public readonly details?: unknown,
    public readonly originalError?: unknown,
    public readonly statusCode?: number
  ) {
    super(userMessage)
    this.name = 'ApiError'
    this.timestamp = new Date()

    // Maintain proper stack trace for where error was thrown (only in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * Serialize error for logging
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      details: this.details,
      stack: this.stack
    }
  }
}

/**
 * Validation error (HTTP 400)
 *
 * Thrown when request validation fails on the backend
 */
export class ValidationError extends ApiError {
  constructor(
    public readonly brokenRules: BrokenRule[],
    userMessage?: string
  ) {
    const message = userMessage || ValidationError.formatBrokenRules(brokenRules)
    super('VALIDATION_ERROR', message, { brokenRules }, undefined, 400)
    this.name = 'ValidationError'
  }

  /**
   * Format broken rules into a readable message
   */
  private static formatBrokenRules(rules: BrokenRule[]): string {
    if (rules.length === 0) return 'Ошибка валидации'
    if (rules.length === 1) return rules[0].message

    return `Обнаружено ${rules.length} ошибок валидации:\n` +
      rules.map((r, i) => `${i + 1}. ${r.message}`).join('\n')
  }

  /**
   * Get all validation errors by domain
   */
  getErrorsByDomain(domain: string): BrokenRule[] {
    return this.brokenRules.filter(r => r.domain === domain)
  }
}

/**
 * Authentication error (HTTP 401)
 *
 * Thrown when user is not authenticated or session expired
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Требуется авторизация') {
    super('AUTH_ERROR', message, undefined, undefined, 401)
    this.name = 'AuthenticationError'
  }
}

/**
 * Authorization error (HTTP 403)
 *
 * Thrown when user doesn't have permission to access resource
 */
export class AuthorizationError extends ApiError {
  constructor(message = 'Недостаточно прав доступа') {
    super('FORBIDDEN_ERROR', message, undefined, undefined, 403)
    this.name = 'AuthorizationError'
  }
}

/**
 * Not found error (HTTP 404)
 *
 * Thrown when requested resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(
    public readonly resourceType: string,
    public readonly resourceId?: string
  ) {
    const message = resourceId
      ? `${resourceType} с ID "${resourceId}" не найден`
      : `${resourceType} не найден`

    super('NOT_FOUND_ERROR', message, { resourceType, resourceId }, undefined, 404)
    this.name = 'NotFoundError'
  }
}

/**
 * Conflict error (HTTP 409)
 *
 * Thrown when there's a conflict with current resource state
 */
export class ConflictError extends ApiError {
  constructor(message: string, details?: unknown) {
    super('CONFLICT_ERROR', message, details, undefined, 409)
    this.name = 'ConflictError'
  }
}

/**
 * Server error (HTTP 500)
 *
 * Thrown when server encounters an unexpected error
 */
export class ServerError extends ApiError {
  constructor(message = 'Внутренняя ошибка сервера') {
    super('SERVER_ERROR', message, undefined, undefined, 500)
    this.name = 'ServerError'
  }
}

/**
 * Network error
 *
 * Thrown when network request fails (no response from server)
 */
export class NetworkError extends ApiError {
  constructor(message = 'Ошибка сети. Проверьте подключение к интернету') {
    super('NETWORK_ERROR', message, undefined, undefined, 0)
    this.name = 'NetworkError'
  }
}

/**
 * Timeout error
 *
 * Thrown when request exceeds timeout limit
 */
export class TimeoutError extends ApiError {
  constructor(message = 'Превышено время ожидания ответа от сервера') {
    super('TIMEOUT_ERROR', message, undefined, undefined, 408)
    this.name = 'TimeoutError'
  }
}

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'isApiError' in error && error.isApiError === true
}

/**
 * Type guard to check if error is a ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

/**
 * Type guard to check if error is an AuthenticationError
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError
}

/**
 * Type guard to check if error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}
