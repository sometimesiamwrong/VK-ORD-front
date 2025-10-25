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
import type { ActsListResponse, ActsListBackendResponse, ActsListRequest, ActBackendEntity, ActSummary, ActStatus } from '../../../types'

// Map backend entity to frontend ActSummary
const mapActBackendToSummary = (entity: ActBackendEntity): ActSummary => {
  // Parse amount from services with safe fallback
  let amountIncludingVat = 0
  try {
    const amountStr = entity.data?.amount?.services?.includingVat
    if (amountStr) {
      amountIncludingVat = parseFloat(amountStr)
      if (isNaN(amountIncludingVat)) {
        amountIncludingVat = 0
      }
    }
  } catch (error) {
    console.error('Error parsing amount for act:', entity.externalId, error)
    amountIncludingVat = 0
  }

  // Map status string to ActStatus enum
  const statusMap: Record<string, ActStatus> = {
    'Draft': 'draft',
    'Sent': 'sent',
    'Error': 'error',
    'Approved': 'approved',
    'Rejected': 'rejected'
  }
  const status = statusMap[entity.data?.status] || 'draft'

  return {
    id: entity.externalId,  // Use externalId as primary ID for frontend
    number: entity.data?.serial || '',
    date: entity.data?.date || '',
    amount: amountIncludingVat,
    status,
    contractId: entity.contractExternalId || '',
    contractNumber: undefined,  // Not provided in list response
    externalId: entity.externalId,
    companyName: '',  // Not provided in list response
    createdAt: entity.createdAt || '',
    updatedAt: entity.updatedAt || ''
  }
}

export const useActs = (params: ActsListRequest) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      try {
        // Backend expects offset/limit instead of page/limit
        const { page = 0, limit = 10, ...rest } = params
        const offset = page * limit

        const response = await http.get<ActsListBackendResponse>('/api/invoices/v1', {
          params: {
            ...rest,
            offset,
            limit
          }
        })

        // Map backend entities to frontend ActSummary
        const mappedData = response.data.data.map(mapActBackendToSummary)

        return {
          data: mappedData,
          totalItemsCount: response.data.totalItemsCount,
          totalCount: response.data.totalCount,
          limit: response.data.limit
        }
      } catch (error) {
        console.error('Failed to fetch invoices:', error)
        throw error
      }
    },
    enabled: !!params.externalId, // Only fetch if counterparty is selected
    staleTime: 1000 * 60 * 2, // 2 minutes,
  })
}
