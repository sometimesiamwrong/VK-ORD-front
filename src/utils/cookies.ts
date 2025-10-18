/**
 * Утилиты для работы с куками
 */

interface CookieOptions {
  expires?: number | Date // Дни или конкретная дата
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

/**
 * Устанавливает куку
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  // Expires
  if (options.expires) {
    let expiresDate: Date
    if (typeof options.expires === 'number') {
      expiresDate = new Date()
      expiresDate.setTime(expiresDate.getTime() + options.expires * 24 * 60 * 60 * 1000)
    } else {
      expiresDate = options.expires
    }
    cookieString += `; expires=${expiresDate.toUTCString()}`
  }

  // Path
  cookieString += `; path=${options.path || '/'}`

  // Domain
  if (options.domain) {
    cookieString += `; domain=${options.domain}`
  }

  // Secure (только для HTTPS, кроме localhost в development)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const isDevelopment = import.meta.env.DEV

  if (options.secure && !isDevelopment) {
    cookieString += '; secure'
  } else if (window.location.protocol === 'https:' && !isLocalhost) {
    cookieString += '; secure'
  }

  // SameSite
  const sameSite = options.sameSite || 'Lax'
  cookieString += `; samesite=${sameSite}`

  document.cookie = cookieString
}

/**
 * Получает значение куки по имени
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${encodeURIComponent(name)}=`
  const cookies = document.cookie.split(';')

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.startsWith(nameEQ)) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return null
}

/**
 * Удаляет куку
 */
export const deleteCookie = (name: string, options: Omit<CookieOptions, 'expires'> = {}): void => {
  setCookie(name, '', {
    ...options,
    expires: new Date(0), // Устанавливаем дату в прошлое
  })
}

/**
 * Проверяет, существует ли кука
 */
export const hasCookie = (name: string): boolean => {
  return getCookie(name) !== null
}

/**
 * Очищает все куки приложения
 */
export const clearAllCookies = (): void => {
  const cookies = document.cookie.split(';')
  
  for (const cookie of cookies) {
    const [name] = cookie.split('=')
    deleteCookie(name.trim())
  }
}

