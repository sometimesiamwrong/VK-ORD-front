import * as z from 'zod'
import { ActRole } from '@/types'

/**
 * Act Form Schema - Full-featured form for VK ORD acts/invoices
 * Matches backend CreateOrUpdateInvoiceRequest contract
 * Uses string dates for compatibility with HTML date inputs
 */

// Invoice Amount schema (matches backend VkOrdInvoiceItemAmount)
export const invoiceAmountSchema = z.object({
  excludingVat: z.number().nonnegative('Сумма не может быть отрицательной'),
  vatRate: z.number().min(0).max(100),
  vat: z.number().nonnegative('Сумма НДС не может быть отрицательной'),
  includingVat: z.number().positive('Общая сумма должна быть положительной'),
})

// Creative reference in distribution (matches VkOrdInvoiceItemCreative)
export const invoiceItemCreativeSchema = z.object({
  erid: z.string().min(1, 'ERID обязателен'),
  externalId: z.string().optional(),
})

// Distribution schema (matches backend VkOrdInvoiceV3Item)
export const actDistributionSchema = z.object({
  contractExternalId: z.string().min(1, 'Выберите договор'),
  amount: invoiceAmountSchema,
  creatives: z.array(invoiceItemCreativeSchema).optional(),
})

// Statistic schema (for manual entry and VK ORD data)
export const actStatisticSchema = z.object({
  metric: z.string().min(1, 'Укажите метрику'),
  value: z.number().min(0, 'Значение не может быть отрицательным'),
  unit: z.string().optional(),
  platform: z.string().optional(),
  period: z.string(),
  isValidated: z.boolean().optional(),
  isManual: z.boolean().optional(),
})

// Main act form schema (matches backend CreateOrUpdateInvoiceRequest)
export const actFormSchema = z.object({
  // Backend fields
  externalId: z.string().optional(),
  contractExternalId: z.string().min(1, 'Выберите договор'),  // Renamed from contractId
  orderContractExternalId: z.string().optional(),
  date: z.string().min(1, 'Укажите дату выставления'),        // Renamed from issueDate
  serial: z.string().optional(),                              // Renamed from number
  dateStart: z.string().min(1, 'Укажите дату начала периода'), // Renamed from periodStart
  dateEnd: z.string().min(1, 'Укажите дату окончания периода'), // Renamed from periodEnd
  amount: invoiceAmountSchema,                                // Changed from flat structure
  clientRole: z.nativeEnum(ActRole),                          // Renamed from advertiserRole
  contractorRole: z.nativeEnum(ActRole),
  items: z.array(actDistributionSchema).optional().default([]),
  status: z.string().optional(),

  // UI-only fields (not sent to backend)
  autoCalculate: z.boolean().optional().default(true),
  statistics: z.array(actStatisticSchema).optional().default([]), // VK ORD statistics
})
  .refine(
    (data) => new Date(data.dateEnd) >= new Date(data.dateStart),
    {
      message: 'Дата конца должна быть позже или равна дате начала',
      path: ['dateEnd'],
    }
  )
  .refine(
    (data) => new Date(data.date) >= new Date(data.dateStart),
    {
      message: 'Дата выставления не может быть раньше начала периода',
      path: ['date'],
    }
  )
  .refine(
    (data) => data.clientRole !== data.contractorRole,
    {
      message: 'Роли клиента и подрядчика должны различаться',
      path: ['contractorRole'],
    }
  )

export type ActFormData = z.infer<typeof actFormSchema>

// Helper to get default values for act form
export function getDefaultActFormValues(): Partial<ActFormData> {
  const today = new Date().toISOString().split('T')[0]
  return {
    // Backend fields
    serial: '',
    contractExternalId: '',
    orderContractExternalId: '',
    date: today,
    dateStart: '',
    dateEnd: '',
    amount: {
      excludingVat: 0,
      vatRate: 20,
      vat: 0,
      includingVat: 0,
    },
    clientRole: ActRole.Advertiser,
    contractorRole: ActRole.Publisher,
    items: [],
    status: 'draft',

    // UI-only fields
    autoCalculate: true,
    statistics: [],
  }
}
