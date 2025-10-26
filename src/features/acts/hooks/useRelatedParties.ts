/**
 * Hook for fetching parties that have contracts with the selected party
 *
 * @param partyExternalId - External ID of the counterparty
 * @returns Query result with related counterparties list
 */

import { useRelatedCounterpartiesQuery } from '../../../hooks/useCounterparties'
import { transformCounterpartyDtoArray } from '../../../utils/transformers'

export const useRelatedParties = (partyExternalId: string) => {
  const query = useRelatedCounterpartiesQuery({
    externalId: partyExternalId
  }, !!partyExternalId)

  // Transform CounterpartyDto array to CounterpartyItem array
  const transformedData = query.data ? {
    ...query.data,
    relatedCounterparties: transformCounterpartyDtoArray(query.data.relatedCounterparties)
  } : undefined

  return {
    ...query,
    data: transformedData
  }
}
