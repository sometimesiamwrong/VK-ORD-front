import { useMutation, useQuery } from '@tanstack/react-query'
import ContractsService from '../services/contracts'


export const useContractDetails = () => {
  return useMutation({
    mutationFn: async (contractExternalId: string) => {
      return await ContractsService.getContractDetails(contractExternalId)
    },
  })
}

// Query hooks for cached data

export const useContractDetailsQuery = (contractExternalId: string, enabled = true) => {
  return useQuery({
    queryKey: ['contracts', 'details', contractExternalId],
    queryFn: async () => {
      return await ContractsService.getContractDetails(contractExternalId)
    },
    enabled: enabled && !!contractExternalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useContractBetweenQuery = (firstPartyInn: string, secondPartyInn: string, enabled = true) => {
  return useQuery({
    queryKey: ['contracts', 'between', firstPartyInn, secondPartyInn],
    queryFn: async () => {
      return await ContractsService.getContractBetween(firstPartyInn, secondPartyInn)
    },
    enabled: enabled && !!firstPartyInn && !!secondPartyInn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}




