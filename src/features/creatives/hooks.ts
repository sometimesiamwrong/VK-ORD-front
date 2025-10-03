import { useQuery, useMutation } from '@tanstack/react-query'
import http from '../../api/http'
import type { ApiResponse } from '../../types'
import type { CreativeDetails } from '../../types'

export interface GetCreativesResponse {
  creatives: CreativeDetails[]
  totalItemsCount?: number
  limit?: number
}

export const useCreativesList = (offset: number, limit: number) => {
  return useQuery({
    queryKey: ['creatives', { offset, limit }],
    queryFn: async () => {
      const response = await http.get<ApiResponse<GetCreativesResponse>>('/api/creatives', {
        params: { offset, limit }
      })
      return response.data
    }
  })
}

export const useCreativeByErid = () => {
  return useMutation({
    mutationFn: async (erid: string) => {
      const response = await http.get<ApiResponse<CreativeDetails>>(`/api/creatives/by-erid/${erid}`)
      return response.data
    }
  })
}


