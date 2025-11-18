/**
 * Utility functions to map form data to backend API format
 * Maps ActFormData to CreateOrUpdateInvoiceRequest
 */

import type { ActFormData } from '../schemas/actFormSchema'
import type { CreateActRequest, InvoiceV3Amount, InvoiceV3AmountElement } from '@/types'

// Helper to convert numeric amount object to string-based API format
const toApiAmountElement = (amount: any): InvoiceV3AmountElement => ({
  excludingVat: String(amount.excludingVat ?? 0),
  vatRate: String(amount.vatRate ?? 20),
  vat: String(amount.vat ?? 0),
  includingVat: String(amount.includingVat ?? 0),
})

/**
 * Transforms the amount object from the form to the format required by the backend API.
 * It handles both the legacy numeric format and the new V3 object format.
 * @param amount - The amount object from the form data.
 * @returns The amount object in the API V3 format.
 */
function transformAmountForBackend(amount: ActFormData['amount']): InvoiceV3Amount {
  // If 'services' property exists, it's the V3 format.
  if (amount && 'services' in amount && amount.services) {
    return {
      services: toApiAmountElement(amount.services),
      commission: amount.commission ? toApiAmountElement(amount.commission) : null,
    }
  }

  // Otherwise, it's the legacy numeric format, so we wrap it in 'services'.
  return {
    services: toApiAmountElement(amount),
    commission: null,
  }
}

/**
 * Map form data to backend CreateActRequest format
 * Direct mapping - no legacy compatibility
 */
export function mapFormDataToBackend(formData: ActFormData, externalId?: string): CreateActRequest {
  return {
    externalId: externalId || formData.externalId,
    contractExternalId: formData.contractExternalId,
    orderContractExternalId: formData.orderContractExternalId || undefined,
    date: formData.date,
    serial: formData.serial,
    dateStart: formData.dateStart,
    dateEnd: formData.dateEnd,
    amount: transformAmountForBackend(formData.amount),
    clientRole: formData.clientRole,
    contractorRole: formData.contractorRole,
    items: formData.items?.map(item => ({
      contractExternalId: item.contractExternalId,
      amount: toApiAmountElement(item.amount),
      // Исключаем поле name из креативов при отправке на бэкенд
      creatives: item.creatives?.map(creative => ({
        erid: creative.erid,
        creativeExternalId: creative.creativeExternalId,
      })),
    })),
    status: (formData.status as any) || 'draft',
  }
}
