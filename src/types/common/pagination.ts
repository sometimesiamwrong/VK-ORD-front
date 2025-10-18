/**
 * Pagination types
 *
 * Shared pagination interfaces used across list endpoints
 */

/**
 * Standard pagination parameters for list requests
 *
 * @example
 * ```ts
 * const params: PageRequest = { limit: 20, offset: 0 }
 * ```
 */
export interface PageRequest {
  limit?: number
  offset?: number
}

/**
 * Standard paginated response wrapper
 *
 * @template T - The type of items in the data array
 */
export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  totalItemsCount: number
  limit: number
}
