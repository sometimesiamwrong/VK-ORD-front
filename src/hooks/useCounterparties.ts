import { useMutation, useQuery } from '@tanstack/react-query'
import CounterpartiesService from '../services/counterparties'
import type {
  GetCounterpartiesByInnParams,
  GetCounterpartyContractsParams,
  GetRelatedCounterpartiesParams,
  GetCounterpartiesListParams
} from '../services/counterparties'
import type { CounterpartyDto, CounterpartyItem } from '../types'

// Функция преобразования CounterpartyDto в CounterpartyItem
const transformCounterpartyDto = (dto: CounterpartyDto): CounterpartyItem => {
  const juridicalDetails = dto.data.juridicalDetails
  return {
    id: dto.id,
    externalId: dto.externalId,
    name: dto.data.name,
    roles: dto.data.roles,
    juridicalDetails: juridicalDetails ? {
      type: juridicalDetails.type,
      modelScheme: juridicalDetails.modelScheme,
      inn: juridicalDetails.inn,
      kpp: juridicalDetails.kpp,
      phone: juridicalDetails.phone,
      foreignEpaymentMethod: juridicalDetails.foreignEpaymentMethod,
      foreignRegistrationNumber: juridicalDetails.foreignRegistrationNumber,
      foreignInn: juridicalDetails.foreignInn,
      foreignOksmCountryCode: juridicalDetails.foreignOksmCountryCode
    } : undefined,
    syncStatus: dto.syncStatus,
    expiresAt: dto.expiresAt,
    updatedAt: dto.updatedAt,
    createdAt: dto.createdAt
  }
}

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
    queryKey: ['counterparties', 'contracts', params.externalId, params],
    queryFn: async () => {
      console.log('Fetching contracts for externalId:', params.externalId)
      const result = await CounterpartiesService.getCounterpartyContracts(params)
      console.log('Contracts API response:', result)
      return result
    },
    enabled: enabled && !!params.externalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useRelatedCounterpartiesQuery = (params: GetRelatedCounterpartiesParams, enabled = true) => {
  return useQuery({
    queryKey: ['counterparties', 'related', params.externalId, params],
    queryFn: async () => {
      return await CounterpartiesService.getRelatedCounterparties(params)
    },
    enabled: enabled && !!params.externalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCounterpartyByExternalIdQuery = (externalId: string, enabled = true) => {
  console.log('=== useCounterpartyByExternalIdQuery START ===')
  console.log('useCounterpartyByExternalIdQuery called with:', { externalId, enabled })
  console.log('Query will be enabled:', enabled && !!externalId)
  
  return useQuery({
    queryKey: ['counterparties', 'by-external-id', externalId],
    queryFn: async () => {
      console.log('=== Fetching counterparty by externalId ===')
      console.log('externalId:', externalId)
      console.log('Calling CounterpartiesService.getCounterpartyByExternalId...')
      
      try {
        const dto = await CounterpartiesService.getCounterpartyByExternalId(externalId)
        console.log('Raw DTO received:', dto)
        
        const transformed = transformCounterpartyDto(dto)
        console.log('Transformed counterparty:', transformed)
        console.log('=== Fetching counterparty COMPLETED ===')
        
        return transformed
      } catch (error) {
        console.error('Error fetching counterparty by externalId:', error)
        throw error
      }
    },
    enabled: enabled && !!externalId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCounterpartiesListQuery = (params: GetCounterpartiesListParams = {}, enabled = true) => {
  return useQuery({
    queryKey: ['counterparties', 'list', params],
    queryFn: async () => {
      const response = await CounterpartiesService.getCounterpartiesList(params)
      return {
        ...response,
        data: response.data.map(transformCounterpartyDto)
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}