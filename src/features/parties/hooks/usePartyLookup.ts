/**
 * Hook for looking up party information by INN
 *
 * @returns Mutation for party lookup
 */

import { useMutation } from '@tanstack/react-query'
import http from '../../../api/http'
import type { DaDataPartyShortResponse } from '../../../types'

export const usePartyLookup = () => {
  return useMutation({
    mutationFn: async (inn: string) => {
      const response = await http.post<DaDataPartyShortResponse>(
        '/api/client/v1/party',
        { inn }
      )
      return response.data
    },
  })
}
