import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import http from '../../api/http'
import { useUserProfile } from '../../auth/hooks'
import type {
  ApiCredentialResponse,
  CreateApiCredentialRequest,
  UpdateApiCredentialRequest
} from '../../types'

// Query keys
export const CREDENTIALS_QUERY_KEY = ['credentials']

// Get all credentials for current user
export const useCredentials = () => {
  const { data: userProfile } = useUserProfile()

  return useQuery({
    queryKey: [...CREDENTIALS_QUERY_KEY, userProfile?.publicId],
    queryFn: async () => {
      if (!userProfile?.publicId) return []
      const response = await http.get<ApiCredentialResponse[] | any>(`/api/credentials/${userProfile.publicId}`)
      // Ensure we always return an array even if server returns unexpected shape
  const data = response?.data
  if (Array.isArray(data)) return data as ApiCredentialResponse[]
  // If server returned an object with a `data`, `items` or .NET `$values` field, try to extract array
  if (data && Array.isArray(data.data)) return data.data as ApiCredentialResponse[]
  if (data && Array.isArray(data.items)) return data.items as ApiCredentialResponse[]
  if (data && Array.isArray(data.$values)) return data.$values as ApiCredentialResponse[]
      // Fallback to empty array
      return [] as ApiCredentialResponse[]
    },
    enabled: !!userProfile?.publicId
  })
}

// Create credential
export const useCreateCredential = () => {
  const queryClient = useQueryClient()
  const { data: userProfile } = useUserProfile()

  return useMutation({
    mutationFn: async (data: CreateApiCredentialRequest) => {
      try {
        console.log('Creating credential, payload:', data)
        const response = await http.post<ApiCredentialResponse>('/api/credentials', data)
        console.log('Create credential response:', response.data)
        return response.data
      } catch (err) {
        console.error('Create credential failed:', err)
        throw err
      }
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
    onError: (error: any) => {
      toast.error(error?.message || 'Ошибка при добавлении токена')
    },
  })
}

// Update credential
export const useUpdateCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApiCredentialRequest }) => {
      const response = await http.put<ApiCredentialResponse>(`/api/credentials/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY })
    },
  })
}

// Delete credential
export const useDeleteCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await http.delete(`/api/credentials/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY })
    },
  })
}

