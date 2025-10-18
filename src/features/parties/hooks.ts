import { useMutation } from '@tanstack/react-query'
import http from '../../api/http'
import { getCookie } from '../../utils'
import type { DaDataPartyShortResponse, VkOrdPersonRoles } from '../../types'

// Party lookup hook
export const usePartyLookup = () => {
  return useMutation({
    mutationFn: async (inn: string) => {
      const response = await http.post<DaDataPartyShortResponse>(
        '/api/client/party',
        { inn }
      )
      return response.data
    },
  })
}

// Set counterparty hook
export const useSetCounterparty = () => {
  return useMutation({
    mutationFn: async (data: { inn: string; types?: VkOrdPersonRoles[] }) => {
      const apiCredentialPublicId = getCookie('vkord-credential-id')
      if (!apiCredentialPublicId) {
        throw new Error('Не выбран токен VK API')
      }

      const response = await http.post<unknown>(
        '/api/client/set-counterparty',
        {
          apiCredentialPublicId,
          inn: data.inn,
          types: data.types
        }
      )
      return response.data
    },
  })
}


