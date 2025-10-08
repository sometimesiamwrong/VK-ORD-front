import { QueryClient } from '@tanstack/react-query'

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
      // Handle API errors globally - log to console, UI notifications handled in components
      if (error?.response?.data) {
        const apiResponse = error.response.data
        if (apiResponse.message) {
          console.error('API Error:', apiResponse.message)
        } else {
          console.error('Произошла ошибка при выполнении запроса')
        }
      } else if (error?.message) {
        console.error('API Error:', error.message)
      } else {
        console.error('Произошла неизвестная ошибка')
      }
    },
  },
}

export const queryClient = new QueryClient({
  defaultOptions,
})
