/**
 * Hook for fetching single act details
 *
 * @param actId - Act ID to fetch
 * @returns Query result with act details
 */

import { useQuery } from '@tanstack/react-query'
import http from '../../../api/http'
import type { ActDetails } from '../../../types'

export const useActDetails = (actId: string) => {
  return useQuery({
    queryKey: ['act', actId],
    queryFn: async () => {
      try {
        const response = await http.get<ActDetails>(`/api/acts/${actId}`)
        return response.data
      } catch (error) {
        // Return mock data if API is not available
        console.log('API not available, using mock data for act details')
        throw new Error(`Act with id ${actId} not found`)
      }
    },
    enabled: !!actId,
  })
}
