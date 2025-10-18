/**
 * Contracts Service
 *
 * Handles all API calls related to contracts (договоры).
 * Provides methods for querying, creating, and managing advertising contracts.
 *
 * @example
 * ```ts
 * // Get contract details
 * const contract = await ContractsService.getDetails('contract-123')
 *
 * // Create contract
 * await ContractsService.create({
 *   externalId: 'contract-123',
 *   clientExternalId: 'advertiser-external-id',
 *   contractorExternalId: 'publisher-external-id',
 *   paySum: 100000,
 *   payDateEnd: '2024-12-31'
 * })
 * ```
 */

import http from '../api/http'
import type {
  GetContractDetailsResponse,
  GetCounterpartyContractsResponse,
  GetCounterpartiesByInnResponse,
  CreateContractRequest
} from '../types'

export interface GetContractsListParams {
  limit?: number
  offset?: number
}

export interface GetContractsListResponse {
  data: GetContractDetailsResponse[]
  total_count: number
  limit: number
}

export interface UpdateContractParams {
  externalId: string
  data: Partial<CreateContractRequest>
}

/**
 * Service class for contract-related API operations
 */
export class ContractsService {
  // ============================================
  // QUERIES - Read operations
  // ============================================

  /**
   * Get contract details with creatives
   *
   * @param externalId - Contract external identifier
   * @returns Contract details including associated creatives
   *
   * @example
   * ```ts
   * const contract = await ContractsService.getDetails('contract-123')
   * console.log(contract.creatives) // Array of creatives
   * ```
   */
  static async getDetails(externalId: string): Promise<GetContractDetailsResponse> {
    const response = await http.get<GetContractDetailsResponse>(`/api/contracts/v1/${externalId}/details`)
    return response.data
  }

  /**
   * Find contracts between two parties by their INN
   *
   * @param firstPartyInn - First party INN
   * @param secondPartyInn - Second party INN
   * @returns Array of contracts between the two parties
   *
   * @example
   * ```ts
   * const contracts = await ContractsService.getBetween('1234567890', '0987654321')
   * ```
   */
  static async getBetween(firstPartyInn: string, secondPartyInn: string): Promise<GetContractDetailsResponse[]> {
    // Get first party info to obtain external ID
    const firstPartyResponse = await http.get<GetCounterpartiesByInnResponse>(`/api/counterparties/v1/by-inn/${firstPartyInn}`)
    if (!firstPartyResponse.data.counterparties || firstPartyResponse.data.counterparties.length === 0) {
      return []
    }

    const firstParty = firstPartyResponse.data.counterparties[0]
    const firstPartyExternalId = firstParty.externalId || firstParty.external_id

    // Get contracts list for first party
    const firstPartyContractsResponse = await http.get<GetCounterpartyContractsResponse>(`/api/counterparties/v1/${firstPartyExternalId}/contracts`)
    const firstPartyContracts = firstPartyContractsResponse.data.contracts || []

    // Get second party info to obtain external ID
    const secondPartyResponse = await http.get<GetCounterpartiesByInnResponse>(`/api/counterparties/v1/by-inn/${secondPartyInn}`)
    if (!secondPartyResponse.data.counterparties || secondPartyResponse.data.counterparties.length === 0) {
      return []
    }

    const secondParty = secondPartyResponse.data.counterparties[0]
    const secondPartyExternalId = secondParty.externalId || secondParty.external_id

    // Filter contracts where second party is involved
    const contractsBetween = firstPartyContracts.filter((contract: any) => {
      return (contract.clientExternalId === secondPartyExternalId || contract.contractorExternalId === secondPartyExternalId)
    })

    // If found, fetch details for each contract
    if (contractsBetween.length > 0) {
      const contractDetailsPromises = contractsBetween.map((contract: any) =>
        http.get<GetContractDetailsResponse>(`/api/contracts/v1/${contract.externalId}/details`)
      )
      const results = await Promise.all(contractDetailsPromises)
      return results.map((result: any) => result.data)
    }

    return []
  }

  // ============================================
  // MUTATIONS - Write operations
  // ============================================

  /**
   * Create a new contract in VK ORD
   *
   * @param params - Contract data
   * @returns Created contract data
   *
   * @example
   * ```ts
   * await ContractsService.create({
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
  static async create(params: CreateContractRequest): Promise<void> {
    // Backend использует PUT /api/contracts/v1/{externalId} для создания/обновления
    await http.put(`/api/contracts/v1/${params.externalId}`, params)
  }

  /**
   * Update contract data
   *
   * @param params - External ID and updated data
   * @returns Updated contract
   */
  static async update(params: UpdateContractParams): Promise<GetContractDetailsResponse> {
    const { externalId, data } = params
    const response = await http.put<GetContractDetailsResponse>(`/api/contracts/v1/${externalId}`, data)
    return response.data
  }

  /**
   * Delete contract
   *
   * @param externalId - Contract external ID
   */
  static async delete(externalId: string): Promise<void> {
    await http.delete(`/api/contracts/v1/${externalId}`)
  }

  // ============================================
  // LEGACY ALIASES (for backward compatibility)
  // ============================================

  /**
   * @deprecated Use `getDetails` instead
   */
  static async getContractDetails(contractExternalId: string) {
    return this.getDetails(contractExternalId)
  }

  /**
   * @deprecated Use `getBetween` instead
   */
  static async getContractBetween(firstPartyInn: string, secondPartyInn: string) {
    return this.getBetween(firstPartyInn, secondPartyInn)
  }
}

export default ContractsService




