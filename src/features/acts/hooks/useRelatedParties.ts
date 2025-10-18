/**
 * Hook for fetching parties that have contracts with the selected party
 *
 * @param partyExternalId - External ID of the counterparty
 * @returns Query result with related counterparties list
 */

import { useRelatedCounterpartiesQuery } from '../../../hooks/useCounterparties'
import type { CounterpartyItem } from '../../../types'

export const useRelatedParties = (partyExternalId: string) => {
  const query = useRelatedCounterpartiesQuery({
    externalId: partyExternalId
  }, !!partyExternalId)

  // Transform CounterpartyDto to CounterpartyItem format
  const transformedData = query.data ? {
    ...query.data,
    relatedCounterparties: query.data.relatedCounterparties.map((dto): CounterpartyItem => ({
      external_id: dto.external_id || dto.externalId,
      name: dto.data.name,
      roles: dto.data.roles,
      juridical_details: dto.data.juridical_details || dto.data.juridicalDetails ? {
        inn: (dto.data.juridical_details || dto.data.juridicalDetails)!.inn,
        kpp: (dto.data.juridical_details || dto.data.juridicalDetails)!.kpp,
        type: (dto.data.juridical_details || dto.data.juridicalDetails)!.type || 'juridical'
      } : undefined
    }))
  } : undefined

  return {
    ...query,
    data: transformedData
  }
}
