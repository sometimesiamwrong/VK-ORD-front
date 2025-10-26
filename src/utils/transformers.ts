/**
 * Утилиты для трансформации данных между различными форматами
 * Единый источник истины для преобразований DTO в Item и обратно
 */

import type { 
  CounterpartyDto, 
  CounterpartyItem,
  ContractDto,
  CreativeDto
} from '../types'

/**
 * Преобразует CounterpartyDto в CounterpartyItem
 * Универсальная функция для всех частей приложения
 */
export const transformCounterpartyDto = (dto: CounterpartyDto): CounterpartyItem => {
  const juridicalDetails = dto.data?.juridicalDetails
  
  return {
    id: dto.id,
    externalId: dto.externalId,
    name: dto.data?.name ?? '',
    roles: dto.data?.roles ?? [],
    juridicalDetails: juridicalDetails ? {
      type: juridicalDetails.type,
      modelScheme: juridicalDetails.modelScheme,
      inn: juridicalDetails.inn,
      kpp: juridicalDetails.kpp,
      phone: juridicalDetails.phone,
      foreignEpaymentMethod: juridicalDetails.foreignEpaymentMethod,
      foreignRegistrationNumber: juridicalDetails.foreignRegistrationNumber,
      foreignInn: juridicalDetails.foreignInn,
      foreignOksmCountryCode: juridicalDetails.foreignOksmCountryCode
    } : undefined,
    syncStatus: dto.syncStatus,
    updatedAt: dto.updatedAt,
    createdAt: dto.createdAt
  }
}

/**
 * Преобразует массив CounterpartyDto в массив CounterpartyItem
 */
export const transformCounterpartyDtoArray = (dtos: CounterpartyDto[]): CounterpartyItem[] => {
  return dtos.map(transformCounterpartyDto)
}

/**
 * Преобразует ContractDto в упрощенный формат для совместимости
 * @deprecated Используйте ContractDto напрямую
 */
export const contractDtoToLegacy = (dto: ContractDto) => ({
  externalId: dto.externalId || '',
  clientExternalId: dto.clientExternalId || dto.data?.clientExternalId || '',
  contractorExternalId: dto.contractorExternalId || dto.data?.contractorExternalId || '',
  paySum: Number(dto.amount || dto.data?.amount || 0),
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt
})

/**
 * Преобразует CreativeDto в упрощенный формат для совместимости
 * @deprecated Используйте CreativeDto напрямую
 */
export const creativeDtoToLegacy = (dto: CreativeDto) => ({
  externalId: dto.externalId || '',
  contractExternalIds: dto.data?.contractExternalIds || [],
  kktus: dto.data?.kktus || [],
  format: String(dto.form || dto.data?.form || 0),
  contentUrls: dto.data?.targetUrls,
  targetAudience: dto.targeting || dto.data?.targeting,
  text: dto.data?.texts?.[0],
  name: dto.name || dto.data?.name,
  erid: dto.erid || dto.data?.erid,
  status: dto.status,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt
})
