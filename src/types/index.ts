// API types
export type ApiResponse<T> = {
    success: boolean
    message?: string
    timestamp?: string
    data?: T | null
    code?: string
}

export type DaDataPartyShortResponse = {
    inn: string
    kpp?: string | null
    // name может приходить как строка или объект с вариантами
    name?:
        | string
        | {
              fullWithOpf?: string | null
              full?: string | null
              shortWithOpf?: string | null
              short?: string | null
              value?: string | null
          }
        | null
    type?: 'juridical' | 'ip' | 'JURIDICAL' | 'INDIVIDUAL' | null
}

export type CreateContractRequest = {
    externalId: string
    clientExternalId: string
    contractorExternalId: string
    paySum: number
    payDateEnd?: string | null
}

export type CreateContractResponse = {
    externalId: string
    success: boolean
    createdAt?: string
    errorMessage?: string | null
}

export type VkCreativeForm =
  | 'banner'
  | 'text_block'
  | 'text_graphic_block'
  | 'audio'
  | 'video'
  | 'live_audio'
  | 'live_video'
  | 'text_video_block'
  | 'text_graphic_video_block'
  | 'text_audio_block'
  | 'text_graphic_audio_block'
  | 'text_audio_video_block'
  | 'text_graphic_audio_video_block'
  | 'banner_html5'

export type CreateCreativeRequest = {
    externalId: string
    contractExternalIds: string[]
    kktyCodes: string[]
    format: VkCreativeForm
    contentUrls?: string[]
    targetAudience?: string
    text?: string
    name?: string
}

export type CreateCreativeResponse = {
    externalId?: string | null
    erid?: string | null
    success?: boolean
}

export type EridResult = {
    externalId: string
    erid: string
}

// AI KKTY by text response
export type AiKktyItem = {
    code: string
    fullName: string
    reason: string
}

export type AiMatchedCategory = {
    main_category_id: string
    main_category_name: string
    subcategory_id: string
    subcategory_name: string
    matched_items_in_subcategory: string[]
}

export type AiKktyResponse = {
    kkty: AiKktyItem[]
    matchedCategories: AiMatchedCategory[]
}

// Re-export wizard types
export * from './wizard'


