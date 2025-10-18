import http from '../api/http'
import type {
  GetContractDetailsResponse,
  GetCounterpartyContractsResponse,
  GetCounterpartiesByInnResponse
} from '../types'
import CounterpartiesService from './counterparties'

export class ContractsService {

  /**
   * Получить детали договора с креативами
   */
  static async getContractDetails(contractExternalId: string): Promise<GetContractDetailsResponse> {
    const response = await http.get<GetContractDetailsResponse>(`/api/v1/contracts/${contractExternalId}/details`)
    return response.data
  }

  /**
   * Найти договора между двумя сторонами по их ИНН
   */
  static async getContractBetween(firstPartyInn: string, secondPartyInn: string): Promise<GetContractDetailsResponse[]> {
    // Сначала получаем информацию о первой стороне, чтобы получить её external ID
    const firstPartyResponse = await http.get<GetCounterpartiesByInnResponse>(`/api/v1/counterparties/by-inn/${firstPartyInn}`)
    if (!firstPartyResponse.data.counterparties || firstPartyResponse.data.counterparties.length === 0) {
      return []
    }
    
    const firstParty = firstPartyResponse.data.counterparties[0]
    const firstPartyExternalId = firstParty.externalId || firstParty.external_id

    // Получаем список контрактов для первой стороны
    const firstPartyContractsResponse = await http.get<GetCounterpartyContractsResponse>(`/api/client/counterparties/${firstPartyExternalId}/contracts`)
    const firstPartyContracts = firstPartyContractsResponse.data.contracts || []

    // Сначала получаем информацию о второй стороне, чтобы получить её external ID
    const secondPartyResponse = await http.get<GetCounterpartiesByInnResponse>(`/api/v1/counterparties/by-inn/${secondPartyInn}`)
    if (!secondPartyResponse.data.counterparties || secondPartyResponse.data.counterparties.length === 0) {
      return []
    }
    
    const secondParty = secondPartyResponse.data.counterparties[0]
    const secondPartyExternalId = secondParty.externalId || secondParty.external_id

    // Фильтруем контракты, чтобы найти те, в которых участвует вторая сторона
    const contractsBetween = firstPartyContracts.filter((contract: any) => {
      return (contract.clientExternalId === secondPartyExternalId || contract.contractorExternalId === secondPartyExternalId)
    })

    // Если нашли контракты, возвращаем детали для каждого
    if (contractsBetween.length > 0) {
      const contractDetailsPromises = contractsBetween.map((contract: any) =>
        http.get<GetContractDetailsResponse>(`/api/v1/contracts/${contract.externalId}/details`)
      )
      const results = await Promise.all(contractDetailsPromises)
      return results.map((result: any) => result.data)
    }

    return []
  }
}

export default ContractsService




