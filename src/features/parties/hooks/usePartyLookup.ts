/**
 * Hook for looking up party information by INN via DaData
 * 
 * NOTE: Renamed from usePartyLookup to useDaDataLookup to avoid naming conflict
 * with /src/hooks/usePartyLookup.ts (which handles wizard party lookup logic)
 *
 * @returns Mutation for DaData party lookup
 */

import { useMutation } from '@tanstack/react-query'
import http from '../../../api/http'
import type { DaDataPartyShortResponse } from '../../../types'

export const useDaDataLookup = () => {
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

// Backward compatibility alias (deprecated)
/** @deprecated Use useDaDataLookup instead */
export const usePartyLookup = useDaDataLookup
