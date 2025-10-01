import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import http from '../../api/http'
import type {
  Credential,
  CreateCredentialRequest,
  UpdateCredentialRequest,
  ApiResponse
} from '../../types'

// Query keys
export const CREDENTIALS_QUERY_KEY = ['credentials']

// Get all credentials
export const useCredentials = () => {
  return useQuery({
    queryKey: CREDENTIALS_QUERY_KEY,
    queryFn: async () => {
      const response = await http.get<ApiResponse<Credential[]>>('/api/credentials')
      if (response.data.success) {
        return response.data.data || []
      }
      throw new Error(response.data.message || 'Failed to fetch credentials')
    },
  })
}

// Create credential
export const useCreateCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCredentialRequest) => {
      const response = await http.post<ApiResponse<Credential>>('/api/credentials', data)
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateCredentialRequest }) => {
      const response = await http.put<ApiResponse<Credential>>(`/api/credentials/${id}`, data)
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
      const response = await http.delete<ApiResponse<null>>(`/api/credentials/${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY })
    },
  })
}

// Get credential token (for using in API calls)
export const useGetCredentialToken = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await http.get<ApiResponse<{ token: string }>>(`/api/credentials/${id}`)
      if (response.data.success && response.data.data) {
        return response.data.data.token
      }
      throw new Error(response.data.message || 'Failed to get credential token')
    },
  })
}
