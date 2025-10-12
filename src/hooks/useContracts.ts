import { useMutation, useQuery } from '@tanstack/react-query'
import ContractsService from '../services/contracts'

export const useContractBetween = () => {
  return useMutation({
    mutationFn: async ({ clientInn, contractorInn }: { clientInn: string; contractorInn: string }) => {
      return await ContractsService.getContractBetween(clientInn, contractorInn)
    },
  })
}

export const useContractDetails = () => {
  return useMutation({
    mutationFn: async (contractExternalId: string) => {
      return await ContractsService.getContractDetails(contractExternalId)
    },
  })
}

// Query hooks for cached data
export const useContractBetweenQuery = (clientInn: string, contractorInn: string, enabled = true) => {
  return useQuery({
    queryKey: ['contracts', 'between', clientInn, contractorInn],
    queryFn: async () => {
      return await ContractsService.getContractBetween(clientInn, contractorInn)
    },
    enabled: enabled && !!clientInn && !!contractorInn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

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



