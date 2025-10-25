/**
 * Wizard State to Template Mapper
 *
 * Maps Wizard Store state to FlowTemplate creation data.
 * Used when saving wizard state as a template.
 */

import type { TemplateExternalIds } from '../../../types/flowTemplates'

export interface WizardStateForTemplate {
  advertiser: {
    external_id: string | null
  }
  contractor: {
    external_id: string | null
  }
  contract: {
    externalId: string
  }
  creative: {
    externalId: string
  }
}

/**
 * Map wizard state to template creation data
 *
 * Extracts only External IDs needed for template creation.
 * Backend will validate and enrich these IDs with full objects.
 *
 * @param state - Current wizard state
 * @returns Template data for API request
 */
export const mapWizardStateToTemplate = (state: WizardStateForTemplate): TemplateExternalIds => {
  return {
    contractExternalId: state.contract.externalId,
    contractorExternalId: state.contractor.external_id || '',
    clientExternalId: state.advertiser.external_id || '',
    creativeExternalId: state.creative.externalId
  }
}
