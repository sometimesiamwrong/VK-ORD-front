import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import http from '../api/http'
import { useTokenStore, useDeviceStore } from './tokenStore'
import { toast } from 'sonner'
import { promptCredentialSelection } from '@/stores/credentialModalStore'
import { clearAllStorageData } from '../utils/storage'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfileResponse,
  UpdateUserRequest
} from '../types'

// Generate device ID if not exists
const getDeviceId = () => {
  const { deviceId, setDeviceId } = useDeviceStore.getState()
  if (!deviceId) {
    const newDeviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setDeviceId(newDeviceId)
    return newDeviceId
  }
  return deviceId
}

// Auth mutations
export const useLogin = () => {
  const navigate = useNavigate()
  const { setAccessToken, setRefreshToken } = useTokenStore()

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const deviceId = getDeviceId()
      const response = await http.post<AuthResponse>('/api/auth/v1/login', {
        ...data,
        deviceId
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setAccessToken(data.token || '')
        // Сохраняем refresh token в куках, если он есть в ответе
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken)
        }
          toast.success('Вход выполнен успешно')
          // Prompt user to select API key if not selected
          setTimeout(() => {
            try {
              promptCredentialSelection()
            } catch (e) {
              console.warn('promptCredentialSelection failed', e)
            }
          }, 50)
        navigate('/wizard')
      } else {
        toast.error('Ошибка входа')
      }
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  const { setAccessToken, setRefreshToken } = useTokenStore()

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await http.post<AuthResponse>('/api/auth/v1/register', data)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setAccessToken(data.token || '')
        // Сохраняем refresh token в куках, если он есть в ответе
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken)
        }
            toast.success('Регистрация выполнена успешно')
            // Prompt user to select API key if not selected
            setTimeout(() => {
              try {
                promptCredentialSelection()
              } catch (e) {
                console.warn('promptCredentialSelection failed', e)
              }
            }, 50)
        navigate('/wizard')
      } else {
        toast.error('Ошибка регистрации')
      }
    },
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { clearTokens } = useTokenStore()

  return useMutation({
    mutationFn: async () => {
      const response = await http.post<null>('/api/auth/v1/logout')
      return response.data
    },
    onSuccess: () => {
      // 1. Clear Zustand tokens
      clearTokens()

      // 2. Clear React Query cache (all cached queries)
      queryClient.clear()

      // 3. Clear all browser storage (cookies, localStorage, sessionStorage)
      clearAllStorageData()

      toast.success('Выход выполнен успешно')
      navigate('/login')
    },
    onError: () => {
      // Even if logout fails on server, clear everything locally
      clearTokens()
      queryClient.clear()
      clearAllStorageData()

      navigate('/login')
    },
  })
}

// Auto-refresh on app start
export const useAutoRefresh = () => {
 const navigate = useNavigate()
  const { setAccessToken, setRefreshToken, getRefreshToken } = useTokenStore()

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken()
      console.log('useAutoRefresh: Attempting to refresh token, refreshToken exists:', !!refreshToken);
      // Если нет refresh token в куках, выбрасываем ошибку
      if (!refreshToken) {
        console.log('useAutoRefresh: No refresh token available');
        throw new Error('No refresh token available')
      }

      // Добавляем deviceId в refresh запрос
      const deviceId = getDeviceId()
      const response = await http.post<AuthResponse>('/api/auth/v1/refresh', { deviceId })
      console.log('useAutoRefresh: Refresh response received:', response.data);
      return response.data
    },
    onSuccess: (data) => {
      console.log('useAutoRefresh: Refresh success, data:', data);
      if (data) {
        setAccessToken(data.token || '')
        // Обновляем refresh token, если сервер вернул новый
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken)
        }
        // When refresh succeeded, check selected credential (open modal if missing)
        setTimeout(() => {
          try {
            promptCredentialSelection()
          } catch (e) {
            console.warn('promptCredentialSelection failed', e)
          }
        }, 50)
      } else {
        console.log('useAutoRefresh: No data in response, navigating to login');
        navigate('/login')
      }
    },
    onError: (error) => {
      console.log('useAutoRefresh: Refresh error, navigating to login', error);
      navigate('/login')
    },
  })
}

// User profile
export const useUserProfile = () => {
  return useQuery<UserProfileResponse | undefined>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        console.log('useUserProfile: Fetching user profile');
        const response = await http.get<UserProfileResponse>('/api/users/v1/me')
        console.log('useUserProfile: User profile response:', response.data);
        return response.data
      } catch (error) {
        console.log('useUserProfile: Error fetching user profile:', error);
        throw error
      }
    }
 })
}

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const response = await http.patch<UserProfileResponse>('/api/users/v1/me', data)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        toast.success('Профиль обновлен успешно')
      }
    },
  })
}

// Auth state hook
export const useAuth = () => {
  const { accessToken } = useTokenStore()
  const isAuthenticated = !!accessToken
  console.log('useAuth: accessToken exists:', !!accessToken, 'isAuthenticated:', isAuthenticated);

  return {
    isAuthenticated,
    accessToken,
  }
}

// Require auth hook (redirects to login if not authenticated)
export const useRequireAuth = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    navigate('/login')
  }

  return isAuthenticated
}

// Token verification hook (for secure access)
export const useImpersonate = () => {
  const navigate = useNavigate()
  const { setAccessToken, setRefreshToken } = useTokenStore()

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await http.get<AuthResponse>(`/api/debug/v1/impersonate?token=${token}`)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setAccessToken(data.token || '')
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken)
        }
        toast.success('Вход выполнен успешно')
        // Prompt user to select API key if not selected
        setTimeout(() => {
          try {
            promptCredentialSelection()
          } catch (e) {
            console.warn('promptCredentialSelection failed', e)
          }
        }, 50)
        navigate('/wizard')
      } else {
        toast.error('Ошибка входа')
        navigate('/login')
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Ошибка входа')
      navigate('/login')
    },
  })
}
