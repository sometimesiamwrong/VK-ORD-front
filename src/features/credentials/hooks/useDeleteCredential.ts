/**
 * Hook for deleting a credential
 *
 * @returns Mutation for deleting credentials
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '../../../api/http'
import { CREDENTIALS_QUERY_KEY } from './useCredentials'

export const useDeleteCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await http.delete(`/api/credentials/v1/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY })
    },
  })
}
