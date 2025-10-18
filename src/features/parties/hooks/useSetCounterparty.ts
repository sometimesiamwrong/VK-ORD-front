/**
 * Hook for creating/setting a counterparty in VK ORD
 *
 * @returns Mutation for setting counterparty
 */

import { useMutation } from '@tanstack/react-query'
import http from '../../../api/http'
import { getCookie } from '../../../utils'
import type { VkOrdPersonRoles } from '../../../types'

export const useSetCounterparty = () => {
  return useMutation({
    mutationFn: async (data: { inn: string; types?: VkOrdPersonRoles[] }) => {
      const apiCredentialPublicId = getCookie('vkord-credential-id')
      if (!apiCredentialPublicId) {
        throw new Error('Не выбран токен VK API')
      }

      const response = await http.post<unknown>(
        '/api/counterparties/v1',
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
