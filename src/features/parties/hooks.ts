import { useMutation } from '@tanstack/react-query'
import http from '../../api/http'
import type { ApiResponse, DaDataPartyShortResponse } from '../../types'

// Party lookup hook
export const usePartyLookup = () => {
  return useMutation({
    mutationFn: async (inn: string) => {
      const response = await http.post<ApiResponse<DaDataPartyShortResponse>>(
        '/api/Client/party',
        { inn }
      )
      return response.data
    },
  })
}

// Set counterparty hook
export const useSetCounterparty = () => {
  return useMutation({
    mutationFn: async (data: { inn: string; types: string[] }) => {
      const response = await http.post<ApiResponse<unknown>>(
        '/api/Client/set-counterparty',
        { inn: data.inn, types: data.types }
      )
      return response.data
    },
  })
}


