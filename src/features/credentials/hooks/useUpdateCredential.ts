/**
 * Hook for updating an existing credential
 *
 * @returns Mutation for updating credentials
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import http from '../../../api/http'
import { CREDENTIALS_QUERY_KEY } from './useCredentials'
import type { ApiCredentialResponse, UpdateApiCredentialRequest } from '../../../types'

export const useUpdateCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApiCredentialRequest }) => {
      const response = await http.put<ApiCredentialResponse>(`/api/credentials/v1/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY })
    },
  })
}
