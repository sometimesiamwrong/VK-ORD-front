import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import { useTokenStore, useEnvironmentStore, useDeviceStore } from '../auth/tokenStore'
import { getCookie } from '../utils/cookies'
import type { BrokenRule } from '../types'

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

// Broken Rules Error Mapping
const BROKEN_RULE_MESSAGES: Record<number, string> = {
  1: 'Не найдены данные по VK ОРД API ключу. Проверьте выбранные учетные данные.',
  2: 'Не найден заголовок ключа VK ОРД API. Выберите учетные данные в настройках.',
  3: 'Пользователь с таким именем уже существует.',
  4: 'Неверные учетные данные. Проверьте логин и пароль.',
  5: 'Пользователь не авторизован. Войдите в систему.',
  6: 'Ошибка VK ОРД API. Проверьте корректность данных или попробуйте позже.',
  7: 'Контрагент не найден. Проверьте ИНН и повторите поиск.',
  // Add more mappings as needed
}

// Enum field names that should be normalized to lowercase
// This ensures consistent enum handling regardless of backend casing
const ENUM_FIELDS = new Set([
  'role',
  'roles',
  'type',
  'payType',
  'form',
  'subjectType',
  'actionType',
  'flags',
  'contractorRole',
  'clientRole',
  'personType',
  'status'
])

/**
 * Recursively normalize enum field values to lowercase
 * This ensures consistent enum handling across the app regardless of backend casing
 */
const normalizeEnumValues = (data: any): any => {
  if (data === null || data === undefined) {
    return data
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => normalizeEnumValues(item))
  }

  // Handle objects
  if (typeof data === 'object') {
    const normalized: any = {}
    for (const [key, value] of Object.entries(data)) {
      // Check if this field should be normalized
      if (ENUM_FIELDS.has(key) && typeof value === 'string') {
        normalized[key] = value.toLowerCase()
      } else if (ENUM_FIELDS.has(key) && Array.isArray(value)) {
        // Handle array of enum values (e.g., roles, flags)
        normalized[key] = value.map(v => typeof v === 'string' ? v.toLowerCase() : v)
      } else {
        // Recursively process nested objects
        normalized[key] = normalizeEnumValues(value)
      }
    }
    return normalized
  }

  // Return primitives as-is
  return data
}

// Function to check if response is a broken rules error
const isBrokenRulesResponse = (response: any): boolean => {
  return (
    response?.status === 400 &&
    response?.headers?.['content-type']?.includes('application/json') &&
    Array.isArray(response?.data)
  )
}

// Function to handle broken rules error
const handleBrokenRulesError = (brokenRules: BrokenRule[]): Error => {
  // Map each broken rule to user-friendly message
  const userMessages = brokenRules.map(rule => {
    return BROKEN_RULE_MESSAGES[rule.code] || rule.message
  })

  // Create a combined error message
  const errorMessage = userMessages.join('\n')

  // Create a custom error object
  const error = new Error(errorMessage) as any
  error.brokenRules = brokenRules
  error.isBrokenRules = true

  return error
}

// Configure base URL: in production use env or default cloud domain; in dev use relative URL for proxy
const rawBaseUrl = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL || 'https://criminally-astute-kangaroo.cloudpub.ru/')
  : '/'
const baseURL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`

const http: AxiosInstance = axios.create({
  baseURL,
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

    // Attach VK ORD Credential ID from cookies for backend
    const vkOrdCredentialId = getCookie('vkord-credential-id')
    if (config.headers && vkOrdCredentialId) {
      config.headers['x-vkord-credential-id'] = vkOrdCredentialId
    }

    // Convert camelCase keys to snake_case in request data
    // Skip FormData objects as they can't be processed by snakecaseKeys
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = snakecaseKeys(config.data, { deep: true })
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
    // Convert snake_case keys to camelCase in response data
    if (response.data && typeof response.data === 'object') {
      response.data = camelcaseKeys(response.data, { deep: true })
      // Normalize enum values to lowercase for consistency
      response.data = normalizeEnumValues(response.data)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Don't retry auth endpoints to avoid infinite loop
    const authEndpoints = ['/api/auth/v1/refresh', '/api/auth/v1/login', '/api/auth/v1/register']
    if (originalRequest.url && authEndpoints.some(endpoint => originalRequest.url.includes(endpoint))) {
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

          // Try to refresh token - добавляем deviceId в body
          const { deviceId } = useDeviceStore.getState()
          const refreshResponse = await axios.post<any>(
            `${baseURL}api/auth/v1/refresh`,
            { device_id: deviceId }, // deviceId для валидации на backend (в snake_case)
            { withCredentials: true }
          )

          if (refreshResponse.data.success && refreshResponse.data.data) {
            const newToken = refreshResponse.data.data.token
            
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
            clearTokens()
            processQueue(error, null)
            isRefreshing = false
            window.location.href = '/login'
            reject(new Error(refreshResponse.data.message || 'Token refresh failed'))
          }
        } catch (refreshError: any) {
          // Refresh failed, clear tokens and redirect to login
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

    // Check for broken rules errors (400 status with JSON array)
    if (error.response && isBrokenRulesResponse(error.response)) {
      try {
        const brokenRules: BrokenRule[] = error.response.data
        const brokenRulesError = handleBrokenRulesError(brokenRules)

        return Promise.reject(brokenRulesError)
      } catch (parseError) {
        // If parsing fails, treat as regular error
        console.error('❌ Failed to parse broken rules:', parseError)
      }
    }

    return Promise.reject(error)
  }
)

export default http
