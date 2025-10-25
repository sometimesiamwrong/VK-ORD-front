/**
 * Hook for submitting an act to VK ORD (ERIR)
 *
 * Backend: InvoicesController
 * Endpoint: POST /api/invoices/v1/{externalId}/ready
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

      console.log('Submitting act with ID:', actId)
      
      // Backend endpoint is /ready, not /submit
      // Backend returns empty object {} on success (200 OK)
      const response = await http.post<ActSubmitResponse>(`/api/invoices/v1/${actId}/ready`, {})
      
      console.log('Submit act response status:', response.status)
      console.log('Submit act response data:', response.data)
      
      // Return response data (may be empty object {} on success)
      return response.data || {}
    },
    onSuccess: (_data, actId) => {
      // Refetch act details to get updated status
      queryClient.invalidateQueries({ queryKey: ['invoice', actId] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
  })
}
