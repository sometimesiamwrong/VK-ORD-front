import { useMutation, useQuery } from '@tanstack/react-query'
import CounterpartiesService from '../services/counterparties'
import type {
  GetCounterpartiesByInnParams,
  GetCounterpartyContractsParams,
  GetRelatedCounterpartiesParams
} from '../services/counterparties'

export const useCounterpartiesByInn = () => {
  return useMutation({
    mutationFn: async (params: GetCounterpartiesByInnParams) => {
      return await CounterpartiesService.getCounterpartiesByInn(params)
    },
  })
}

export const useCounterpartyContracts = () => {
  return useMutation({
    mutationFn: async (params: GetCounterpartyContractsParams) => {
      return await CounterpartiesService.getCounterpartyContracts(params)
    },
  })
}

export const useRelatedCounterparties = () => {
  return useMutation({
    mutationFn: async (params: GetRelatedCounterpartiesParams) => {
      return await CounterpartiesService.getRelatedCounterparties(params)
    },
  })
}

// Query hooks for cached data
export const useCounterpartiesByInnQuery = (params: GetCounterpartiesByInnParams, enabled = true) => {
  return useQuery({
    queryKey: ['counterparties', 'by-inn', params.inn, params],
    queryFn: async () => {
      return await CounterpartiesService.getCounterpartiesByInn(params)
    },
    enabled: enabled && !!params.inn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCounterpartyContractsQuery = (params: GetCounterpartyContractsParams, enabled = true) => {
  return useQuery({
    queryKey: ['counterparties', 'contracts', params.inn, params],
    queryFn: async () => {
      return await CounterpartiesService.getCounterpartyContracts(params)
    },
    enabled: enabled && !!params.inn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useRelatedCounterpartiesQuery = (params: GetRelatedCounterpartiesParams, enabled = true) => {
  return useQuery({
    queryKey: ['counterparties', 'related', params.inn, params],
    queryFn: async () => {
      return await CounterpartiesService.getRelatedCounterparties(params)
    },
    enabled: enabled && !!params.inn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}