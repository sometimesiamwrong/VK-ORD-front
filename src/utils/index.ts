export function isValidInn(value: string): boolean {
    const digits = (value || '').replace(/\D/g, '')
    return digits.length === 10 || digits.length === 12
}

export function generateContractExternalId(date = new Date(), seq = 1): string {
    const yyyy = date.getFullYear().toString()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mi = String(date.getMinutes()).padStart(2, '0')
    return `ctr-${yyyy}${mm}${dd}-${hh}${mi}-${String(seq).padStart(3, '0')}`
}

export function nowTimestampString(): string {
    return Date.now().toString()
}

export function saveToLocalStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch {
        // ignore quota errors
    }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
        const raw = localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as T) : defaultValue
    } catch {
        return defaultValue
    }
}

export function isFirstTimeUser(key: string): boolean {
    try {
        return localStorage.getItem(key) === null
    } catch {
        return true
    }
}

export function getPartyDisplayName(name: unknown): string {
    if (name == null) return ''
    if (typeof name === 'string') return name
    if (typeof name === 'object') {
        const obj = name as Record<string, unknown>
        const fullWithOpf = obj['fullWithOpf'] as string | undefined
        const full = obj['full'] as string | undefined
        const shortWithOpf = obj['shortWithOpf'] as string | undefined
        const short = obj['short'] as string | undefined
        const value = obj['value'] as string | undefined
        return fullWithOpf || full || shortWithOpf || short || value || ''
    }
    return ''
}

export function getPartyShortWithOpf(name: unknown): string {
    if (name == null) return ''
    if (typeof name === 'string') return name
    if (typeof name === 'object') {
        const obj = name as Record<string, unknown>
        const shortWithOpf = obj['shortWithOpf'] as string | undefined
        const short = obj['short'] as string | undefined
        const value = obj['value'] as string | undefined
        return shortWithOpf || short || value || ''
    }
    return ''
}

export function saveToCookie(key: string, value: string, days = 30): void {
    try {
        const expires = new Date()
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
        document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`
    } catch {
        // ignore cookie errors
    }
}

export function loadFromCookie(key: string): string | null {
    try {
        const name = `${key}=`
        const decodedCookie = decodeURIComponent(document.cookie)
        const ca = decodedCookie.split(';')
        for (let c of ca) {
            c = c.trim()
            if (c.indexOf(name) === 0) {
                return c.substring(name.length)
            }
        }
        return null
    } catch {
        return null
    }
}

/**
 * Parse roles from backend format to wizard format
 * Backend returns: ["Publisher", "Agency", "Advertiser"]
 * Wizard expects: ["publisher", "agency", "advertiser"]
 * 
 * @param roles - Array of role strings from backend
 * @returns Normalized role array in lowercase
 * 
 * @example
 * ```ts
 * parseRoles(['Publisher', 'Agency']) // returns ['publisher', 'agency']
 * parseRoles(['ADVERTISER']) // returns ['advertiser']
 * parseRoles(undefined) // returns ['advertiser'] (default)
 * ```
 */
export function parseRoles(roles: string[] | undefined): ('advertiser' | 'agency' | 'ors' | 'publisher')[] {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return ['advertiser'] // Default fallback
  }
  
  return roles.map(role => role.toLowerCase()) as ('advertiser' | 'agency' | 'ors' | 'publisher')[]
}

// Экспорт новых утилит для работы с куками
export * from './cookies'

// Экспорт трансформеров для работы с DTO
export * from './transformers'

// Экспорт утилит для управления хранилищем
export * from './storage'

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function isMobileDevice(): boolean {
    try {
        const ua = (navigator && (navigator.userAgent || (navigator as any).vendor)) || ''
        const isTouch = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches
        const smallScreen = typeof window !== 'undefined' && window.innerWidth <= 640
        const byUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
        return Boolean(isTouch || smallScreen || byUa)
    } catch {
        return false
    }
}
