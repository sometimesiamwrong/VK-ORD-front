/**
 * Hook for deleting statistics
 *
 * Backend: StatisticsController
 * Endpoint: POST /api/statistics/delete
 *
 * @returns Mutation for deleting statistics
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import StatisticsService from '../../../services/statistics'
import type { DeleteStatisticsRequest } from '../../../types'

export const useDeleteStatistics = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: DeleteStatisticsRequest) => {
      await StatisticsService.deleteStatistics(data)
    },
    onSuccess: () => {
      // Invalidate all statistics queries to refetch
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      // Also invalidate invoices as they might display statistics counts
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
  })
}
