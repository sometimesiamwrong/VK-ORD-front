import { QueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

const defaultOptions = {
  queries: {
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors (except 429)
      if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 429) {
        return false
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
  mutations: {
    retry: false,
    onError: (error: any) => {
      // Handle API errors globally
      if (error?.response?.data) {
        const apiResponse = error.response.data
        if (apiResponse.message) {
          toast.error(apiResponse.message)
        } else {
          toast.error('Произошла ошибка при выполнении запроса')
        }
      } else if (error?.message) {
        toast.error(error.message)
      } else {
        toast.error('Произошла неизвестная ошибка')
      }
    },
  },
}

export const queryClient = new QueryClient({
  defaultOptions,
})
