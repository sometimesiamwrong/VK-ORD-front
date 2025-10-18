/**
 * Error-related types
 *
 * Types for API error responses and validation errors
 */

/**
 * Broken rule from backend validation
 *
 * Backend returns validation errors in this format
 */
export interface BrokenRule {
  code: number
  message: string
  domain: string
}

/**
 * Broken rules error response
 *
 * Returned when request validation fails (HTTP 400)
 */
export interface BrokenRulesError {
  rules: BrokenRule[]
  message?: string
}

/**
 * Generic API response wrapper
 *
 * @template T - The type of the response data
 */
export type ApiResponse<T = unknown> = {
  success: boolean
  message?: string
  timestamp?: string
  data?: T | null
  code?: string
}
