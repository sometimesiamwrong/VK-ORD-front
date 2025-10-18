/**
 * Cache-related types
 *
 * Types for responses that include caching metadata
 */

/**
 * Data source indicator for cached responses
 */
export const DataSource = {
  Cache: 0,   // Data retrieved from cache
  Api: 1,     // Data fetched from API
  Mixed: 2    // Data from both cache and API
} as const

export type DataSource = typeof DataSource[keyof typeof DataSource]

/**
 * Cache statistics metadata
 */
export interface CacheStatistics {
  executionTimeMs: number
  cacheHit: boolean
  dataSizeBytes: number
  recordCount: number
  metrics?: Record<string, any>
}

/**
 * Base interface for responses that include cache metadata
 *
 * Extend this interface for API responses that support caching
 *
 * @example
 * ```ts
 * interface MyResponse extends CacheResponse {
 *   items: MyItem[]
 *   totalCount: number
 * }
 * ```
 */
export interface CacheResponse {
  source: DataSource
  retrievedAt: string
  cacheExpiresAt?: string
  cacheCreatedAt?: string
  cacheVersion?: number
  dataHash?: string
  cacheStatistics?: CacheStatistics
}
