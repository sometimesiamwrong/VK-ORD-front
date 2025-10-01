import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useTokenStore, useEnvironmentStore } from '../auth/tokenStore'
import type { ApiResponse } from '../types'

let isRefreshing = false
let refreshPromise: Promise<string> | null = null
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })

  failedQueue = []
  refreshPromise = null
}

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add Authorization header if we have access token
    const { accessToken } = useTokenStore.getState()
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    // Add environment header
    const { environment } = useEnvironmentStore.getState()
    if (environment !== 'prod' && config.headers) {
      config.headers['x-api-vk-env'] = environment
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Don't retry auth endpoints to avoid infinite loop
    const authEndpoints = ['/api/auth/refresh', '/api/auth/login', '/api/auth/register']
    if (authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing && refreshPromise) {
        // If refresh is already in progress, wait for it
        return refreshPromise
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return http(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      // Start refresh process
      isRefreshing = true

      // Create a shared promise for all waiting requests
      refreshPromise = new Promise<string>(async (resolve, reject) => {
        try {
          // Получаем refresh token из куки
          const { getRefreshToken, setAccessToken, setRefreshToken, clearTokens } = useTokenStore.getState()
          const refreshToken = getRefreshToken()

          if (!refreshToken) {
            // Нет refresh token - перенаправляем на логин
            clearTokens()
            processQueue(error, null)
            isRefreshing = false
            window.location.href = '/login'
            reject(new Error('No refresh token available'))
            return
          }

          console.log('🔄 Refreshing token...')

          // Try to refresh token - НЕ отправляем refreshToken в body, только в cookies
          const refreshResponse = await axios.post<ApiResponse<any>>(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
            {}, // Пустой body - refresh token в cookies
            { withCredentials: true }
          )

          if (refreshResponse.data.success && refreshResponse.data.data) {
            const newToken = refreshResponse.data.data.token
            console.log('✅ Token refreshed successfully')
            
            setAccessToken(newToken)

            // Обновляем refresh token, если сервер вернул новый
            if (refreshResponse.data.data.refreshToken) {
              setRefreshToken(refreshResponse.data.data.refreshToken)
            }

            // Process queued requests
            processQueue(null, newToken)
            isRefreshing = false
            resolve(newToken)
          } else {
            // Refresh failed, clear tokens and redirect to login
            console.error('❌ Token refresh failed:', refreshResponse.data.message)
            clearTokens()
            processQueue(error, null)
            isRefreshing = false
            window.location.href = '/login'
            reject(new Error(refreshResponse.data.message || 'Token refresh failed'))
          }
        } catch (refreshError: any) {
          // Refresh failed, clear tokens and redirect to login
          console.error('❌ Token refresh error:', refreshError)
          useTokenStore.getState().clearTokens()
          processQueue(refreshError, null)
          isRefreshing = false
          window.location.href = '/login'
          reject(refreshError)
        }
      })

      // Wait for the refresh to complete and retry the original request
      return refreshPromise
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return http(originalRequest)
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    }

    return Promise.reject(error)
  }
)

export default http
