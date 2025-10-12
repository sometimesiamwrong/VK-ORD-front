import http from '../api/http'
import type { DaDataPartyResponse } from '../types'

export class DaDataService {
  /**
   * Поиск компании по ИНН через DaData API
   */
  static async getPartyByInn(inn: string): Promise<DaDataPartyResponse> {
    const response = await http.get<DaDataPartyResponse>(`/api/dadata/party/${inn}`)
    return response.data
  }
}

export default DaDataService



