/**
 * Template to Wizard State Mapper
 *
 * Maps FlowTemplate data to Wizard Store state.
 * Used when loading a template into the wizard.
 */

import type { TemplateEnrichedData } from '../../../types/flowTemplates'
import type { PartyRole } from '../../../types/wizard'
import { VkOrdCreativeForm } from '../../../types'

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

/**
 * Normalize roles from backend format to wizard format
 * Backend returns roles as numbers: 0=Advertiser, 1=Agency, 2=ORS, 3=Publisher
 * Frontend uses strings: 'advertiser', 'agency', 'ors', 'publisher'
 */
const normalizeRoles = (roles: any[] | undefined): PartyRole => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return []
  }

  const numberRoleMap: Record<number, PartyRole[number]> = {
    0: 'advertiser',
    1: 'agency',
    2: 'ors',
    3: 'publisher'
  }

  const stringRoleMap: Record<string, PartyRole[number]> = {
    advertiser: 'advertiser',
    'рекламодатель': 'advertiser',
    agency: 'agency',
    'агентство': 'agency',
    'рекламное агентство': 'agency',
    publisher: 'publisher',
    'издатель': 'publisher',
    ors: 'ors',
    'оператор рекламных систем': 'ors',
    'оператор рекламной системы': 'ors'
  }

  const normalized = new Set<PartyRole[number]>()

  roles.forEach((role) => {
    if (typeof role === 'number') {
      const mapped = numberRoleMap[role]
      if (mapped) {
        normalized.add(mapped)
      }
      return
    }

    if (typeof role === 'string') {
      const key = role.trim().toLowerCase().replace(/\s+/g, ' ')
      const mapped = stringRoleMap[key]
      if (mapped) {
        normalized.add(mapped)
      }
    }
  })

  return Array.from(normalized)
}

/**
 * Select appropriate role for party based on context
 * For advertiser: prefer 'advertiser' role
 * For contractor: prefer 'publisher' role
 */
const selectRoleForParty = (roles: any[] | undefined, preferredRole: 'advertiser' | 'publisher'): PartyRole => {
  const normalized = normalizeRoles(roles)
  
  if (normalized.length === 0) {
    return [preferredRole]
  }

  // If preferred role is in the list, use it
  if (normalized.includes(preferredRole)) {
    return [preferredRole]
  }

  // Otherwise, return all roles
  return normalized
}

export interface MappedWizardState {
  advertiser: {
    inn: string
    external_id: string | null
    name: string | null
    shortWithOpf: string | null
    info: string | null
    role: PartyRole
  }
  contractor: {
    inn: string
    external_id: string | null
    name: string | null
    shortWithOpf: string | null
    info: string | null
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
    targetAudience: string | null
    kktus: string[]
  }
}

/**
 * Map template data to wizard state
 *
 * According to requirements:
 * - Step 1 (Parties): Fill ALL fields
 * - Step 2 (Contract): Fill ALL fields
 * - Step 3 (Creative): Fill ONLY: format, contractExternalIds, contentUrls, targetAudience, kktus
 *
 * @param template - Template data from backend (enriched with full DTO objects)
 * @returns Mapped wizard state
 */
export const mapTemplateToWizardState = (template: TemplateEnrichedData): MappedWizardState => {
  const { client, contractor, contract, creative } = template

  return {
    // Step 1: Advertiser (Client) - ALL fields
    advertiser: {
      inn: client.data?.juridicalDetails?.inn || '',
      external_id: client.externalId || null,
      name: client.data?.name || null,
      shortWithOpf: null, // Not available in CounterpartyDto
      info: null, // Not available in CounterpartyDto
      role: selectRoleForParty(client.data?.roles, 'advertiser')
    },

    // Step 1: Contractor (Publisher) - ALL fields
    contractor: {
      inn: contractor.data?.juridicalDetails?.inn || '',
      external_id: contractor.externalId || null,
      name: contractor.data?.name || null,
      shortWithOpf: null, // Not available in CounterpartyDto
      info: null, // Not available in CounterpartyDto
      role: selectRoleForParty(contractor.data?.roles, 'publisher')
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
        : [contract.externalId || ''],
      
      // Content URLs: map from targetUrls (note: snake_case in JSON, camelCase after http interceptor)
      contentUrls: creative.data?.targetUrls || [],
      
      // Target audience: targeting field
      targetAudience: creative.data?.targeting || null,
      
      // KKTU codes: array of strings
      kktus: creative.data?.kktus || []
    }
  }
}
