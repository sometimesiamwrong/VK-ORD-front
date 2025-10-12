import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import MediaService from '../services/media'
import type { PageRequest } from '../types'

export const useMediaUpload = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      return await MediaService.uploadMedia(file)
    },
    onSuccess: () => {
      // Invalidate media list queries
      queryClient.invalidateQueries({ queryKey: ['media', 'list'] })
    },
  })
}

export const useMediaInfo = () => {
  return useMutation({
    mutationFn: async (externalId: string) => {
      return await MediaService.getMediaInfo(externalId)
    },
  })
}

export const useMediaList = (params?: PageRequest) => {
  return useQuery({
    queryKey: ['media', 'list', params],
    queryFn: async () => {
      return await MediaService.getMediaList(params)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Query hook for specific media info
export const useMediaInfoQuery = (externalId: string, enabled = true) => {
  return useQuery({
    queryKey: ['media', 'info', externalId],
    queryFn: async () => {
      return await MediaService.getMediaInfo(externalId)
    },
    enabled: enabled && !!externalId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}



