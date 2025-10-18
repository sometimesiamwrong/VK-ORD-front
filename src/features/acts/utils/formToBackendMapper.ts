/**
 * Utility functions to map form data to backend API format
 * Maps ActFormData to CreateOrUpdateInvoiceRequest
 */

import type { ActFormData } from '../schemas/actFormSchema'
import type { CreateActRequest } from '@/types'

/**
 * Map form data to backend CreateActRequest format
 * Direct mapping - no legacy compatibility
 */
export function mapFormDataToBackend(formData: ActFormData, externalId?: string): CreateActRequest {
  return {
    externalId: externalId || formData.externalId,
    contractExternalId: formData.contractExternalId,
    orderContractExternalId: formData.orderContractExternalId,
    date: formData.date,
    serial: formData.serial,
    dateStart: formData.dateStart,
    dateEnd: formData.dateEnd,
    amount: formData.amount,
    clientRole: formData.clientRole,
    contractorRole: formData.contractorRole,
    items: formData.items && formData.items.length > 0 ? formData.items : undefined,
    status: (formData.status as any) || 'draft',
  }
}
