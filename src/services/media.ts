import http from '../api/http'
import type {
  VkOrdMediaInfoResponse,
  GetMediaListResponse,
  PageRequest
} from '../types'

export class MediaService {
  /**
   * Загрузить медиа файл
   */
  static async uploadMedia(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await http.post<string>('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Получить информацию о медиа файле
   */
  static async getMediaInfo(externalId: string): Promise<VkOrdMediaInfoResponse> {
    const response = await http.get<VkOrdMediaInfoResponse>(`/api/media/${externalId}`)
    return response.data
  }

  /**
   * Получить список медиа файлов
   */
  static async getMediaList(params?: PageRequest): Promise<GetMediaListResponse> {
    const response = await http.get<GetMediaListResponse>('/api/media/page', {
      params
    })
    return response.data
  }
}

export default MediaService




