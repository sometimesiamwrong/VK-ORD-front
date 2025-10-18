/**
 * Hook for fetching list of creatives with pagination
 *
 * @param offset - Pagination offset
 * @param limit - Pagination limit
 * @returns Query result with creatives list
 */

import { useQuery } from '@tanstack/react-query'
import http from '../../../api/http'
import type { GetCreativesResponse } from '../../../types'

export const useCreativesList = (offset: number, limit: number) => {
  return useQuery({
    queryKey: ['creatives', { offset, limit }],
    queryFn: async () => {
      const response = await http.get<GetCreativesResponse>('/api/creatives/v1', {
        params: { offset, limit }
      })
      return response.data
    }
  })
}
