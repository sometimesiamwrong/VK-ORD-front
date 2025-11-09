/**
 * Template to Wizard State Mapper
 *
 * Maps FlowTemplate data to Wizard Store state.
 * Used when loading a template into the wizard.
 */

import type { TemplateEnrichedData } from '../../../types/flowTemplates'
import type { PartyRole } from '../../../types/wizard'
import { VkOrdCreativeForm } from '../../../types'
import { parseRoles } from '../../../utils'

/**
 * Convert string enum value to numeric enum value
 * Backend returns enum values as strings (e.g., "TextBlock", "Cpm")
 * We need to convert them to numbers (1, 0)
 */
const parseCreativeForm = (form: string | number | undefined): number => {
  if (typeof form === 'number') return form
  if (!form) return 0
  
  // Try to find matching enum key
  const enumKey = Object.keys(VkOrdCreativeForm).find(
    key => key.toLowerCase() === form.toLowerCase()
  ) as keyof typeof VkOrdCreativeForm | undefined
  
  return enumKey ? VkOrdCreativeForm[enumKey] : 0
}

export interface MappedWizardState {
  advertiser: {
    inn: string
    external_id: string | null
    name: string | null
    shortWithOpf: string | null
    info: string | null
    juridicalDetails: any | null
    role: PartyRole
  }
  contractor: {
    inn: string
    external_id: string | null
    name: string | null
    shortWithOpf: string | null
    info: string | null
    juridicalDetails: any | null
    role: PartyRole
  }
  contract: {
    externalId: string
    serial: string | null
    paySum: number | null
    payDateEnd: string | null
  }
  creative: {
    format: number
    contractExternalIds: string[]
    contentUrls: string[]
    kktus: string[]
  }
}

/**
 * Map template data to wizard state
 *
 * According to requirements:
 * - Step 1 (Parties): Fill ALL fields
 * - Step 2 (Contract): Fill ALL fields
 * - Step 3 (Creative): Fill ONLY: format, contractExternalIds, contentUrls, kktus
 *
 * @param template - Template data from backend (enriched with full DTO objects)
 * @returns Mapped wizard state
 */
/**
 * Format counterparty info string for display
 */
const formatCounterpartyInfo = (name: string | null | undefined, type: string | null | undefined): string | null => {
  if (!name) return null

  const displayName = name
  const typeLabel = type === 'Ip' || type === 'ip'
    ? 'ИП'
    : type === 'Juridical' || type === 'juridical'
    ? 'ЮР лицо'
    : type === 'Physical' || type === 'physical'
    ? 'Физ. лицо'
    : type || ''

  return typeLabel ? `${displayName} (${typeLabel})` : displayName
}

export const mapTemplateToWizardState = (template: TemplateEnrichedData): MappedWizardState => {
  const { client, contractor, contract, creative } = template

  const clientName = client.data?.name || null
  const clientType = client.data?.juridicalDetails?.type || null
  const contractorName = contractor.data?.name || null
  const contractorType = contractor.data?.juridicalDetails?.type || null

  return {
    // Step 1: Advertiser (Client) - ALL fields
    advertiser: {
      inn: client.data?.juridicalDetails?.inn || '',
      external_id: client.externalId || null,
      name: clientName,
      shortWithOpf: null, // Not available in CounterpartyDto
      info: formatCounterpartyInfo(clientName, clientType),
      juridicalDetails: client.data?.juridicalDetails || null,
      role: parseRoles(client.data?.roles),
    },

    // Step 1: Contractor (Publisher) - ALL fields
    contractor: {
      inn: contractor.data?.juridicalDetails?.inn || '',
      external_id: contractor.externalId || null,
      name: contractorName,
      shortWithOpf: null, // Not available in CounterpartyDto
      info: formatCounterpartyInfo(contractorName, contractorType),
      juridicalDetails: contractor.data?.juridicalDetails || null,
      role: parseRoles(contractor.data?.roles)
    },

    // Step 2: Contract - ALL fields
    contract: {
      externalId: contract.externalId || '',
      serial: contract.data?.serial || null,
      paySum: typeof contract.data?.amount === 'number' ? contract.data.amount : null,
      payDateEnd: contract.data?.dateEnd || null
    },

    // Step 3: Creative - ONLY specified fields
    creative: {
      // Parse form: backend returns string enum (e.g., "TextBlock"), convert to number (1)
      format: parseCreativeForm(creative.data?.form),
      
      // Contract IDs: try data.contractExternalIds first, fallback to contract externalId
      contractExternalIds: creative.data?.contractExternalIds && creative.data.contractExternalIds.length > 0
        ? creative.data.contractExternalIds
        : contract.externalId ? [contract.externalId] : [],
      
      // Content URLs: map from targetUrls (note: snake_case in JSON, camelCase after http interceptor)
      contentUrls: creative.data?.targetUrls && creative.data.targetUrls.length > 0 
        ? creative.data.targetUrls 
        : [],
      
      // KKTU codes: array of strings
      kktus: creative.data?.kktus && creative.data.kktus.length > 0 
        ? creative.data.kktus 
        : []
    }
  }
}
