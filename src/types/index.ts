import type { CounterpartyItem } from './business'

// API types
export type T = {
    success: boolean
    message?: string
    timestamp?: string
    data?: T | null
    code?: string
}

export const DataSource = {
    Cache: 0,
    Api: 1,
    Mixed: 2
} as const

export type DataSource = typeof DataSource[keyof typeof DataSource]

// Page Request
export interface PageRequest {
    limit?: number
    offset?: number
}

// Broken Rules Error Handling
export interface BrokenRule {
    code: number
    message: string
    domain: string
}

// Broken Rules Error Response
export interface BrokenRulesError {
    rules: BrokenRule[]
    message?: string
}

// VK ORD Enums
export const VkOrdCreativeForm = {
    Banner: 0,
    TextBlock: 1,
    TextGraphicBlock: 2,
    Audio: 3,
    Video: 4,
    LiveAudio: 5,
    LiveVideo: 6,
    TextVideoBlock: 7,
    TextGraphicVideoBlock: 8,
    TextAudioBlock: 9,
    TextGraphicAudioBlock: 10,
    TextAudioVideoBlock: 11,
    TextGraphicAudioVideoBlock: 12,
    BannerHtml5: 13
} as const

export type VkOrdCreativeForm = typeof VkOrdCreativeForm[keyof typeof VkOrdCreativeForm]

export const VkOrdPayType = {
    Cpm: 0,
    Cpc: 1,
    Cpa: 2,
    Cpview: 3
} as const

export type VkOrdPayType = typeof VkOrdPayType[keyof typeof VkOrdPayType]

export const VkOrdPersonRoles = {
    Advertiser: 0,
    Agency: 1,
    Ors: 2,
    Publisher: 3
} as const

export type VkOrdPersonRoles = typeof VkOrdPersonRoles[keyof typeof VkOrdPersonRoles]

export const VkOrdContractType = {
    Advertising: 0,
    AdvertisingWithDistribution: 1,
    AdvertisingWithProduction: 2
} as const

export type VkOrdContractType = typeof VkOrdContractType[keyof typeof VkOrdContractType]

export const VkOrdActionType = {
    AdvertiserPays: 0,
    AgencyPays: 1,
    PublisherPays: 2,
    OrsPays: 3
} as const

export type VkOrdActionType = typeof VkOrdActionType[keyof typeof VkOrdActionType]

export const VkOrdSubjectType = {
    Advertising: 0,
    AdvertisingWithDistribution: 1,
    AdvertisingWithProduction: 2,
    AdvertisingWithDistributionAndProduction: 3,
    SocialAdvertising: 4
} as const

export type VkOrdSubjectType = typeof VkOrdSubjectType[keyof typeof VkOrdSubjectType]

export const VkOrdContractFlag = {
    IsActive: 0,
    IsArchived: 1,
    IsDeleted: 2,
    IsDraft: 3
} as const

export type VkOrdContractFlag = typeof VkOrdContractFlag[keyof typeof VkOrdContractFlag]

export const VkOrdCreativeFlag = {
    IsActive: 0,
    IsArchived: 1,
    IsDeleted: 2
} as const

export type VkOrdCreativeFlag = typeof VkOrdCreativeFlag[keyof typeof VkOrdCreativeFlag]

export const VkOrdPersonType = {
    Individual: 0,
    LegalEntity: 1,
    ForeignLegalEntity: 2,
    ForeignIndividual: 3,
    Branch: 4,
    RepresentativeOffice: 5
} as const

export type VkOrdPersonType = typeof VkOrdPersonType[keyof typeof VkOrdPersonType]

// Base interface for requests with VK ORD key
export interface IRequestWithVkOrdKey {
    apiCredentialPublicId: string
}

// DaData types
export interface DaDataFioShort {
    surname?: string | null
    name?: string | null
    patronic?: string | null
}

export interface DaDataNameShort {
    fullWithOpf?: string | null
    shortWithOpf?: string | null
    latin?: string | null
    full?: string | null
    short?: string | null
}

export interface DaDataOpfShort {
    type?: string | null
    code?: string | null
    full?: string | null
    short?: string | null
}

export interface DaDataPartyShortResponse {
    value?: string | null
    status?: string | null
    opf?: DaDataOpfShort | null
    name?: DaDataNameShort | null
    inn?: string | null
    ogrn?: string | null
    okpo?: string | null
    okato?: string | null
    oktmo?: string | null
    okogu?: string | null
    okfs?: string | null
    okved?: string | null
    fio?: DaDataFioShort | null
    type?: string | null
    phone?: string | null
    kpp?: string | null
    email?: string | null
}

// Contract types
export interface CreateContractRequest extends IRequestWithVkOrdKey {
    externalId: string
    clientExternalId: string
    contractorExternalId: string
    serial?: string | null
    paySum: number
    payDateEnd?: string | null
}

export interface ContractResponse {
    data?: VkOrdContract | null
    externalId?: string | null
}

