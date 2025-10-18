/**
 * Hook for fetching list of acts (invoices)
 *
 * Backend: InvoicesController
 * Endpoint: GET /api/invoices?offset=0&limit=10
 *
 * @param params - Filters for acts list (externalId, offset, limit)
 * @returns Query result with acts list
 */

import { useQuery } from '@tanstack/react-query'
import http from '../../../api/http'
import type { ActsListResponse, ActsListRequest } from '../../../types'

export const useActs = (params: ActsListRequest) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      try {
        // Backend expects offset/limit instead of page/limit
        const { page = 0, limit = 10, ...rest } = params
        const offset = page * limit

        const response = await http.get<ActsListResponse>('/api/invoices/v1', {
          params: {
            ...rest,
            offset,
            limit
          }
        })

        return response.data
      } catch (error) {
        console.error('Failed to fetch invoices:', error)
        throw error
      }
    },
    enabled: !!params.externalId, // Only fetch if counterparty is selected
    staleTime: 1000 * 60 * 2, // 2 minutes,
  })
}
