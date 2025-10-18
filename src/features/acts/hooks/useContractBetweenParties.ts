/**
 * Hook for finding contract between two specific parties
 *
 * @param firstPartyInn - INN of the first party
 * @param secondPartyInn - INN of the second party
 * @returns Query result with contract between parties
 */

import { useContractBetweenQuery } from '../../../hooks/useContracts'

export const useContractBetweenParties = (firstPartyInn: string, secondPartyInn: string) => {
  return useContractBetweenQuery(firstPartyInn, secondPartyInn, !!firstPartyInn && !!secondPartyInn)
}
