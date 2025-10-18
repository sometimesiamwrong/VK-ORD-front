/**
 * Hook for submitting an act to VK ORD (ERIR)
 *
 * Backend: InvoicesController
 * Endpoint: POST /api/invoices/{externalId}/ready
 *
 * @returns Mutation for submitting acts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '../../../api/http'
import { getCookie } from '../../../utils'
import type { ActSubmitResponse } from '../../../types'

export const useSubmitAct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (actId: string) => {
      const apiCredentialPublicId = getCookie('vkord-credential-id')
      if (!apiCredentialPublicId) {
        throw new Error('Не выбран токен VK API')
      }

      // Backend endpoint is /ready, not /submit
      const response = await http.post<ActSubmitResponse>(`/api/invoices/${actId}/ready`, {})
      return response.data
    },
    onSuccess: (data, actId) => {
      // Refetch act details to get updated status
      queryClient.invalidateQueries({ queryKey: ['invoice', actId] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
  })
}
