import { useMutation } from '@tanstack/react-query'
import AiService from '../services/ai'
import type { GetKktyByTextRequest } from '../types'

export const useKktyByText = () => {
  return useMutation({
    mutationFn: async (request: GetKktyByTextRequest) => {
      return await AiService.getKktyByText(request)
    },
  })
}



