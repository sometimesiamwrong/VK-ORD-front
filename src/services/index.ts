// Export all services
export { default as DaDataService } from './dadata'
export { default as CounterpartiesService } from './counterparties'
export { default as ContractsService } from './contracts'
export { default as MediaService } from './media'
export { default as StatisticsService } from './statistics'
export { default as AiService } from './ai'

// Re-export types for convenience
export type {
  GetCounterpartiesByInnParams,
  GetCounterpartyContractsParams,
  GetRelatedCounterpartiesParams
} from './counterparties'

export type {
  GetActStatisticsParams
} from './statistics'




