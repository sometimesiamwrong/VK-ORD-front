/**
 * Hook for searching counterparties by query
 *
 * Searches within already loaded counterparties by name, INN, or KPP
 *
 * @returns Mutation for searching parties
 */

import { useMutation } from '@tanstack/react-query'
import { useParties } from './useParties'
import type { CounterpartyItem } from '../../../types'

export const usePartiesSearch = () => {
  const { data: parties = [] } = useParties()

  return useMutation({
    mutationFn: async (query: string) => {
      if (!query.trim()) return parties

      const lowerQuery = query.toLowerCase()
      return parties.filter((party: CounterpartyItem) =>
        party.name?.toLowerCase().includes(lowerQuery) ||
        party.juridical_details?.inn?.includes(query) ||
        party.juridical_details?.kpp?.includes(query)
      )
    }
  })
}
