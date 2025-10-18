import http from '../api/http'
import type {
  ActStatisticsRequest,
  GetActStatisticsResponse,
  CreateStatisticsRequest,
  StatisticsListRequest,
  StatisticsListResponse,
  DeleteStatisticsRequest,
  CreativeStatistics
} from '../types'

export interface GetActStatisticsParams {
  startDate?: string
  endDate?: string
  creativeExternalId?: string
  padExternalId?: string
  cacheOnly?: boolean
  forceRefresh?: boolean
}

export class StatisticsService {
  /**
   * Получить статистику актов за период (POST) - Legacy
   * @deprecated Use getStatistics instead
   */
  static async getActStatistics(request: ActStatisticsRequest): Promise<GetActStatisticsResponse> {
    const response = await http.post<GetActStatisticsResponse>('/api/v1/statistics/acts', request)
    return response.data
  }

  /**
   * Получить статистику актов (GET) - Legacy
   * @deprecated Use getStatistics instead
   */
  static async getActStatisticsGet(params: GetActStatisticsParams): Promise<GetActStatisticsResponse> {
    const response = await http.get<GetActStatisticsResponse>('/api/v1/statistics/acts', {
      params
    })
    return response.data
  }

  /**
   * Создать/обновить статистику креативов
   * Backend: StatisticsController
   * Endpoint: POST /api/statistics
   */
  static async createStatistics(request: CreateStatisticsRequest): Promise<CreativeStatistics[]> {
    const response = await http.post<CreativeStatistics[]>('/api/statistics', request)
    return response.data
  }

  /**
   * Получить список статистики с фильтрами
   * Backend: StatisticsController
   * Endpoint: GET /api/statistics
   */
  static async getStatistics(params: StatisticsListRequest): Promise<StatisticsListResponse> {
    const response = await http.get<StatisticsListResponse>('/api/statistics', {
      params: {
        creative_external_id: params.creativeExternalId,
        pad_external_id: params.padExternalId,
        invoice_external_id: params.invoiceExternalId,
        contract_external_id: params.contractExternalId,
        offset: params.offset || 0,
        limit: params.limit || 10
      }
    })
    return response.data
  }

  /**
   * Удалить статистику
   * Backend: StatisticsController
   * Endpoint: POST /api/statistics/delete
   */
  static async deleteStatistics(request: DeleteStatisticsRequest): Promise<void> {
    await http.post('/api/statistics/delete', request)
  }
}

export default StatisticsService