export interface VkOrdContract {
    createDate?: string | null
    type?: VkOrdContractType
    clientExternalId?: string | null
    contractorExternalId?: string | null
    actionType?: VkOrdActionType
    subjectType?: VkOrdSubjectType
    date?: string | null
    dateEnd?: string | null
    serial?: string | null
    flags?: VkOrdContractFlag[] | null
    parentContractExternalId?: string | null
    amount?: string | null
    hasAdditionalContracts?: boolean
    cid?: string | null
    externalId?: string | null
    lockedFields?: any[] | null
}

// Creative types
export interface CreateCreativeRequest extends IRequestWithVkOrdKey {
    externalId: string
    contractExternalIds: string[]
    mediaExternalIds?: string[] | null
    kktus: string[]
    type: VkOrdCreativeForm
    targetUrls?: string[] | null
    texts?: string[] | null
    name?: string | null
    personExternalId?: string | null
    brand?: string | null
    category?: string | null
    description?: string | null
    payType: VkOrdPayType
    form?: string | null
    flags?: VkOrdCreativeFlag[] | null
}

export interface VkOrdCreativeV3RequestResponse {
    erid?: string | null
}

export interface VkOrdCreativeV3Response {
    erid?: string | null
    personExternalId?: string | null
    contractExternalIds?: string[] | null
    kktus?: string[] | null
    name?: string | null
    brand?: string | null
    category?: string | null
    description?: string | null
    payType?: VkOrdPayType
    form?: VkOrdCreativeForm
    targeting?: string | null
    targetUrls?: string[] | null
    texts?: string[] | null
    mediaExternalIds?: string[] | null
    flags?: VkOrdCreativeFlag[] | null
}

// AI KKTY types (legacy)
export interface GetKktyByTextRequestLegacy {
    text?: string | null
}

export interface KktyItem {
    code?: string | null
    reason?: string | null
    fullName?: string | null
    relevanceScore?: number
}

export interface MatchedCategory {
    mainCategoryId?: string | null
    mainCategoryName?: string | null
    subcategoryId?: string | null
    subcategoryName?: string | null
    matchedItemsInSubcategory?: string[] | null
}

export interface GetKktyByTextResponseLegacy {
    kkty?: KktyItem[] | null
    matchedCategories?: MatchedCategory[] | null
}

// Counterparty types
export interface CreateCounterpartyFromInnRequest extends IRequestWithVkOrdKey {
    inn: string
    types?: VkOrdPersonRoles[] | null
}

export interface GetCounterpartiesResponseDto {
    data?: VkOrdPersonResponse[] | null
    totalCount?: number
    totalItemsCount?: number
    limit?: number
}

export interface GetCounterpartyResponse {
    externalId?: string | null
    data?: VkOrdPersonResponse | null
}

export interface VkOrdPersonResponse {
    name?: string | null
    rsUrl?: string | null
    roles?: VkOrdPersonRoles[] | null
    juridicalDetails?: VkOrdPersonJuridicalDetails | null
}

export interface VkOrdPersonJuridicalDetails {
    type?: VkOrdPersonType
    modelScheme?: string | null
    inn?: string | null
    kpp?: string | null
    phone?: string | null
    foreignEpaymentMethod?: string | null
    foreignRegistrationNumber?: string | null
    foreignInn?: string | null
    foreignOksmCountryCode?: string | null
}

// Media types
export interface VkOrdMediaInfoResponse {
    filename?: string | null
    sha256?: string | null
    createDate?: string | null
    size?: number
    contentType?: string | null
    description?: string | null
}

export interface VkOrdMediaInfoListResponseDto {
    media?: VkOrdMediaInfoResponse[] | null
    totalCount?: number
    limit?: number
}

// Creatives list response
export interface GetCreativesResponse {
    data?: VkOrdCreativeV3Response[] | null
    totalCount?: number
    totalItemsCount?: number
    limit?: number
}

// Legacy types for backward compatibility
export type CreateContractResponse = {
    externalId: string
    success: boolean
    createdAt?: string
    errorMessage?: string | null
}

export type CreateCreativeResponse = {
    externalId?: string | null
    erid?: string | null
    success?: boolean
}

export type EridResult = {
    externalId: string
    erid: string
}

// AI KKTY by text response (legacy)
export type AiKktyItem = {
    code: string
    fullName: string
    reason: string
    relevanceScore: number
}

export type AiMatchedCategory = {
    main_category_id: string
    main_category_name: string
    subcategory_id: string
    subcategory_name: string
    matched_items_in_subcategory: string[]
}

export type AiKktyResponse = {
    kkty: AiKktyItem[]
    matchedCategories: AiMatchedCategory[]
}

// Statistics types
export interface ActStatisticsRequest {
    startDate: string
    endDate: string
    counterpartyInn?: string
    contractExternalId?: string
    creativeExternalId?: string
    maxResults?: number
}

