import http from '../api/http'
import type {
  GetKktyByTextRequest,
  GetKktyByTextResponse
} from '../types'

export class AiService {
  /**
   * Получить классификацию KKTY по тексту
   */
  static async getKktyByText(request: GetKktyByTextRequest): Promise<GetKktyByTextResponse> {
    const response = await http.post<GetKktyByTextResponse>('/api/ai/get-kkty_by-text', request)
    return response.data
  }
}

export default AiService



