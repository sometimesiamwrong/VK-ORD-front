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
  externalId?: string
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
  id?: number
  external_id?: string
  name?: string
  roles?: string[]
  juridical_details?: {
    type?: string
    model_scheme?: string
    inn?: string
    kpp?: string
    phone?: string
    foreign_epayment_method?: string
    foreign_registration_number?: string
    foreign_inn?: string
    foreign_oksm_country_code?: string
  }
  sync_status?: string
  expires_at?: string
  updated_at?: string
  created_at?: string
}

// Legacy aliases for backward compatibility
export type CounterpartyDetails = CounterpartyJuridicalDetails

