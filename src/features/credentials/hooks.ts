import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
      const response = await http.get<ApiCredentialResponse[]>(`/api/Credentials/${userProfile.publicId}`)
      return response.data || []
    },
    enabled: !!userProfile?.publicId
  })
}

// Create credential
export const useCreateCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateApiCredentialRequest) => {
      const response = await http.post<ApiCredentialResponse>('/api/Credentials', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY })
    },
  })
}

// Update credential
export const useUpdateCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApiCredentialRequest }) => {
      const response = await http.put<ApiCredentialResponse>(`/api/Credentials/${id}`, data)
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
      await http.delete(`/api/Credentials/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY })
    },
  })
}

