import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import http from '../api/http'
import { useTokenStore, useDeviceStore } from './tokenStore'
import { toast } from '../utils/toast'
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
      const response = await http.post<AuthResponse>('/api/Auth/login', {
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
        navigate('/dashboard')
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
      const response = await http.post<AuthResponse>('/api/Auth/register', data)
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
        navigate('/dashboard')
      } else {
        toast.error('Ошибка регистрации')
      }
    },
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const { clearTokens } = useTokenStore()

  return useMutation({
    mutationFn: async () => {
      const response = await http.post<null>('/api/Auth/logout')
      return response.data
    },
    onSuccess: () => {
      clearTokens()
      toast.success('Выход выполнен успешно')
      navigate('/login')
    },
    onError: () => {
      // Even if logout fails, clear local tokens
      clearTokens()
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
      // Если нет refresh token в куках, выбрасываем ошибку
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      const response = await http.post<AuthResponse>('/api/Auth/refresh', {})
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setAccessToken(data.token || '')
        // Обновляем refresh token, если сервер вернул новый
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken)
        }
      } else {
        navigate('/login')
      }
    },
    onError: () => {
      navigate('/login')
    },
  })
}

// User profile
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await http.get<UserProfileResponse>('/api/Users/me')
      return response.data
    },
  })
}

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const response = await http.patch<UserProfileResponse>('/api/Users/me', data)
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
