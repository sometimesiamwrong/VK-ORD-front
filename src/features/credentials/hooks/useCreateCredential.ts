/**
 * Hook for creating a new credential
 *
 * @returns Mutation for creating credentials
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import http from '../../../api/http'
import { useUserProfile } from '../../../auth/hooks'
import { getErrorMessage } from '../../../api/errorHandler'
import { CREDENTIALS_QUERY_KEY } from './useCredentials'
import type { ApiCredentialResponse, CreateApiCredentialRequest } from '../../../types'

export const useCreateCredential = () => {
  const queryClient = useQueryClient()
  const { data: userProfile } = useUserProfile()

  return useMutation({
    mutationFn: async (data: CreateApiCredentialRequest) => {
      console.log('Creating credential, payload:', data)
      const response = await http.post<ApiCredentialResponse>('/api/credentials/v1', data)
      console.log('Create credential response:', response.data)
      return response.data
    },
    onSuccess: (data) => {
      // Try to update cache for the current user so UI updates immediately
      try {
        const userKey = [...CREDENTIALS_QUERY_KEY, userProfile?.publicId]
        if (userProfile?.publicId && data) {
          const newItem = data as any
          queryClient.setQueryData(userKey, (old: any) => {
            if (!old) return [data]

            // If cached shape is a .NET object with $values array
            if (old && Array.isArray(old.$values)) {
              const values = old.$values as any[]
              if (!values.find((item: any) => item['public_id'] === newItem['public_id'] || item.publicId === newItem.publicId)) {
                return { ...old, $values: [...values, newItem] }
              }
              return old
            }

            // If cached is a normal array
            if (Array.isArray(old) && !old.find((item: any) => item.publicId === data.publicId)) {
              return [...old, data]
            }

            return old
          })
        }
      } catch (e) {
        // ignore cache update errors
      }

      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY })
      toast.success('Токен успешно добавлен')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Ошибка при добавлении токена'))
    },
  })
}
