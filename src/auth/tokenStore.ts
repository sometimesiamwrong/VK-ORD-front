import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setCookie, getCookie, deleteCookie } from '../utils/cookies'

// Cookie names
const REFRESH_TOKEN_COOKIE = 'vk_ord_refresh_token'
const REFRESH_TOKEN_EXPIRY_DAYS = 30 // 30 дней

interface TokenState {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  getRefreshToken: () => string | null
  clearTokens: () => void
}

// Store for tokens
export const useTokenStore = create<TokenState>((set) => ({
  accessToken: null,
  
  // Access token хранится в памяти
  setAccessToken: (token) => set({ accessToken: token }),
  
  // Refresh token хранится в куках
  setRefreshToken: (token) => {
    if (token) {
      setCookie(REFRESH_TOKEN_COOKIE, token, {
        expires: REFRESH_TOKEN_EXPIRY_DAYS,
        secure: true,
        sameSite: 'Strict',
      })
    } else {
      deleteCookie(REFRESH_TOKEN_COOKIE)
    }
  },
  
  getRefreshToken: () => {
    return getCookie(REFRESH_TOKEN_COOKIE)
  },
  
  clearTokens: () => {
    set({ accessToken: null })
    deleteCookie(REFRESH_TOKEN_COOKIE)
  },
}))

// Device ID store (persisted in localStorage)
interface DeviceState {
  deviceId: string | null
  setDeviceId: (deviceId: string) => void
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set) => ({
      deviceId: null,
      setDeviceId: (deviceId) => set({ deviceId }),
    }),
    {
      name: 'device-storage',
    }
  )
)

// Environment store
interface EnvironmentState {
  environment: 'sandbox' | 'prod'
  setEnvironment: (env: 'sandbox' | 'prod') => void
}

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set) => ({
      environment: 'sandbox',
      setEnvironment: (env) => set({ environment: env }),
    }),
    {
      name: 'environment-storage',
    }
  )
)



