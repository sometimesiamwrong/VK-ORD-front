/**
 * Storage Management Utilities
 *
 * Provides centralized functions for managing browser storage:
 * - localStorage (Zustand persisted stores, wizard state)
 * - sessionStorage (access tokens)
 * - Cookies (refresh tokens, credentials)
 */

import { deleteCookie, getCookie } from './cookies'

/**
 * Cookie names used in the application
 */
const COOKIE_NAMES = {
  REFRESH_TOKEN: 'vk_ord_refresh_token',
  CREDENTIAL_ID: 'x-vkord-credential-id',
  // Add other cookie names here as they are discovered
} as const

/**
 * localStorage keys used by Zustand persist middleware
 */
const LOCAL_STORAGE_KEYS = {
  TOKEN_STORAGE: 'token-storage',
  DEVICE_STORAGE: 'device-storage',
  ENVIRONMENT_STORAGE: 'environment-storage',
  // Add other localStorage keys here as they are discovered
} as const

/**
 * Clear all application cookies
 * Removes all known cookies used by the application
 */
export const clearAllCookies = (): void => {
  // Delete known cookies
  Object.values(COOKIE_NAMES).forEach(cookieName => {
    deleteCookie(cookieName)
  })

  // Also try to delete all cookies from document.cookie
  // This is a fallback to catch any cookies we might have missed
  const cookies = document.cookie.split(';')
  cookies.forEach(cookie => {
    const [name] = cookie.split('=')
    if (name) {
      deleteCookie(name.trim())
    }
  })
}

/**
 * Clear all localStorage data
 * Removes all data stored by the application in localStorage
 */
export const clearLocalStorage = (): void => {
  try {
    // Clear specific known keys
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })

    // Optional: Clear ALL localStorage (more aggressive approach)
    // Uncomment if you want to remove everything
    // localStorage.clear()
  } catch (error) {
    console.error('Failed to clear localStorage:', error)
  }
}

/**
 * Clear all sessionStorage data
 * Removes all data stored by the application in sessionStorage
 */
export const clearSessionStorage = (): void => {
  try {
    sessionStorage.clear()
  } catch (error) {
    console.error('Failed to clear sessionStorage:', error)
  }
}

/**
 * Clear ALL browser storage data
 *
 * This function removes:
 * - All cookies (refresh tokens, credential IDs, etc.)
 * - All localStorage data (Zustand persisted stores, wizard state, etc.)
 * - All sessionStorage data (access tokens, temporary data)
 *
 * Use this function when user logs out to ensure complete cleanup
 *
 * @example
 * ```ts
 * // In logout handler
 * clearAllStorageData()
 * navigate('/login')
 * ```
 */
export const clearAllStorageData = (): void => {
  clearAllCookies()
  clearLocalStorage()
  clearSessionStorage()

  console.log('🧹 All browser storage data cleared (cookies, localStorage, sessionStorage)')
}

/**
 * Get all current cookies for debugging
 * @returns Object with cookie names as keys and values
 */
export const getAllCookies = (): Record<string, string> => {
  const cookies: Record<string, string> = {}
  const cookieStrings = document.cookie.split(';')

  cookieStrings.forEach(cookie => {
    const [name, value] = cookie.split('=')
    if (name && value) {
      cookies[name.trim()] = decodeURIComponent(value.trim())
    }
  })

  return cookies
}

/**
 * Check if user has any stored data (for debugging)
 * @returns Object indicating what data exists
 */
export const checkStoredData = (): {
  hasCookies: boolean
  hasLocalStorage: boolean
  hasSessionStorage: boolean
  cookieCount: number
  localStorageKeys: string[]
  sessionStorageKeys: string[]
} => {
  const cookies = getAllCookies()
  const localStorageKeys = Object.keys(localStorage)
  const sessionStorageKeys = Object.keys(sessionStorage)

  return {
    hasCookies: Object.keys(cookies).length > 0,
    hasLocalStorage: localStorageKeys.length > 0,
    hasSessionStorage: sessionStorageKeys.length > 0,
    cookieCount: Object.keys(cookies).length,
    localStorageKeys,
    sessionStorageKeys,
  }
}
