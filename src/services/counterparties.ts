/**
 * Counterparties Service
 *
 * Handles all API calls related to counterparties (контрагенты).
 * Provides methods for querying, creating, and managing counterparties.
 *
 * @example
 * ```ts
 * // Get counterparties list
 * const list = await CounterpartiesService.getList({ limit: 10 })
 *
 * // Get counterparty by INN
 * const counterparty = await CounterpartiesService.getByInn({ inn: '1234567890' })
 *
 * // Create counterparty
 * await CounterpartiesService.create({ inn: '1234567890', types: ['advertiser'] })
 * ```
 */

import http from '../api/http'
import type {
  GetCounterpartiesByInnResponse,
  GetCounterpartyContractsResponse,
  GetRelatedCounterpartiesResponse,
  CounterpartyDto,
  PartyRole
} from '../types'

export interface GetCounterpartiesByInnParams {
  inn: string
}

export interface GetCounterpartyContractsParams {
  externalId: string
  cacheOnly?: boolean
}

export interface GetRelatedCounterpartiesParams {
  externalId: string
  relationTypes?: string[]
}

export interface GetCounterpartiesListParams {
  limit?: number
  offset?: number
}

export interface GetCounterpartiesListResponse {
  data: CounterpartyDto[]
  total_count: number
  total_items_count: number
  limit: number
}

export interface CreateCounterpartyParams {
  inn: string
  types: PartyRole
}

export interface UpdateCounterpartyParams {
  externalId: string
  data: Partial<CounterpartyDto>
}

/**
 * Service class for counterparty-related API operations
 */
export class CounterpartiesService {
  // ============================================
  // QUERIES - Read operations
  // ============================================

  /**
   * Get counterparties list with pagination
   *
   * @param params - Pagination parameters
   * @returns List of counterparties with pagination info
   *
   * @example
   * ```ts
   * const result = await CounterpartiesService.getList({ limit: 20, offset: 0 })
   * console.log(result.data) // Array of counterparties
   * console.log(result.total_items_count) // Total count
   * ```
   */
  static async getList(params: GetCounterpartiesListParams = {}): Promise<GetCounterpartiesListResponse> {
    const response = await http.get<GetCounterpartiesListResponse>('/api/counterparties/v1', {
      params: {
        limit: params.limit || 100,
        offset: params.offset || 0
      }
    })
    return response.data
  }

  /**
   * Get counterparty by external ID
   *
   * @param externalId - Unique external identifier
   * @returns Counterparty details
   */
  static async getByExternalId(externalId: string): Promise<CounterpartyDto> {
    const response = await http.get<CounterpartyDto>(`/api/counterparties/v1/${externalId}`)
    return response.data
  }

  /**
   * Get counterparties by INN (tax identification number)
   *
   * @param params - Parameters including INN
   * @returns Counterparties matching the INN
   */
  static async getByInn(params: GetCounterpartiesByInnParams): Promise<GetCounterpartiesByInnResponse> {
    const { inn, ...queryParams } = params
    const response = await http.get<GetCounterpartiesByInnResponse>(`/api/counterparties/v1/by-inn/${inn}`, {
      params: queryParams
    })
    return response.data
  }

  /**
   * Get contracts associated with a counterparty
   *
   * @param params - Parameters including counterparty external ID
   * @returns List of contracts
   */
  static async getContracts(params: GetCounterpartyContractsParams): Promise<GetCounterpartyContractsResponse> {
    const { externalId, ...queryParams } = params
    const response = await http.get<GetCounterpartyContractsResponse>(`/api/counterparties/v1/${externalId}/contracts`, {
      params: queryParams
    })
    return response.data
  }

  /**
   * Get related counterparties
   *
   * @param params - Parameters including counterparty external ID and relation types
   * @returns List of related counterparties
   */
  static async getRelated(params: GetRelatedCounterpartiesParams): Promise<GetRelatedCounterpartiesResponse> {
    const { externalId, ...queryParams } = params
    const response = await http.get<GetRelatedCounterpartiesResponse>(`/api/counterparties/v1/${externalId}/related`, {
      params: queryParams
    })
    return response.data
  }

  // ============================================
  // MUTATIONS - Write operations
  // ============================================

  /**
   * Create or update a counterparty in VK ORD
   *
   * @param params - INN and party roles
   * @returns Created/updated counterparty data
   *
   * @example
   * ```ts
   * await CounterpartiesService.create({
   *   inn: '7707083893',
   *   types: ['advertiser', 'publisher']
   * })
   * ```
   */
  static async create(params: CreateCounterpartyParams): Promise<void> {
    await http.post<unknown>('/api/counterparties/v1', params)
  }

  /**
   * Update counterparty data
   *
   * @param params - External ID and updated data
   * @returns Updated counterparty
   */
  static async update(params: UpdateCounterpartyParams): Promise<CounterpartyDto> {
    const { externalId, data } = params
    const response = await http.put<CounterpartyDto>(`/api/counterparties/v1/${externalId}`, data)
    return response.data
  }

  /**
   * Delete counterparty
   *
   * @param externalId - Counterparty external ID
   */
  static async delete(externalId: string): Promise<void> {
    await http.delete(`/api/counterparties/v1/${externalId}`)
  }

  // ============================================
  // LEGACY ALIASES (for backward compatibility)
  // ============================================

  /**
   * @deprecated Use `getList` instead
   */
  static async getCounterpartiesList(params?: GetCounterpartiesListParams) {
    return this.getList(params)
  }

  /**
   * @deprecated Use `getByExternalId` instead
   */
  static async getCounterpartyByExternalId(externalId: string) {
    return this.getByExternalId(externalId)
  }

  /**
   * @deprecated Use `getByInn` instead
   */
  static async getCounterpartiesByInn(params: GetCounterpartiesByInnParams) {
    return this.getByInn(params)
  }

  /**
   * @deprecated Use `getContracts` instead
   */
  static async getCounterpartyContracts(params: GetCounterpartyContractsParams) {
    return this.getContracts(params)
  }

  /**
   * @deprecated Use `getRelated` instead
   */
  static async getRelatedCounterparties(params: GetRelatedCounterpartiesParams) {
    return this.getRelated(params)
  }
}

export default CounterpartiesService
