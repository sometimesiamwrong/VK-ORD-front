import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import http from '../api/http'
import { useTokenStore, useDeviceStore } from './tokenStore'
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserProfile,
  UpdateUserRequest,
  ApiResponse
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
      const response = await http.post<ApiResponse<AuthResponse>>('/api/auth/login', {
        ...data,
        deviceId
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAccessToken(data.data.token)
        // Сохраняем refresh token в куках, если он есть в ответе
        if (data.data.refreshToken) {
          setRefreshToken(data.data.refreshToken)
        }
        toast.success('Вход выполнен успешно')
        navigate('/dashboard')
      } else {
        toast.error(data.message || 'Ошибка входа')
      }
    },
  })
}

export const useRegister = () => {
  const navigate = useNavigate()
  const { setAccessToken, setRefreshToken } = useTokenStore()

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await http.post<ApiResponse<AuthResponse>>('/api/auth/register', data)
      return response.data
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAccessToken(data.data.token)
        // Сохраняем refresh token в куках, если он есть в ответе
        if (data.data.refreshToken) {
          setRefreshToken(data.data.refreshToken)
        }
        toast.success('Регистрация выполнена успешно')
        navigate('/dashboard')
      } else {
        toast.error(data.message || 'Ошибка регистрации')
      }
    },
  })
}

export const useLogout = () => {
  const navigate = useNavigate()
  const { clearTokens } = useTokenStore()

  return useMutation({
    mutationFn: async () => {
      const response = await http.post<ApiResponse<null>>('/api/auth/logout')
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
      
      const response = await http.post<ApiResponse<AuthResponse>>('/api/auth/refresh', {})
      return response.data
    },
    onSuccess: (data) => {
      if (data.success && data.data) {
        setAccessToken(data.data.token)
        // Обновляем refresh token, если сервер вернул новый
        if (data.data.refreshToken) {
          setRefreshToken(data.data.refreshToken)
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
      const response = await http.get<ApiResponse<UserProfile>>('/api/users/me')
      if (response.data.success) {
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to fetch user profile')
    },
  })
}

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const response = await http.patch<ApiResponse<UserProfile>>('/api/users/me', data)
      return response.data
    },
    onSuccess: (data) => {
      if (data.success) {
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
