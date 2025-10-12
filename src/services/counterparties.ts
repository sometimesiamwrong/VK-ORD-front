import http from '../api/http'
import type {
  GetCounterpartiesByInnResponse,
  GetCounterpartyContractsResponse,
  GetRelatedCounterpartiesResponse,
  PageRequest
} from '../types'

export interface GetCounterpartiesByInnParams {
  inn: string
  cacheOnly?: boolean
  forceRefresh?: boolean
  cacheTtlMinutes?: number
  refreshThreshold?: number
  includeRelatedData?: boolean
  maxResults?: number
}

export interface GetCounterpartyContractsParams {
  inn: string
  cacheOnly?: boolean
  forceRefresh?: boolean
  cacheTtlMinutes?: number
  refreshThreshold?: number
  maxResults?: number
  includeAdditionalContracts?: boolean
}

export interface GetRelatedCounterpartiesParams {
  inn: string
  cacheOnly?: boolean
  forceRefresh?: boolean
  cacheTtlMinutes?: number
  refreshThreshold?: number
  maxResults?: number
  relationTypes?: string[]
}

export interface GetCounterpartiesListParams extends PageRequest {
  // Additional parameters for the counterparties list endpoint
}

export interface GetCounterpartiesListResponse {
  data: any[]
  total_items_count: number
  limit: number
}

export class CounterpartiesService {
  /**
   * Получить контрагентов по ИНН
   */
  static async getCounterpartiesByInn(params: GetCounterpartiesByInnParams): Promise<GetCounterpartiesByInnResponse> {
    const { inn, ...queryParams } = params
    const response = await http.get<GetCounterpartiesByInnResponse>(`/api/v1/counterparties/by-inn/${inn}`, {
      params: queryParams
    })
    return response.data
  }

  /**
   * Получить договоры контрагента
   */
  static async getCounterpartyContracts(params: GetCounterpartyContractsParams): Promise<GetCounterpartyContractsResponse> {
    const { inn, ...queryParams } = params
    const response = await http.get<GetCounterpartyContractsResponse>(`/api/v1/counterparties/${inn}/contracts`, {
      params: queryParams
    })
    return response.data
  }

  /**
   * Получить связанных контрагентов
   */
  static async getRelatedCounterparties(params: GetRelatedCounterpartiesParams): Promise<GetRelatedCounterpartiesResponse> {
    const { inn, ...queryParams } = params
    const response = await http.get<GetRelatedCounterpartiesResponse>(`/api/v1/counterparties/${inn}/related`, {
      params: queryParams
    })
    return response.data
  }

  /**
   * Получить список сохраненных контрагентов
   */
  static async getCounterpartiesList(params: GetCounterpartiesListParams = {}): Promise<GetCounterpartiesListResponse> {
    const response = await http.post<GetCounterpartiesListResponse>('/api/clientapi/counterparties', params)
    return response.data
  }
}

export default CounterpartiesService
