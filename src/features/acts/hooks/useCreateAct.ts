/**
 * Hook for creating a new act (invoice)
 *
 * Backend: InvoicesController
 * Endpoint: PUT /api/invoices/v1/{externalId}
 *
 * @returns Mutation for creating acts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '../../../api/http'
import { getCookie } from '../../../utils'
import type { ActBackendEntity, CreateActRequest } from '../../../types'

export const useCreateAct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateActRequest) => {
      const apiCredentialPublicId = getCookie('vkord-credential-id')
      if (!apiCredentialPublicId) {
        throw new Error('Не выбран токен VK API')
      }

      // Use externalId from data or generate new one
      const externalId = data.externalId || `act_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // Backend expects PUT with externalId in URL and in body
      const payload = { ...data, externalId }
      
      console.log('Creating act with externalId:', externalId, 'payload:', payload)
      
      // Backend returns ActBackendEntity, not ActDetails
      const response = await http.put<ActBackendEntity>(`/api/invoices/v1/${externalId}`, payload)
      
      console.log('Create act response:', response.data)
      
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch acts list
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      // Add the new act to cache using externalId (ActBackendEntity uses externalId as identifier)
      if (data.externalId) {
        queryClient.setQueryData(['invoice', data.externalId], data)
      }
    }
  })
}
