/**
 * Hook for creating a new act (invoice)
 *
 * Backend: InvoicesController
 * Endpoint: PUT /api/invoices/{externalId}
 *
 * @returns Mutation for creating acts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '../../../api/http'
import { getCookie } from '../../../utils'
import type { ActDetails, CreateActRequest } from '../../../types'

export const useCreateAct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateActRequest) => {
      const apiCredentialPublicId = getCookie('vkord-credential-id')
      if (!apiCredentialPublicId) {
        throw new Error('Не выбран токен VK API')
      }

      // Generate externalId for new act (UUID or timestamp-based)
      const externalId = data.externalId || `act_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // Backend expects PUT with externalId in URL
      const response = await http.put<ActDetails>(`/api/invoices/${externalId}`, data)
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch acts list
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      // Add the new act to cache
      queryClient.setQueryData(['invoice', data.id], data)
    }
  })
}
