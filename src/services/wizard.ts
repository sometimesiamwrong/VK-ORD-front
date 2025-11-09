/**
 * Wizard Service
 *
 * Handles all API calls specific to the wizard flow:
 * - Party lookup (DaData integration)
 * - Contract creation
 * - Creative creation (with ERID generation)
 * - KKTU AI suggestions
 *
 * @example
 * ```ts
 * // Lookup party by INN
 * const party = await WizardService.lookupParty({ inn: '1234567890' })
 *
 * // Get KKTU suggestions
 * const suggestions = await WizardService.getKktuSuggestions({ text: 'Реклама нового автомобиля' })
 *
 * // Create creative and get ERID
 * const result = await WizardService.createCreative({
 *   externalId: 'creative-001',
 *   contractExternalIds: ['contract-001'],
 *   kktus: ['01.01.01.001'],
 *   type: 2 // TextGraphicBlock
 * })
 * console.log(result.erid) // ERID identifier
 * ```
 */

import http from '../api/http'
import type {
  DaDataPartyShortResponse,
  CreateContractRequest,
  CreateCreativeRequest,
  CreativeDto,
  GetKktyByTextResponseLegacy
} from '../types'

export interface LookupPartyParams {
  inn: string
}

export interface GetKktuSuggestionsParams {
  text: string
}

/**
 * Service class for wizard-specific API operations
 */
export class WizardService {
  // ============================================
  // PARTY OPERATIONS
  // ============================================

  /**
   * Lookup party information by INN using DaData
   *
   * @param params - INN to lookup
   * @returns Party information (name, type, address, etc.)
   *
   * @example
   * ```ts
   * const party = await WizardService.lookupParty({ inn: '7707083893' })
   * console.log(party.name) // Company name
   * console.log(party.type) // juridical | ip | physical
   * ```
   */
  static async lookupParty(params: LookupPartyParams): Promise<DaDataPartyShortResponse> {
    const response = await http.post<DaDataPartyShortResponse>('/api/client/v1/party', params)
    return response.data
  }

  // ============================================
  // CONTRACT OPERATIONS
  // ============================================

  /**
   * Create a new advertising contract
   *
   * @param params - Contract data
   *
   * @example
   * ```ts
   * await WizardService.createContract({
   *   apiCredentialPublicId: 'cred-123',
   *   externalId: 'contract-001',
   *   clientExternalId: '1234567890',
   *   contractorExternalId: '0987654321',
   *   serial: 'Д-2024-001',
   *   paySum: 100000,
   *   payDateEnd: '2024-12-31'
   * })
   * ```
   */
  static async createContract(params: CreateContractRequest): Promise<void> {
    // Backend использует PUT /api/contracts/v1/{externalId} для создания/обновления
    await http.put(`/api/contracts/v1/${params.externalId}`, params)
  }

  // ============================================
  // CREATIVE OPERATIONS
  // ============================================

  /**
   * Create a new creative and generate ERID
   *
   * @param params - Creative data
   * @returns Creative response with ERID
   *
   * @example
   * ```ts
   * const result = await WizardService.createCreative({
   *   apiCredentialPublicId: 'cred-123',
   *   externalId: 'creative-001',
   *   contractExternalIds: ['contract-001'],
   *   kktus: ['01.01.01.001'],
   *   type: 2, // TextGraphicBlock
   *   name: 'Summer sale creative',
   *   texts: ['Скидки до 50%!'],
   *   payType: 0 // CPM
   * })
   * console.log(result.data.erid) // ERID-2RaXXXXXXXX
   * ```
   */
  static async createCreative(params: CreateCreativeRequest): Promise<CreativeDto> {
    // Backend использует POST /api/creatives/v1 для создания
    const response = await http.post<CreativeDto>('/api/creatives/v1', params)
    return response.data
  }

  // ============================================
  // AI OPERATIONS
  // ============================================

  /**
   * Get KKTU (advertising category) suggestions using AI
   *
   * @param params - Creative text to analyze
   * @returns AI-generated KKTU suggestions with relevance scores
   *
   * @example
   * ```ts
   * const result = await WizardService.getKktuSuggestions({
   *   text: 'Реклама нового автомобиля Toyota Camry 2024'
   * })
   * result.kkty.forEach(suggestion => {
   *   console.log(suggestion.code) // e.g., '01.01.01.001'
   *   console.log(suggestion.fullName) // Category name
   *   console.log(suggestion.reason) // Why this category was suggested
   *   console.log(suggestion.relevanceScore) // 0-1 confidence score
   * })
   * ```
   */
  static async getKktuSuggestions(params: GetKktuSuggestionsParams): Promise<GetKktyByTextResponseLegacy> {
    const response = await http.post<GetKktyByTextResponseLegacy>('/api/ai/v1/get-kkty_by-text', params)
    return response.data
  }
}

export default WizardService