export interface ActStatisticsItem {
    id: number
    externalId: string
    creativeExternalId: string
    padExternalId: string
    showsCount: number
    invoiceShowsCount: number
    amount: number
    amountPerEvent: number
    payType: string
    period: string
    statisticsType: string
    dateStartPlanned: string
    dateEndPlanned: string
    dateStartActual: string
    dateEndActual: string
    lastUpdated: string
    syncStatus: string
}

export interface GetActStatisticsResponse {
    statistics: ActStatisticsItem[]
    totalCount: number
    returnedCount: number
    totalAmount: number
    totalShows: number
}

// Contract DTO - supports both camelCase (after conversion) and snake_case (raw API)
// API returns snake_case, http.ts interceptor converts to camelCase automatically
export interface ContractDto {
    id: number
    externalId?: string
    type?: VkOrdContractType
    clientExternalId?: string
    contractorExternalId?: string
    parentContractExternalId?: string
    amount?: number | string
    lastUpdated?: string
    syncStatus?: string
    data?: {
        createDate?: string
        type?: string
        clientExternalId?: string
        contractorExternalId?: string
        subjectType?: string
        date?: string
        dateEnd?: string
        serial?: string
        flags?: string[]
        amount?: string
        hasAdditionalContracts?: boolean
        lockedFields?: any[]
        parentContractExternalId?: string
    }
}

// API Response: Contract details with nested parties, creatives, and additional contracts
// Note: API always returns snake_case, but http interceptor auto-converts to camelCase
export interface GetContractDetailsResponse {
    contract: ContractDto
    parties: CounterpartyItem[]
    creatives: CreativeDto[]
    additionalContracts?: ContractDto[]
    totalCreatives?: number
    returnedCreatives?: number
    syncStatus?: string
}

// Creative DTO - supports both flattened and wrapped responses the API may return
// API returns snake_case, http.ts interceptor converts to camelCase automatically
export interface CreativeDto {
    // Support both flattened and wrapped responses the API may return
    id?: number
    externalId?: string
    erid?: string
    personExternalId?: string
    name?: string
    brand?: string
    category?: string
    description?: string
    payType?: VkOrdPayType
    form?: VkOrdCreativeForm
    targeting?: string
    status?: string
    lastUpdated?: string
    syncStatus?: string

    // When the API returns a wrapper with `data` and metadata
    data?: {
        erid?: string
        form?: VkOrdCreativeForm | number
        name?: string
        brand?: string
        category?: string
        description?: string
        payType?: string | number
        targeting?: string
        targetUrls?: string[]
        texts?: string[]
        mediaExternalIds?: string[]
        kktus?: string[]
        flags?: string[]
        personExternalId?: string
        contractExternalIds?: string[]
    }

    // Optional metadata the details endpoint may include
    creativeMedia?: any[]
    creativeContracts?: any[]
    statistics?: any[]
    jsonData?: string
    dataHash?: string
    version?: number
    createdAt?: string
    updatedAt?: string
}


// Counterparty types (extended)
export interface CounterpartyDto {
    id: number
    externalId?: string
    updatedAt?: string
    createdAt?: string
    syncStatus?: string
    contractParties?: any[]
    data: {
        name: string
        roles: string[]
        juridicalDetails?: {
            type: string
            modelScheme?: string
            inn: string
            kpp?: string
            phone?: string
            foreignEpaymentMethod?: string
            foreignRegistrationNumber?: string
            foreignInn?: string
            foreignOksmCountryCode?: string
        }
    }
}

export interface GetCounterpartiesByInnResponse {
    counterparties: CounterpartyDto[]
    totalCount: number
    returnedCount: number
}

export interface GetCounterpartyContractsResponse {
    contracts: ContractDto[]
    totalCount: number
    returnedCount: number
}

export interface GetRelatedCounterpartiesResponse {
    relatedCounterparties: CounterpartyDto[]
    totalCount: number
    returnedCount: number
}

// Media types (extended)
export interface MediaUploadRequest {
    file: File
}

export interface GetMediaListResponse {
    media: VkOrdMediaInfoResponse[]
    totalCount: number
    totalItemsCount: number
    limit: number
}

// AI types (extended)
export interface GetKktyByTextRequest {
    text: string
}

export interface GetKktyByTextResponse {
    kkty: string[]
}

// DaData types (extended)
export interface DaDataPartyResponse {
    value: string
    status: string
    opf: {
        type: string
        code: string
        full: string
        short: string
    }
    name: {
        fullWithOpf: string
        shortWithOpf: string
        latin: string
        full: string
        short: string
    }
    inn: string
    ogrn: string
    okpo: string
    okato: string
    oktmo: string
    okogu: string
    okfs: string
    okved: string
    fio: {
        surname: string
        name: string
        patronymic: string
    }
    type: string
    phone: string
    kpp: string
    email: string
}

// Re-export all types
export * from './auth'
export * from './credentials'
export * from './business'
export * from './wizard'
export * from './acts'
export * from './flowTemplates'

// Re-export from organized structure (Phase 4 refactoring)
export * from './enums'
export * from './common'


