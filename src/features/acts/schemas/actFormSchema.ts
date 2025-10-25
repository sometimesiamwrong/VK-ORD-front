import * as z from 'zod'
import { ActRole } from '@/types'

/**
 * Act Form Schema - Full-featured form for VK ORD invoices/invoices
 * Matches backend CreateOrUpdateInvoiceRequest contract
 * Uses string dates for compatibility with HTML date inputs
 */

// Invoice Amount schema for internal form use (numeric)
export const invoiceAmountSchema = z.object({
  excludingVat: z.number().nonnegative('Сумма не может быть отрицательной'),
  vatRate: z.number().min(0).max(100),
  vat: z.number().nonnegative('Сумма НДС не может быть отрицательной'),
  includingVat: z.number().positive('Общая сумма должна быть положительной'),
})

// VK ORD API v3 Amount Element schema (string-based)
export const invoiceV3AmountElementSchema = z.object({
  excludingVat: z.string(),
  vatRate: z.string(),
  vat: z.string(),
  includingVat: z.string(),
})

// VK ORD API v3 Amount schema
export const invoiceV3AmountSchema = z.object({
  services: invoiceV3AmountElementSchema,
  commission: invoiceV3AmountElementSchema.nullable().optional(),
})

// Union schema to handle both internal and API amount structures
export const amountUnionSchema = z.union([invoiceAmountSchema, invoiceV3AmountSchema])

// Creative reference in distribution (matches VkOrdInvoiceItemCreative)
export const invoiceItemCreativeSchema = z.object({
  erid: z.string().min(1, 'ERID обязателен').optional(),
  creativeExternalId: z.string().optional(),
})

// Distribution schema (matches backend VkOrdInvoiceV3Item)
export const actDistributionSchema = z.object({
  contractExternalId: z.string().min(1, 'Выберите договор'),
  amount: amountUnionSchema,
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
  orderContractExternalId: z.union([z.literal(''), z.string()]).transform(val => val === '' ? null : val).nullable().optional(),
  date: z.string().min(1, 'Укажите дату выставления'),        // Renamed from issueDate
  serial: z.string().optional(),                              // Renamed from number
  dateStart: z.string().min(1, 'Укажите дату начала периода'), // Renamed from periodStart
  dateEnd: z.string().min(1, 'Укажите дату окончания периода'), // Renamed from periodEnd
  amount: amountUnionSchema,                                // Changed from flat structure
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
      message: 'Роли клиента и исполнителя должны различаться',
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
    orderContractExternalId: null,
    date: today,
    dateStart: '',
    dateEnd: '',
    amount: {
      excludingVat: 0,
      vatRate: 20,
      vat: 0,
      includingVat: 0,
    },
    clientRole: ActRole.advertiser,
    contractorRole: ActRole.publisher,
    items: [],
    status: 'draft',

    // UI-only fields
    autoCalculate: true,
    statistics: [],
  }
}
