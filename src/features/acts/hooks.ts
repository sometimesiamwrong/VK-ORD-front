import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import http from '../../api/http'
import { getCookie } from '../../utils'
import { useCounterpartiesList } from '../../hooks/usePartyLookup'
import { useCounterpartyContractsQuery, useRelatedCounterpartiesQuery } from '../../hooks/useCounterparties'
import { useContractBetweenQuery, useContractDetailsQuery } from '../../hooks/useContracts'
import type {
  CounterpartyItem,
  ActDetails,
  ActsListResponse,
  ActsListRequest,
  CreateActRequest,
  UpdateActRequest,
  ActSubmitResponse,
  ActStatisticsRequest
} from '../../types'


// Parties hooks - get counterparties from stored data
export const useParties = () => {
  return useCounterpartiesList()
}

// Parties search hook - search within loaded counterparties
export const usePartiesSearch = () => {
  const { data: parties = [] } = useParties()

  return useMutation({
    mutationFn: async (query: string) => {
      if (!query.trim()) return parties

      const lowerQuery = query.toLowerCase()
      return parties.filter((party: CounterpartyItem) =>
        party.name?.toLowerCase().includes(lowerQuery) ||
        party.juridicalDetails?.inn?.includes(query) ||
        party.juridicalDetails?.kpp?.includes(query)
      )
    }
  })
}

// Acts hooks
export const useActs = (params: ActsListRequest) => {
  return useQuery({
    queryKey: ['acts', params],
    queryFn: async () => {
      try {
        const response = await http.get<ActsListResponse>('/api/acts', {
          params
        })
        return response.data
      } catch (error) {
        // Return filtered mock data if API is not available
        console.log('API not available, using mock data for acts')
        if (!params.companyId) return { acts: [], total: 0, page: 0, limit: 10 }

        // Return empty data when API is not available
        return {
          acts: [],
          total: 0,
          page: params.page || 0,
          limit: params.limit || 10
        }
      }
    },
    enabled: !!params.companyId, // Only fetch if company is selected
  })
}

export const useActDetails = (actId: string) => {
  return useQuery({
    queryKey: ['act', actId],
    queryFn: async () => {
      try {
        const response = await http.get<ActDetails>(`/api/acts/${actId}`)
        return response.data
      } catch (error) {
        // Return mock data if API is not available
        console.log('API not available, using mock data for act details')
        throw new Error(`Act with id ${actId} not found`)
      }
    },
    enabled: !!actId,
  })
}

export const useCreateAct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateActRequest) => {
      const apiCredentialPublicId = getCookie('vkord-credential-id')
      if (!apiCredentialPublicId) {
        throw new Error('Не выбран токен VK API')
      }

      const response = await http.post<ActDetails>('/api/acts', {
        ...data,
        apiCredentialPublicId
      })
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch acts list
      queryClient.invalidateQueries({ queryKey: ['acts'] })
      // Add the new act to cache
      queryClient.setQueryData(['act', data.id], data)
    }
  })
}

export const useUpdateAct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateActRequest) => {
      const response = await http.put<ActDetails>(`/api/acts/${data.id}`, data)
      return response.data
    },
    onSuccess: (data) => {
      // Update the act in cache
      queryClient.setQueryData(['act', data.id], data)
      // Invalidate acts list to refetch
      queryClient.invalidateQueries({ queryKey: ['acts'] })
    }
  })
}

export const useDeleteAct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (actId: string) => {
      await http.delete(`/api/acts/${actId}`)
    },
    onSuccess: (_, actId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['act', actId] })
      // Invalidate acts list
      queryClient.invalidateQueries({ queryKey: ['acts'] })
    }
  })
}

export const useSubmitAct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (actId: string) => {
      const apiCredentialPublicId = getCookie('vkord-credential-id')
      if (!apiCredentialPublicId) {
        throw new Error('Не выбран токен VK API')
      }

      const response = await http.post<ActSubmitResponse>(`/api/acts/${actId}/submit`, {
        apiCredentialPublicId
      })
      return response.data
    },
    onSuccess: (data, actId) => {
      if (data.success) {
        // Refetch act details to get updated status
        queryClient.invalidateQueries({ queryKey: ['act', actId] })
        queryClient.invalidateQueries({ queryKey: ['acts'] })
      }
    }
  })
}

// Contracts hooks - get contracts for a counterparty using new API
export const useContractsByParty = (partyInn: string) => {
  return useCounterpartyContractsQuery({
    inn: partyInn,
    cacheOnly: false,
    forceRefresh: false,
    maxResults: 100
  }, !!partyInn)
}

// Creatives hooks - get creatives for a contract using new API
export const useContractCreatives = (contractExternalId: string) => {
  return useContractDetailsQuery(contractExternalId, !!contractExternalId)
}

// Related parties hook - get parties that have contracts with the selected party
export const useRelatedParties = (partyInn: string) => {
  const query = useRelatedCounterpartiesQuery({
    inn: partyInn,
    cacheOnly: false,
    forceRefresh: false,
    maxResults: 100
  }, !!partyInn)

  // Transform CounterpartyDto to CounterpartyItem format
  const transformedData = query.data ? {
    ...query.data,
    relatedCounterparties: query.data.relatedCounterparties.map((dto): CounterpartyItem => ({
      external_id: dto.external_id,
      name: dto.name,
      roles: dto.roles,
      juridicalDetails: {
        inn: dto.juridical_details.inn,
        kpp: dto.juridical_details.kpp,
        type: 'juridical' // Default type, could be enhanced
      }
    }))
  } : undefined

  return {
    ...query,
    data: transformedData
  }
}

// Contract between parties hook - find contract between two specific parties using new API
export const useContractBetweenParties = (firstPartyInn: string, secondPartyInn: string) => {
  return useContractBetweenQuery(firstPartyInn, secondPartyInn, !!firstPartyInn && !!secondPartyInn)
}

// Statistics hooks using new API
export const useActStatistics = () => {
  return useMutation({
    mutationFn: async (params: ActStatisticsRequest) => {
      const response = await http.post('/api/v1/statistics/acts', params)
      return response.data
    }
  })
}

// Query hook for statistics
export const useActStatisticsQueryHook = (params: ActStatisticsRequest, enabled = true) => {
  return useQuery({
    queryKey: ['statistics', 'acts', params],
    queryFn: async () => {
      const response = await http.post('/api/v1/statistics/acts', params)
      return response.data
    },
    enabled: enabled && !!params.startDate && !!params.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
