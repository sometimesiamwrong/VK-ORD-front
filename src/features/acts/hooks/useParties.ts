/**
 * Hook for fetching all counterparties
 *
 * @returns Query result with list of counterparties
 */

import { useCounterpartiesList } from '../../../hooks/usePartyLookup'

export const useParties = () => {
  return useCounterpartiesList()
}
