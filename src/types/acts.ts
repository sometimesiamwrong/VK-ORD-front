// Act management types

export enum ActStatus {
  Draft = 'draft',
  Sent = 'sent',
  Error = 'error',
  Approved = 'approved',
  Rejected = 'rejected'
}

export enum ActRole {
  Advertiser = 'advertiser',
  Agency = 'agency',
  Publisher = 'publisher'
}

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
  companyId: string
  companyName: string
  createdAt: string
  updatedAt: string
}

export interface ActDistribution {
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
  companyId: string
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

export interface CreateActRequest {
  companyId: string
  contractId: string
  number?: string
  totalAmount: number
  vatRate: number
  periodStart: string
  periodEnd: string
  issueDate: string
  paymentDate?: string
  advertiserRole: ActRole
  contractorRole: ActRole
  distributions: ActDistribution[]
  notes?: string
}

export interface UpdateActRequest extends Partial<CreateActRequest> {
  id: string
}

export interface ActsListRequest {
  companyId?: string
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


