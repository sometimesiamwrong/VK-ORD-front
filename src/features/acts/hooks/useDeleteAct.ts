/**
 * Hook for deleting an act (invoice)
 *
 * Backend: InvoicesController
 * Endpoint: DELETE /api/invoices/{externalId}
 *
 * @returns Mutation for deleting acts
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '../../../api/http'

export const useDeleteAct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (actId: string) => {
      // Backend uses externalId in URL
      await http.delete(`/api/invoices/v1/${actId}`)
    },
    onSuccess: (_, actId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['invoice', actId] })
      // Invalidate acts list
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    }
  })
}
