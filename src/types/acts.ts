// Act management types

export const ActStatus = {
  Draft: 'draft',
  Sent: 'sent',
  Error: 'error',
  Approved: 'approved',
  Rejected: 'rejected'
} as const

export type ActStatus = typeof ActStatus[keyof typeof ActStatus]

// Matches backend VkOrdApiClientRole enum
export const ActRole = {
  Advertiser: 'advertiser',
  Agency: 'agency',
  Ors: 'ors',
  Publisher: 'publisher',
  Mediator: 'mediator'
} as const

export type ActRole = typeof ActRole[keyof typeof ActRole]

export interface Company {
  id: string
  name: string
  inn: string
  kpp?: string
  actCount?: number
  lastActDate?: string
}

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

// Invoice Amount structure (matches backend VkOrdInvoiceAmount and VkOrdInvoiceItemAmount)
export interface InvoiceAmount {
  excludingVat: number  // without VAT
  vatRate: number       // VAT percentage
  vat: number          // VAT amount
  includingVat: number // with VAT
}

// Creative reference in distribution item (matches VkOrdInvoiceItemCreative)
export interface InvoiceItemCreative {
  erid: string
  externalId?: string
}

// Distribution item (matches backend VkOrdInvoiceV3Item)
export interface ActDistribution {
  contractExternalId: string  // Renamed from contractId to match backend
  amount: InvoiceAmount       // Changed to structured amount
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
  amount: InvoiceAmount                  // Required - act amount structure
  clientRole: ActRole                    // Required - client role in main contract
  contractorRole: ActRole                // Required - contractor role in main contract
  items?: ActDistribution[]              // Optional - distribution items (was "distributions")
  status?: ActStatus                     // Optional - defaults to Draft
}

export interface UpdateActRequest extends CreateActRequest {
  // Same as Create - backend uses same endpoint PUT /api/invoices/{externalId}
}

export interface ActsListRequest {
  externalId?: string
  status?: ActStatus
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export interface ActsListResponse {
  acts: ActSummary[]
  total: number
  page: number
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

export interface ActSubmitResponse {
  success: boolean
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


