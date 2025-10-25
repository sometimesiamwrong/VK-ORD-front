/**
 * Hook for updating an existing act (invoice)
 *
 * Backend: InvoicesController
 * Endpoint: PUT /api/invoices/v1/{externalId}
 *
 * @returns Mutation for updating acts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '../../../api/http'
import type { ActDetails, UpdateActRequest } from '../../../types'

export const useUpdateAct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateActRequest) => {
      // Backend uses externalId in URL, same endpoint as create
      const externalId = data.externalId;
      const response = await http.put<ActDetails>(`/api/invoices/v1/${externalId}`, data)
      return response.data
    },
    onSuccess: (data) => {
      // Update the act in cache
      queryClient.setQueryData(['invoice', data.id], data)
      // Invalidate acts list to refetch
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
  })
}
