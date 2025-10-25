/**
 * Hook for fetching single act details
 *
 * Backend: InvoicesController
 * Endpoint: GET /api/invoices/v1/{externalId}
 *
 * @param actId - Act external ID to fetch
 * @returns Query result with act details (mapped from backend structure)
 */

import { useQuery } from '@tanstack/react-query'
import http from '../../../api/http'
import type { ActDetails, ActBackendEntity, ActRole, ActStatus, ActDistribution } from '../../../types'

// Map backend entity to frontend ActDetails
const mapActBackendToDetails = (entity: ActBackendEntity): ActDetails => {
  console.log('Mapping backend entity to ActDetails:', entity)

  // Parse amounts from services
  const servicesAmount = entity.data.amount.services
  const includingVat = parseFloat(servicesAmount.includingVat || '0')
  const vatRate = parseFloat(servicesAmount.vatRate || '20')
  const vat = parseFloat(servicesAmount.vat || '0')
  const excludingVat = parseFloat(servicesAmount.excludingVat || '0')

  // Map status string to ActStatus
  const statusMap: Record<string, ActStatus> = {
    'Draft': 'draft',
    'Sent': 'sent',
    'Error': 'error',
    'Approved': 'approved',
    'Rejected': 'rejected'
  }
  const status = statusMap[entity.data.status] || 'draft'

  // Map roles
  const roleMap: Record<string, ActRole> = {
    'Advertiser': 'advertiser',
    'Publisher': 'publisher',
    'Agency': 'agency',
    'Ors': 'ors',
    'Mediator': 'mediator'
  }

  const clientRole = roleMap[entity.data.clientRole] || 'advertiser'
  const contractorRole = roleMap[entity.data.contractorRole] || 'publisher'

  console.log('Mapped roles:', { clientRole, contractorRole })

  // Map distributions (items)
  const distributions: ActDistribution[] = (entity.data.items || []).map(item => ({
    contractExternalId: item.contractExternalId,
    amount: {
      excludingVat: item.amount.excludingVat,
      vatRate: item.amount.vatRate,
      vat: item.amount.vat,
      includingVat: item.amount.includingVat,
    },
    creatives: (item.creatives || []).map(c => ({
      erid: c.erid || '',
      creativeExternalId: c.creativeExternalId || '',
    }))
  }))

  const result = {
    id: String(entity.id),
    number: entity.data.serial,
    status,
    externalId: entity.externalId,
    companyName: '',  // Not provided in backend response
    contractId: entity.contractExternalId,
    contractNumber: undefined,

    // Main data
    totalAmount: includingVat,
    vatRate,
    vatAmount: vat,
    amountWithoutVat: excludingVat,

    // Dates
    periodStart: entity.data.dateStart,
    periodEnd: entity.data.dateEnd,
    issueDate: entity.data.date,
    paymentDate: undefined,

    // Roles
    advertiserRole: clientRole,
    contractorRole,

    // Distribution
    distributions,

    // Statistics (not provided by backend in this endpoint)
    statistics: [],

    // Meta
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    createdBy: '',
  }

  console.log('Mapped ActDetails:', result)
  return result
}

export const useActDetails = (actId: string) => {
  return useQuery({
    queryKey: ['act', actId],
    queryFn: async () => {
      try {
        const response = await http.get<ActBackendEntity>(`/api/invoices/v1/${actId}`)
        const mapped = mapActBackendToDetails(response.data)
        return mapped
      } catch (error) {
        console.error('Failed to fetch act details:', error)
        throw error
      }
    },
    enabled: !!actId,
  })
}
