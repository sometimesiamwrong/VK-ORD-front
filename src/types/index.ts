// API types
export type T = {
    success: boolean
    message?: string
    timestamp?: string
    data?: T | null
    code?: string
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
export enum VkOrdCreativeForm {
    Banner = 0,
    TextBlock = 1,
    TextGraphicBlock = 2,
    Audio = 3,
    Video = 4,
    LiveAudio = 5,
    LiveVideo = 6,
    TextVideoBlock = 7,
    TextGraphicVideoBlock = 8,
    TextAudioBlock = 9,
    TextGraphicAudioBlock = 10,
    TextAudioVideoBlock = 11,
    TextGraphicAudioVideoBlock = 12,
    BannerHtml5 = 13
}

export enum VkOrdPayType {
    Cpm = 0,
    Cpc = 1,
    Cpa = 2,
    Cpview = 3
}

export enum VkOrdPersonRoles {
    Advertiser = 0,
    Agency = 1,
    Ors = 2,
    Publisher = 3
}

export enum VkOrdContractType {
    Advertising = 0,
    AdvertisingWithDistribution = 1,
    AdvertisingWithProduction = 2
}

export enum VkOrdActionType {
    AdvertiserPays = 0,
    AgencyPays = 1,
    PublisherPays = 2,
    OrsPays = 3
}

export enum VkOrdSubjectType {
    Advertising = 0,
    AdvertisingWithDistribution = 1,
    AdvertisingWithProduction = 2,
    AdvertisingWithDistributionAndProduction = 3,
    SocialAdvertising = 4
}

export enum VkOrdContractFlag {
    IsActive = 0,
    IsArchived = 1,
    IsDeleted = 2,
    IsDraft = 3
}

export enum VkOrdCreativeFlag {
    IsActive = 0,
    IsArchived = 1,
    IsDeleted = 2
}

export enum VkOrdPersonType {
    Individual = 0,
    LegalEntity = 1,
    ForeignLegalEntity = 2,
    ForeignIndividual = 3,
    Branch = 4,
    RepresentativeOffice = 5
}

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
    paySum: number
    payDateEnd?: string | null
}

export interface ContractResponse {
    data?: VkOrdContract | null
    externalId?: string | null
}

export interface VkOrdContract {
    create_date?: string | null
    type?: VkOrdContractType
    client_external_id?: string | null
    contractor_external_id?: string | null
    action_type?: VkOrdActionType
    subject_type?: VkOrdSubjectType
    date?: string | null
    date_end?: string | null
    serial?: string | null
    flags?: VkOrdContractFlag[] | null
    parent_contract_external_id?: string | null
    amount?: string | null
    has_additional_contracts?: boolean
    cid?: string | null
    locked_fields?: any[] | null
}

// Creative types
export interface CreateCreativeRequest extends IRequestWithVkOrdKey {
    externalId: string
    contractExternalIds: string[]
    mediaExternalIds?: string[] | null
    kktus: string[]
    type: VkOrdCreativeForm
    targetUrls?: string[] | null
    targetAudience?: string | null
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
    person_external_id?: string | null
    contract_external_ids?: string[] | null
    kktus?: string[] | null
    name?: string | null
    brand?: string | null
    category?: string | null
    description?: string | null
    pay_type?: VkOrdPayType
    form?: VkOrdCreativeForm
    targeting?: string | null
    target_urls?: string[] | null
    texts?: string[] | null
    media_external_ids?: string[] | null
    flags?: VkOrdCreativeFlag[] | null
}

// AI KKTY types
export interface GetKktyByTextRequest {
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

export interface GetKktyByTextResponse {
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
    rs_url?: string | null
    roles?: VkOrdPersonRoles[] | null
    juridical_details?: VkOrdPersonJuridicalDetails | null
}

export interface VkOrdPersonJuridicalDetails {
    type?: VkOrdPersonType
    model_scheme?: string | null
    inn?: string | null
    kpp?: string | null
    phone?: string | null
    foreign_epayment_method?: string | null
    foreign_registration_number?: string | null
    foreign_inn?: string | null
    foreign_oksm_country_code?: string | null
}

// Media types
export interface VkOrdMediaInfoResponse {
    filename?: string | null
    sha256?: string | null
    create_date?: string | null
    size?: number
    content_type?: string | null
    description?: string | null
}

export interface VkOrdMediaInfoListResponseDto {
    media?: VkOrdMediaInfoResponse[] | null
    totalCount?: number
    total_items_count?: number
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

// Re-export all types
export * from './auth'
export * from './credentials'
export * from './business'
export * from './wizard'


