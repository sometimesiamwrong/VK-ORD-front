import { useQuery, useMutation } from '@tanstack/react-query'
import http from '../../api/http'
import type { GetCreativesResponse, VkOrdCreativeV3Response } from '../../types'

export const useCreativesList = (offset: number, limit: number) => {
  return useQuery({
    queryKey: ['creatives', { offset, limit }],
    queryFn: async () => {
      const response = await http.get<GetCreativesResponse>('/api/Creatives', {
        params: { Offset: offset, Limit: limit }
      })
      return response.data
    }
  })
}

export const useCreativeByErid = () => {
  return useMutation({
    mutationFn: async (erid: string) => {
      const response = await http.get<VkOrdCreativeV3Response>(`/api/Creatives/by-erid/${erid}`)
      return response.data
    }
  })
}


