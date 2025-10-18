/**
 * Hook for creating/updating creative statistics
 *
 * Backend: StatisticsController
 * Endpoint: POST /api/statistics
 *
 * @returns Mutation for creating statistics
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getCookie } from '../../../utils'
import StatisticsService from '../../../services/statistics'
import type { CreateStatisticsRequest } from '../../../types'

export const useCreateStatistics = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateStatisticsRequest) => {
      const apiCredentialPublicId = getCookie('vkord-credential-id')
      if (!apiCredentialPublicId) {
        throw new Error('Не выбран токен VK API')
      }

      return await StatisticsService.createStatistics(data)
    },
    onSuccess: (_, variables) => {
      // Invalidate statistics queries for the invoice and contract
      queryClient.invalidateQueries({
        queryKey: ['statistics', { invoiceExternalId: variables.invoiceExternalId }]
      })
      queryClient.invalidateQueries({
        queryKey: ['statistics', { contractExternalId: variables.contractExternalId }]
      })

      // Invalidate the invoice details to reflect updated statistics
      queryClient.invalidateQueries({
        queryKey: ['invoice', variables.invoiceExternalId]
      })
    }
  })
}
