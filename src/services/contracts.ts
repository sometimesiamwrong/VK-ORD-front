import http from '../api/http'
import type {
  GetContractBetweenResponse,
  GetContractDetailsResponse
} from '../types'

export class ContractsService {
  /**
   * Получить договор между контрагентами
   */
  static async getContractBetween(clientInn: string, contractorInn: string): Promise<GetContractBetweenResponse> {
    const response = await http.get<GetContractBetweenResponse>(`/api/v1/contracts/between/${clientInn}/${contractorInn}`)
    return response.data
  }

  /**
   * Получить детали договора с креативами
   */
  static async getContractDetails(contractExternalId: string): Promise<GetContractDetailsResponse> {
    const response = await http.get<GetContractDetailsResponse>(`/api/v1/contracts/${contractExternalId}/details`)
    return response.data
  }
}

export default ContractsService




