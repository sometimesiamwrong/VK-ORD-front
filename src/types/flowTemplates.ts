// Flow Templates types for VK ORD API

import type { ContractDto, CreativeDto, CounterpartyDto } from './index'

// Enum for template types
export const FlowTemplateType = {
  Basic: 0,
  VkOrdContract: 1,
  VkOrdCreative: 2,
  VkOrdStatistics: 3,
  VkOrdWizard: 4,
  Custom: 99
} as const

export type FlowTemplateType = typeof FlowTemplateType[keyof typeof FlowTemplateType]

// Query parameters for fetching templates
export interface GetTemplatesParams {
  limit?: number
  offset?: number
  search?: string
  type?: number
  tags?: string
  sort?: string
  order?: 'asc' | 'desc'
  activeOnly?: boolean
}

// Template data types

/**
 * Simple object with External IDs for creating/updating a Wizard template
 * Backend validates and enriches these IDs with full objects
 */
export interface TemplateExternalIds {
  contractExternalId: string
  contractorExternalId: string
  clientExternalId: string
  creativeExternalId: string
}

/**
 * Full template data received from backend (enriched)
 * Uses existing DTO types from the system
 */
export interface TemplateEnrichedData {
  contract: ContractDto
  contractor: CounterpartyDto
  client: CounterpartyDto
  creative: CreativeDto
}

// Request DTOs
export interface CreateFlowTemplateRequest {
  name: string
  type: FlowTemplateType
  description?: string
  value: TemplateExternalIds
  tags?: string[]
}

export interface UpdateFlowTemplateRequest {
  name?: string
  description?: string
  value?: TemplateExternalIds
  tags?: string[]
  isActive?: boolean
}

export interface ActivateFlowTemplateRequest {
  isActive: boolean
}

// Response DTOs
export interface FlowTemplateListItemResponse {
  id: number
  publicId: string
  name: string
  type: FlowTemplateType
  description?: string
  tags: string[]
  isActive: boolean
  createdAt: string
  lastUsedAt?: string
  useCount: number
}

export interface FlowTemplateResponse extends FlowTemplateListItemResponse {
  apiCredentialId: number
  value: TemplateEnrichedData
  version: number
  updatedAt: string
}

export interface FlowTemplateListResponse {
  data: FlowTemplateListItemResponse[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface FlowTemplateTypeDto {
  type: FlowTemplateType
  name: string
  description: string
}

export interface FlowTemplateTypesResponse {
  types: FlowTemplateTypeDto[]
}
