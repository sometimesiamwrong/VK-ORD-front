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
  ContractDto,
  CounterpartyDto,
  CounterpartyItem,
  CreativeDto,
  GetContractDetailsResponse,
  GetCounterpartyContractsResponse,
  GetCounterpartiesByInnResponse,
  CreateContractRequest,
  VkOrdCreativeForm,
  VkOrdPayType
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

type ContractDetailsRawContract = Partial<ContractDto> & Record<string, any>
type ContractDetailsRawCreative = Partial<CreativeDto> & Record<string, any>

type ContractDetailsRawResponse = {
  contract?: ContractDetailsRawContract
  parties?: CounterpartyDto[]
  creatives?: ContractDetailsRawCreative[]
  additionalContracts?: ContractDetailsRawContract[]
  totalCreatives?: number
  returnedCreatives?: number
  syncStatus?: string
}

const mapCounterpartyDtoToItem = (dto: CounterpartyDto): CounterpartyItem => {
  const details = dto.data?.juridicalDetails

  return {
    id: dto.id,
    externalId: dto.externalId,
    name: dto.data?.name ?? '',
    roles: dto.data?.roles ?? [],
    juridicalDetails: details
      ? {
          type: details.type,
          modelScheme: details.modelScheme,
          inn: details.inn,
          kpp: details.kpp,
          phone: details.phone,
          foreignEpaymentMethod: details.foreignEpaymentMethod,
          foreignRegistrationNumber: details.foreignRegistrationNumber,
          foreignInn: details.foreignInn,
          foreignOksmCountryCode: details.foreignOksmCountryCode
        }
      : undefined,
    syncStatus: dto.syncStatus,
    updatedAt: dto.updatedAt,
    createdAt: dto.createdAt
  }
}

const normalizeContract = (
  contract: ContractDetailsRawContract | undefined,
  fallbackExternalId?: string
): ContractDto => {
  const raw = contract ?? {}
  const rawData = (raw.data ?? {}) as Record<string, any>

  const mergedData: ContractDto['data'] = {
    ...rawData,
    createDate: rawData.createDate ?? raw.createDate,
    type: rawData.type ?? raw.type,
    clientExternalId: rawData.clientExternalId ?? raw.clientExternalId,
    contractorExternalId: rawData.contractorExternalId ?? raw.contractorExternalId,
    subjectType: rawData.subjectType ?? raw.subjectType,
    date: rawData.date ?? raw.date,
    dateEnd: rawData.dateEnd ?? raw.dateEnd,
    serial: rawData.serial ?? raw.serial,
    flags: rawData.flags ?? raw.flags,
    amount: rawData.amount ?? raw.amount,
    hasAdditionalContracts: rawData.hasAdditionalContracts ?? raw.hasAdditionalContracts,
    lockedFields: rawData.lockedFields ?? raw.lockedFields,
    parentContractExternalId: rawData.parentContractExternalId ?? raw.parentContractExternalId
  }

  const externalId = raw.externalId ?? (rawData.externalId as string | undefined) ?? fallbackExternalId

  return {
    id: typeof raw.id === 'number' ? raw.id : 0,
    externalId,
    type: typeof raw.type === 'number' ? raw.type : undefined,
    clientExternalId: typeof raw.clientExternalId === 'string' ? raw.clientExternalId : mergedData?.clientExternalId,
    contractorExternalId: typeof raw.contractorExternalId === 'string' ? raw.contractorExternalId : mergedData?.contractorExternalId,
    parentContractExternalId:
      typeof raw.parentContractExternalId === 'string'
        ? raw.parentContractExternalId
        : mergedData?.parentContractExternalId,
    amount: raw.amount ?? mergedData?.amount,
    data: mergedData
  }
}

