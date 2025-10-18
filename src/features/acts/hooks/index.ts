/**
 * Acts Feature Hooks
 *
 * Centralized export for all acts-related React Query hooks
 */

// Parties hooks
export { useParties } from './useParties'
export { usePartiesSearch } from './usePartiesSearch'

// Acts CRUD hooks
export { useActs } from './useActs'
export { useActDetails } from './useActDetails'
export { useCreateAct } from './useCreateAct'
export { useUpdateAct } from './useUpdateAct'
export { useDeleteAct } from './useDeleteAct'
export { useSubmitAct } from './useSubmitAct'

// Contracts and creatives hooks
export { useContractsByParty } from './useContractsByParty'
export { useContractCreatives } from './useContractCreatives'
export { useRelatedParties } from './useRelatedParties'
export { useContractBetweenParties } from './useContractBetweenParties'

// Statistics hooks (legacy)
export { useActStatistics, useActStatisticsQuery } from './useActStatistics'

// Statistics Controller hooks (new)
export { useCreateStatistics } from './useCreateStatistics'
export { useGetStatistics } from './useGetStatistics'
export { useDeleteStatistics } from './useDeleteStatistics'
