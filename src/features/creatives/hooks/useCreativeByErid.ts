/**
 * Hook for fetching creative by ERID
 *
 * @returns Mutation for fetching creative by ERID
 */

import { useMutation } from '@tanstack/react-query'
import http from '../../../api/http'
import type { VkOrdCreativeV3Response } from '../../../types'

export const useCreativeByErid = () => {
  return useMutation({
    mutationFn: async (erid: string) => {
      const response = await http.get<VkOrdCreativeV3Response>(`/api/creatives/v1/by-erid/${erid}`)
      return response.data
    }
  })
}
