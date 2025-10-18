/**
 * Hook for fetching contracts for a specific counterparty
 *
 * @param partyExternalId - External ID of the counterparty
 * @returns Query result with contracts list
 */

import { useCounterpartyContractsQuery } from '../../../hooks/useCounterparties'

export const useContractsByParty = (partyExternalId: string) => {
  return useCounterpartyContractsQuery({
    externalId: partyExternalId,
    cacheOnly: false
  }, !!partyExternalId)
}
