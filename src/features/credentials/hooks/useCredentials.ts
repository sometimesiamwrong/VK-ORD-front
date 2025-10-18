/**
 * Hook for fetching all credentials for current user
 *
 * @returns Query result with credentials list
 */

import { useQuery } from '@tanstack/react-query'
import http from '../../../api/http'
import { useUserProfile } from '../../../auth/hooks'
import type { ApiCredentialResponse } from '../../../types'

// Query keys
export const CREDENTIALS_QUERY_KEY = ['credentials']

export const useCredentials = () => {
  const { data: userProfile } = useUserProfile()

  return useQuery({
    queryKey: [...CREDENTIALS_QUERY_KEY, userProfile?.publicId],
    queryFn: async () => {
      if (!userProfile?.publicId) return []
      const response = await http.get<ApiCredentialResponse[] | any>(`/api/credentials/v1/${userProfile.publicId}`)
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
