// Act management types

export const ActStatus = {
  draft: 'draft',
  sent: 'sent',
  error: 'error',
  approved: 'approved',
  rejected: 'rejected'
} as const

export type ActStatus = typeof ActStatus[keyof typeof ActStatus]

// Matches backend VkOrdApiClientRole enum
export const ActRole = {
  advertiser: 'advertiser',
  agency: 'agency',
  ors: 'ors',
  publisher: 'publisher',
  mediator: 'mediator'
} as const

export type ActRole = typeof ActRole[keyof typeof ActRole]

// DEPRECATED: Use CounterpartyItem from '../types/business' instead
// Company type removed - CounterpartyItem now includes actCount and lastActDate fields

export interface ActSummary {
  id: string
  number?: string
  date: string
  amount: number
  status: ActStatus
  contractId: string
  contractNumber?: string
  externalId: string
  companyName: string
  createdAt: string
  updatedAt: string
}

// VK ORD API v3 Amount Element structure (for services and commission)
export interface InvoiceV3AmountElement {
  excludingVat: string  // excluding_vat in API
  vatRate: string       // vat_rate in API
  vat: string          // vat in API
  includingVat: string // including_vat in API
}

// VK ORD API v3 Amount structure (matches InvoiceV3Amount from API)
export interface InvoiceV3Amount {
  services: InvoiceV3AmountElement
  commission?: InvoiceV3AmountElement | null
}

// Invoice Amount structure (for internal form usage)
export interface InvoiceAmount {
  excludingVat: number  // without VAT
  vatRate: number       // VAT percentage
  vat: number          // VAT amount
  includingVat: number // with VAT
}

// Creative reference in distribution item (matches VkOrdInvoiceItemCreative)
export interface InvoiceItemCreative {
  erid?: string
  creativeExternalId?: string
}

// Distribution item (matches backend VkOrdInvoiceV3Item)
export interface ActDistribution {
  contractExternalId: string  // Renamed from contractId to match backend
  amount: InvoiceV3AmountElement       // Flat amount structure for items
  creatives?: InvoiceItemCreative[]  // Changed from creativeIds array
}

// Legacy distribution structure for backwards compatibility
export interface ActDistributionLegacy {
  contractId: string
  contractNumber?: string
  amount: number
  vatRate: number
  vatAmount: number
  creativeIds: string[]
  description?: string
}

export interface ActStatisticsItem {
  metric: string
  value: number
  unit?: string
  platform?: string
  period: string
  isValidated?: boolean
  isManual?: boolean
}

export interface ActDetails {
  id: string
  number?: string
  status: ActStatus
  externalId: string
  companyName: string
  contractId: string
  contractNumber?: string

  // Main data
  totalAmount: number
  vatRate: number
  vatAmount: number
  amountWithoutVat: number

  // Dates
  periodStart: string
  periodEnd: string
  issueDate: string
  paymentDate?: string

  // Roles
  advertiserRole: ActRole
  contractorRole: ActRole

  // Distribution
  distributions: ActDistribution[]

  // Statistics
  statistics: ActStatisticsItem[]

  // Meta
  createdAt: string
  updatedAt: string
  createdBy: string
  notes?: string
}

// Create/Update Act Request (matches backend CreateOrUpdateInvoiceRequest)
export interface CreateActRequest {
  externalId?: string                    // Will be set from route or generated
  contractExternalId: string             // Required - main contract
  orderContractExternalId?: string       // Optional - order contract
  date: string                           // Required - issue date (YYYY-MM-DD)
  serial?: string                        // Optional - act number
  dateStart: string                      // Required - period start (YYYY-MM-DD)
  dateEnd: string                        // Required - period end (YYYY-MM-DD)
  amount: InvoiceV3Amount                  // Required - act amount structure
  clientRole: ActRole                    // Required - client role in main contract
  contractorRole: ActRole                // Required - contractor role in main contract
  items?: ActDistribution[]              // Optional - distribution items (was "distributions")
  status?: ActStatus                     // Optional - defaults to Draft
}

export interface UpdateActRequest extends CreateActRequest {
  // Same as Create - backend uses same endpoint PUT /api/invoices/v1/{externalId}
}

export interface ActsListRequest {
  externalId?: string
  status?: ActStatus
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

// Backend entity structure (after camelCase conversion from snake_case by Axios interceptor)
export interface ActBackendEntity {
  id: number
  externalId: string
  contractExternalId: string
  logicalAccountId: number
  data: {
    createDate?: string
    contractExternalId: string
    date: string
    serial?: string
    dateStart: string
    dateEnd: string
    amount: {
      services: {
        excludingVat: string
        vatRate: string
        vat: string
        includingVat: string
      }
      commission?: {
        excludingVat: string
        vatRate: string
        vat: string
        includingVat: string
      } | null
    }
    status: string  // "Draft", "Sent", "Error", "Approved", "Rejected"
    clientRole: string
    contractorRole: string
    items?: Array<{
      contractExternalId: string
      amount: {
        excludingVat: string
        vatRate: string
        vat: string
        includingVat: string
      }
      creatives?: Array<{
        creativeExternalId?: string
        erid?: string
      }>
    }>
  }
  syncStatus: string
  isDraft: boolean
  createdAt: string
  updatedAt: string
  expiresAt: string
  version: number
  jsonData?: string
  dataHash?: string
  isDeleted: boolean
}

// Backend response structure (after camelCase conversion)
export interface ActsListBackendResponse {
  data: ActBackendEntity[]      // Backend uses "data" not "acts"
  totalItemsCount: number       // Backend uses "total_items_count"
  totalCount: number            // Backend uses "total_count"
  limit: number
}

// Frontend-friendly response structure (mapped from backend)
export interface ActsListResponse {
  data: ActSummary[]            // Mapped from ActBackendEntity[]
  totalItemsCount: number
  totalCount: number
  limit: number
}

export interface ActStatisticsRequest {
  contractId: string
  creativeIds?: string[]
  periodStart: string
  periodEnd: string
  platform?: string
  validatedOnly?: boolean
}

export interface ActValidationError {
  field: string
  message: string
  code?: string
}

// Backend returns empty object {} on success (200 OK), or object with errors on failure
export interface ActSubmitResponse {
  success?: boolean         // Optional - not returned by backend on success
  actId?: string
  errors?: ActValidationError[]
  message?: string
}

// Statistics Controller types
export interface CreativeStatistics {
  id?: string
  creativeExternalId: string
  padExternalId: string
  actualStartDate: string
  actualEndDate: string
  paidEventType: 'cpm' | 'cpc' | 'cpa' | 'cpv'
  costPerEvent: number
  impressionCount: number
  paidImpressionCount: number
  amount: number
  vatRate: number
  vatAmount?: number
}

export interface CreateStatisticsRequest {
  invoiceExternalId: string
  contractExternalId: string
  statistics: CreativeStatistics[]
}

export interface StatisticsListRequest {
  creativeExternalId?: string
  padExternalId?: string
  invoiceExternalId?: string
  contractExternalId?: string
  offset?: number
  limit?: number
}

export interface StatisticsListResponse {
  statistics: CreativeStatistics[]
  totalCount: number
  offset: number
  limit: number
}

export interface DeleteStatisticsRequest {
  statisticsIds: string[]
}


