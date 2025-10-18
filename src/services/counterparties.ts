import http from '../api/http'
import type {
  GetCounterpartiesByInnResponse,
  GetCounterpartyContractsResponse,
  GetRelatedCounterpartiesResponse,
  CounterpartyDto
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
    const { externalId, ...queryParams } = params
    const response = await http.get<GetCounterpartyContractsResponse>(`/api/client/counterparties/${externalId}/contracts`, {
      params: queryParams
    })
    return response.data
  }

  /**
   * Получить связанных контрагентов
   */
  static async getRelatedCounterparties(params: GetRelatedCounterpartiesParams): Promise<GetRelatedCounterpartiesResponse> {
    const { externalId, ...queryParams } = params
    const response = await http.get<GetRelatedCounterpartiesResponse>(`/api/client/counterparties/${externalId}/related`, {
      params: queryParams
    })
    return response.data
  }

  /**
   * Получить контрагента по external ID
   */
  static async getCounterpartyByExternalId(externalId: string): Promise<CounterpartyDto> {
    const response = await http.get<CounterpartyDto>(`/api/client/counterparties/${externalId}`)
    return response.data
  }

  /**
   * Получить список сохраненных контрагентов
   */
  static async getCounterpartiesList(params: GetCounterpartiesListParams = {}): Promise<GetCounterpartiesListResponse> {
    const response = await http.get<GetCounterpartiesListResponse>('/api/client/counterparties', {
      params: {
        limit: params.limit || 100,
        offset: params.offset || 0
      }
    })
    return response.data
  }
}

export default CounterpartiesService
