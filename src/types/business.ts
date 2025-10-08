// Business types
export interface ContractDetails {
  externalId: string
  clientExternalId: string
  contractorExternalId: string
  paySum: number
  createdAt?: string
  updatedAt?: string
}

export interface CreativeDetails {
  externalId: string
  contractExternalIds: string[]
  kktus: string[] // renamed from kktyCodes
  format: string
  contentUrls?: string[]
  targetAudience?: string
  text?: string
  name?: string
  erid?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreativeStatus {
  externalId: string
  status: string
  erid?: string
  message?: string
}

export interface MediaUploadResponse {
  externalId: string
  url: string
  erid?: string
}

export interface MediaDetails {
  externalId: string
  url: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  uploadedAt?: string
}

export interface PartyLookupRequest {
  inn?: string | null
}

export interface PartyLookupResponse {
  inn?: string
  name?: string
  type?: string
  shortWithOpf?: string
  fullName?: string
}

export interface SetCounterpartyRequest {
  inn: string
  types?: string[]
}

export interface CounterpartyJuridicalDetails {
  type?: string | number
  modelScheme?: string
  inn?: string
  kpp?: string
}

export interface CounterpartyItem {
  name?: string
  roles?: (string | number | null)[] | null
  juridicalDetails?: CounterpartyJuridicalDetails
}

// Legacy aliases for backward compatibility
export type CounterpartyDetails = CounterpartyJuridicalDetails

