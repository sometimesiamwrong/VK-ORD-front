import type { ApiResponse, CreateContractRequest, CreateContractResponse, CreateCreativeRequest, CreateCreativeResponse, DaDataPartyShortResponse, AiKktyResponse } from '../types'
import { loadFromCookie } from '../utils'

const DEFAULT_TIMEOUT_MS = 15000

export class ApiClient {
    private readonly baseUrl: string
    private readonly retries: number
    private token: string | null = null

    constructor(baseUrl = '', retries = 0) {
        this.baseUrl = baseUrl
        this.retries = retries
        // Попытка загрузить токен из localStorage при инициализации
        this.token = localStorage.getItem('auth_token')
        console.log('🚀 ApiClient initialized:', { baseUrl: this.baseUrl, retries: this.retries, hasToken: !!this.token })
    }

    private getVkHeaders(): Record<string, string> {
        const headers: Record<string, string> = {}

        const vkApiKey = loadFromCookie('vkord-api-key')
        if (vkApiKey) {
            headers['x-api-vk-key'] = vkApiKey
        }

        const useSandbox = loadFromCookie('vkord-use-sandbox') === 'true'
        headers['x-api-vk-route'] = useSandbox ? 'sandbox' : 'prod'

        console.log('🔑 VK headers:', headers)
        return headers
    }

