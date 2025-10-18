/**
 * Hooks for fetching act statistics
 */

import { useMutation, useQuery } from '@tanstack/react-query'
import http from '../../../api/http'
import type { ActStatisticsRequest } from '../../../types'

/**
 * Mutation hook for fetching statistics
 *
 * @returns Mutation for statistics request
 */
export const useActStatistics = () => {
  return useMutation({
    mutationFn: async (params: ActStatisticsRequest) => {
      const response = await http.post('/api/statistics/v1/acts', params)
      return response.data
    }
  })
}

/**
 * Query hook for fetching statistics with caching
 *
 * @param params - Statistics request parameters
 * @param enabled - Whether to enable the query
 * @returns Query result with statistics data
 */
export const useActStatisticsQuery = (params: ActStatisticsRequest, enabled = true) => {
  return useQuery({
    queryKey: ['statistics', 'acts', params],
    queryFn: async () => {
      const response = await http.post('/api/statistics/v1/acts', params)
      return response.data
    },
    enabled: enabled && !!params.startDate && !!params.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
