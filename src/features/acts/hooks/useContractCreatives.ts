/**
 * Hook for fetching creatives for a specific contract
 *
 * @param contractExternalId - External ID of the contract
 * @returns Query result with contract details including creatives
 */

import { useContractDetailsQuery } from '../../../hooks/useContracts'

export const useContractCreatives = (contractExternalId: string) => {
  return useContractDetailsQuery(contractExternalId, !!contractExternalId)
}