    private getAuthHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`
        }

        // Add VK headers
        const vkHeaders = this.getVkHeaders()
        Object.assign(headers, vkHeaders)

        console.log('🔑 Auth headers:', headers)
        return headers
    }

    async authenticate(username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> {
        try {
            console.log('🔐 Attempting authentication with:', { username, password })
            const response = await fetch(`${this.baseUrl}/api/auth/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer your-super-secret-key-for-jwt-tokens-must-be-at-least-32-characters'
                },
                body: JSON.stringify({ username, password })
            })

            console.log('🔍 Auth response status:', response.status)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ Auth response error:', errorText)
                throw new Error(`HTTP ${response.status}: ${errorText}`)
            }

            const data = await response.json()
            console.log('📦 Auth response data:', data)

            // Backend возвращает токен в data.token
            const token = data.data?.token || data.token
            if (!token) {
                throw new Error('No token in response')
            }

            this.token = token
            localStorage.setItem('auth_token', this.token!)
            console.log('✅ Authentication successful, token saved')
            return { success: true, token: this.token! }
        } catch (error) {
            console.error('❌ Authentication failed:', error)
            return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' }
        }
    }

    logout(): void {
        this.token = null
        localStorage.removeItem('auth_token')
    }

    isAuthenticated(): boolean {
        return this.token !== null
    }

    private async ensureAuthenticated(): Promise<void> {
        if (this.isAuthenticated()) {
            console.log('✅ Already authenticated')
            return
        }

        console.log('🔄 Not authenticated, performing auto-login...')
        // Автоматическая аутентификация с дефолтными credentials
        const result = await this.authenticate('admin', 'password')
        if (!result.success) {
            console.error('💥 Auto-login failed:', result.error)
            throw new Error(`Authentication failed: ${result.error}`)
        }
        console.log('🎉 Auto-login successful')
    }

    private async fetchWithRetry<T>(input: RequestInfo, init?: RequestInit & { timeoutMs?: number }): Promise<T> {
        const attempts = this.retries + 1
        let lastError: unknown
        for (let attempt = 1; attempt <= attempts; attempt++) {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), init?.timeoutMs ?? DEFAULT_TIMEOUT_MS)
            try {
                const raw = typeof input === 'string' ? input : input.toString()
                const url = raw.startsWith('http') ? raw : `${this.baseUrl}${raw}`

                // Добавляем авторизационные заголовки к запросу
                const headers = { ...this.getAuthHeaders(), ...init?.headers }
                console.log(`🌐 API Request [${attempt}/${attempts}]:`, url, { headers, body: init?.body })

                const res = await fetch(url, { ...init, headers, signal: controller.signal })
                console.log(`📡 API Response [${attempt}/${attempts}]:`, res.status, res.statusText)

                clearTimeout(timeout)

                // Обработка 401 ошибки - пытаемся переавторизоваться
                if (res.status === 401 && this.token) {
                    console.warn('⚠️ Token expired, logging out')
                    // Токен истек, очищаем его
                    this.logout()
                    throw new Error('Token expired')
                }

                if (!res.ok) {
                    let errorMessage = `HTTP ${res.status}`
                    let errorCode: string | undefined
                    try {
                        const errorData = await res.json()
                        if (errorData?.message) {
                            errorMessage = errorData.message
                        } else if (errorData?.error) {
                            errorMessage = errorData.error
                        }
                        errorCode = errorData?.code
                    } catch {
                        // Если не удалось распарсить JSON, используем статус
                        errorMessage = `HTTP ${res.status} ${res.statusText || ''}`.trim()
                    }

                    // Вместо выбрасывания исключения, возвращаем ApiResponse с ошибкой
                    console.log('❌ API Error Response:', { success: false, message: errorMessage, code: errorCode })
                    return {
                        success: false,
                        message: errorMessage,
                        code: errorCode
                    } as T
                }
                const data = await res.json()
                console.log('✅ API Success:', data)
                return data as T
            } catch (e) {
                clearTimeout(timeout)
                console.error(`❌ API Error [${attempt}/${attempts}]:`, e)
                lastError = e
                if (attempt === attempts) break
                await new Promise(r => setTimeout(r, 300 * attempt))
            }
        }
        throw lastError
    }

    async partyLookup(inn: string): Promise<ApiResponse<DaDataPartyShortResponse>> {
        await this.ensureAuthenticated()
        return this.fetchWithRetry<ApiResponse<DaDataPartyShortResponse>>('/api/Client/party', {
            method: 'POST',
            body: JSON.stringify({ inn })
        })
    }

    async setCounterparty(inn: string, types: string[]): Promise<ApiResponse<unknown>> {
        await this.ensureAuthenticated()
        return this.fetchWithRetry<ApiResponse<unknown>>('/api/Client/set-counterparty', {
            method: 'POST',
            body: JSON.stringify({ inn, types })
        })
    }

    async createContract(payload: CreateContractRequest): Promise<ApiResponse<CreateContractResponse>> {
        await this.ensureAuthenticated()
        return this.fetchWithRetry<ApiResponse<CreateContractResponse>>('/api/Client/create_contract', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    }

    async createCreative(payload: CreateCreativeRequest): Promise<ApiResponse<CreateCreativeResponse>> {
        await this.ensureAuthenticated()
        return this.fetchWithRetry<ApiResponse<CreateCreativeResponse>>('/api/Client/create_creative', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    }

    async getCreative(externalId: string): Promise<ApiResponse<CreateCreativeResponse>> {
        await this.ensureAuthenticated()
        return this.fetchWithRetry<ApiResponse<CreateCreativeResponse>>(`/api/Creatives/${encodeURIComponent(externalId)}`)
    }

    async getCreativeStatus(externalId: string): Promise<ApiResponse<{ status: string }>> {
        await this.ensureAuthenticated()
        return this.fetchWithRetry<ApiResponse<{ status: string }>>(`/api/Creatives/${encodeURIComponent(externalId)}/status`)
    }

    async verifyCreative(externalId: string, maxWaitMinutes = 120): Promise<ApiResponse<CreateCreativeResponse>> {
        await this.ensureAuthenticated()
        const u = `/api/Creatives/${encodeURIComponent(externalId)}/verify?maxWaitMinutes=${encodeURIComponent(maxWaitMinutes.toString())}`
        return this.fetchWithRetry<ApiResponse<CreateCreativeResponse>>(u)
    }

    async getKktyByText(text: string): Promise<ApiResponse<AiKktyResponse>> {
        await this.ensureAuthenticated()
        return this.fetchWithRetry<ApiResponse<AiKktyResponse>>('/api/ai/get-kkty_by-text', {
            method: 'POST',
            body: JSON.stringify({ text })
        })
        /*await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
        
        return {
            success: true,
            data: {
                KKTY: [
                    {
                        code: "9.1.2",
                        reason: "Запрос 'ноутбук' относится к категории 'КОМПЬЮТЕРНАЯ ТЕХНИКА И ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ' (9), подкатегории 'КОМПЬЮТЕРЫ И ОРГТЕХНИКА' (9.1), и конкретно к элементу 'ПОРТАТИВНЫЕ КОМПЬЮТЕРЫ' (9.1.2)."
                    },
                    {
                        code: "9.1.3",
                        reason: "Запрос 'игровой контроллер' относится к категории 'КОМПЬЮТЕРНАЯ ТЕХНИКА И ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ' (9), подкатегории 'КОМПЬЮТЕРЫ И ОРГТЕХНИКА' (9.1), и может быть отнесен к 'КОМПЬЮТЕРНАЯ ПЕРИФЕРИЯ' (9.1.3)."
                    }
                ],
                matched_categories: [
                    {
                        main_category_id: "9",
                        main_category_name: "КОМПЬЮТЕРНАЯ ТЕХНИКА И ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ",
                        subcategory_id: "9.1",
                        subcategory_name: "КОМПЬЮТЕРЫ И ОРГТЕХНИКА",
                        matched_items_in_subcategory: [
                            "ПОРТАТИВНЫЕ КОМПЬЮТЕРЫ"
                        ]
                    },
                    {
                        main_category_id: "9",
                        main_category_name: "КОМПЬЮТЕРНАЯ ТЕХНИКА И ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ",
                        subcategory_id: "9.1",
                        subcategory_name: "КОМПЬЮТЕРЫ И ОРГТЕХНИКА",
                        matched_items_in_subcategory: [
                            "КОМПЬЮТЕРНАЯ ПЕРИФЕРИЯ"
                        ]
                    }
                ]
            }
        } as ApiResponse<AiKktyResponse>*/
    }
}

const BASE = (globalThis as any).__API_BASE__ ?? (import.meta as any).env?.VITE_API_BASE ?? ''
const RETRIES = Number((import.meta as any).env?.VITE_API_RETRIES ?? '0')
console.log('🌍 Environment variables:', { BASE, RETRIES, __API_BASE__: (globalThis as any).__API_BASE__ })
export const api = new ApiClient(BASE, Number.isFinite(RETRIES) ? RETRIES : 0)



