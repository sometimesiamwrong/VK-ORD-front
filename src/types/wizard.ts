import type { VkOrdCreativeForm } from './index'

export type WizardStep = 1 | 2 | 3 | 4

export type PartyRole = ('advertiser' | 'agency' | 'ors' | 'publisher')[]

export interface PartyHistoryItem {
  inn: string
  shortWithOpf?: string | null
  fullName?: string | null
  type?: string | null
  timestamp: number
}

export interface WizardState {
  step: WizardStep
  consent: boolean
  // VK API settings
  vkApiKey?: string | null
  useSandbox: boolean
  // step 1
  advertiserInn: string
  contractorInn: string
  advertiserRole: PartyRole
  contractorRole: PartyRole
  advertiserName?: string | null
  contractorName?: string | null
  advertiserShortWithOpf?: string | null
  contractorShortWithOpf?: string | null
  advertiserInfo?: string | null
  contractorInfo?: string | null
  // step 2
  contractExternalId: string
  paySum?: number | null
  payDateEnd?: string | null
  // step 3
  creativeExternalId: string
  contractExternalIds: string[]
  kktus: string[] // renamed from kktyCodes
  format: VkOrdCreativeForm // updated enum type
  contentUrls: string[]
  targetAudience?: string | null
  text?: string | null
  name?: string | null
  mediaExternalIds: string[]
  // result
  erid?: string | null
  // local history for suggestions
  partyHistory?: PartyHistoryItem[]
}

export interface LoadingState {
  [key: string]: boolean
}

export interface MessageState {
  text: string
  status: 'success' | 'error' | 'info'
  highlight: boolean
}


