import http from '../api/http'
import type {
  ActStatisticsRequest,
  GetActStatisticsResponse
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
   * Получить статистику актов за период (POST)
   */
  static async getActStatistics(request: ActStatisticsRequest): Promise<GetActStatisticsResponse> {
    const response = await http.post<GetActStatisticsResponse>('/api/v1/statistics/acts', request)
    return response.data
  }

  /**
   * Получить статистику актов (GET)
   */
  static async getActStatisticsGet(params: GetActStatisticsParams): Promise<GetActStatisticsResponse> {
    const response = await http.get<GetActStatisticsResponse>('/api/v1/statistics/acts', {
      params
    })
    return response.data
  }
}

export default StatisticsService




