import { useMutation, useQuery } from '@tanstack/react-query'
import StatisticsService from '../services/statistics'
import type { ActStatisticsRequest } from '../types'
import type { GetActStatisticsParams } from '../services/statistics'

export const useActStatistics = () => {
  return useMutation({
    mutationFn: async (request: ActStatisticsRequest) => {
      return await StatisticsService.getActStatistics(request)
    },
  })
}

export const useActStatisticsGet = () => {
  return useMutation({
    mutationFn: async (params: GetActStatisticsParams) => {
      return await StatisticsService.getActStatisticsGet(params)
    },
  })
}

// Query hooks for cached data
export const useActStatisticsQuery = (request: ActStatisticsRequest, enabled = true) => {
  return useQuery({
    queryKey: ['statistics', 'acts', request],
    queryFn: async () => {
      return await StatisticsService.getActStatistics(request)
    },
    enabled: enabled && !!request.startDate && !!request.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useActStatisticsGetQuery = (params: GetActStatisticsParams, enabled = true) => {
  return useQuery({
    queryKey: ['statistics', 'acts-get', params],
    queryFn: async () => {
      return await StatisticsService.getActStatisticsGet(params)
    },
    enabled: enabled && !!params.startDate && !!params.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}



