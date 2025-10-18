/**
 * Hook for fetching statistics list with filters
 *
 * Backend: StatisticsController
 * Endpoint: GET /api/statistics
 *
 * @param params - Filter parameters (creativeExternalId, padExternalId, etc.)
 * @returns Query result with statistics list
 */

import { useQuery } from '@tanstack/react-query'
import StatisticsService from '../../../services/statistics'
import type { StatisticsListRequest } from '../../../types'

export const useGetStatistics = (params: StatisticsListRequest, enabled = true) => {
  return useQuery({
    queryKey: ['statistics', params],
    queryFn: async () => {
      return await StatisticsService.getStatistics(params)
    },
    enabled: enabled && !!(params.creativeExternalId || params.invoiceExternalId || params.contractExternalId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}