const normalizeCreative = (
  creative: ContractDetailsRawCreative,
  fallbackContractExternalId: string
): CreativeDto => {
  const rawData = (creative.data ?? {}) as Record<string, any>

  const mergedData: CreativeDto['data'] = {
    ...rawData,
    erid: rawData.erid ?? creative.erid,
    form: rawData.form ?? creative.form,
    name: rawData.name ?? creative.name,
    brand: rawData.brand ?? creative.brand,
    category: rawData.category ?? creative.category,
    description: rawData.description ?? creative.description,
    payType: rawData.payType ?? creative.payType,
    targeting: rawData.targeting ?? creative.targeting,
    targetUrls: rawData.targetUrls ?? creative.targetUrls,
    texts: rawData.texts ?? creative.texts,
    mediaExternalIds: rawData.mediaExternalIds ?? creative.mediaExternalIds,
    kktus: rawData.kktus ?? creative.kktus,
    flags: rawData.flags ?? creative.flags,
    personExternalId: rawData.personExternalId ?? creative.personExternalId,
    contractExternalIds: rawData.contractExternalIds ?? creative.contractExternalIds
  }

  if (!mergedData?.contractExternalIds || mergedData.contractExternalIds.length === 0) {
    mergedData.contractExternalIds = fallbackContractExternalId ? [fallbackContractExternalId] : undefined
  }

  const asVkOrdPayType = (value: unknown): VkOrdPayType | undefined => {
    return typeof value === 'number' ? (value as VkOrdPayType) : undefined
  }

  const asVkOrdCreativeForm = (value: unknown): VkOrdCreativeForm | undefined => {
    return typeof value === 'number' ? (value as VkOrdCreativeForm) : undefined
  }

  const creativeContracts = Array.isArray(creative.creativeContracts)
    ? creative.creativeContracts.map(contractLink => ({
        ...contractLink,
        contract: normalizeContract(
          contractLink.contract,
          contractLink.contract?.externalId ?? mergedData.contractExternalIds?.[0] ?? fallbackContractExternalId
        )
      }))
    : []

  return {
    id: typeof creative.id === 'number' ? creative.id : undefined,
    externalId: typeof creative.externalId === 'string' ? creative.externalId : undefined,
    erid: typeof creative.erid === 'string' ? creative.erid : (mergedData?.erid as string | undefined),
    personExternalId:
      typeof creative.personExternalId === 'string'
        ? creative.personExternalId
        : (mergedData?.personExternalId as string | undefined),
    name: typeof creative.name === 'string' ? creative.name : (mergedData?.name as string | undefined),
    brand: typeof creative.brand === 'string' ? creative.brand : (mergedData?.brand as string | undefined),
    category: typeof creative.category === 'string' ? creative.category : (mergedData?.category as string | undefined),
    description:
      typeof creative.description === 'string'
        ? creative.description
        : (mergedData?.description as string | undefined),
    payType: asVkOrdPayType(creative.payType) ?? asVkOrdPayType(mergedData?.payType),
    form: asVkOrdCreativeForm(creative.form) ?? asVkOrdCreativeForm(mergedData?.form),
    targeting:
      typeof creative.targeting === 'string'
        ? creative.targeting
        : (mergedData?.targeting as string | undefined),
    status: typeof creative.status === 'string' ? creative.status : creative.syncStatus,
    lastUpdated: creative.lastUpdated,
    syncStatus: creative.syncStatus,
    creativeMedia: Array.isArray(creative.creativeMedia) ? creative.creativeMedia : [],
    creativeContracts,
    statistics: Array.isArray(creative.statistics) ? creative.statistics : [],
    createdAt: creative.createdAt,
    updatedAt: creative.updatedAt,
    data: mergedData
  }
}

const normalizeContractDetailsResponse = (
  payload: ContractDetailsRawResponse,
  requestedExternalId: string
): GetContractDetailsResponse => {
  const normalizedContract = normalizeContract(payload.contract, requestedExternalId)
  const parties = (payload.parties ?? []).map(mapCounterpartyDtoToItem)
  const creatives = (payload.creatives ?? []).map(raw =>
    normalizeCreative(raw, normalizedContract.externalId ?? requestedExternalId)
  )
  const additionalContracts = (payload.additionalContracts ?? []).map(raw =>
    normalizeContract(raw, raw?.externalId ?? requestedExternalId)
  )

  return {
    contract: normalizedContract,
    parties,
    creatives,
    additionalContracts,
    totalCreatives: payload.totalCreatives ?? creatives.length,
    returnedCreatives: payload.returnedCreatives ?? creatives.length,
    syncStatus: payload.syncStatus
  }
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
    const response = await http.get<ContractDetailsRawResponse>(`/api/contracts/v1/${externalId}/details`)
    return normalizeContractDetailsResponse(response.data, externalId)
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
    const firstPartyExternalId = firstParty.externalId

    // Get contracts list for first party
    const firstPartyContractsResponse = await http.get<GetCounterpartyContractsResponse>(`/api/counterparties/v1/${firstPartyExternalId}/contracts`)
    const firstPartyContracts = firstPartyContractsResponse.data.contracts || []

    // Get second party info to obtain external ID
    const secondPartyResponse = await http.get<GetCounterpartiesByInnResponse>(`/api/counterparties/v1/by-inn/${secondPartyInn}`)
    if (!secondPartyResponse.data.counterparties || secondPartyResponse.data.counterparties.length === 0) {
      return []
    }

    const secondParty = secondPartyResponse.data.counterparties[0]
    const secondPartyExternalId = secondParty.externalId

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




