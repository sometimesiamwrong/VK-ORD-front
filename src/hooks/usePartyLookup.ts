import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import http from '../api/http'
import { useApp } from '../context/AppContext'
import CounterpartiesService from '../services/counterparties'
import { isValidInn, getPartyDisplayName, getPartyShortWithOpf } from '../utils'
import type { DaDataPartyShortResponse, CounterpartyDto, CounterpartyItem } from '../types'

// Функция преобразования CounterpartyDto в CounterpartyItem
const transformCounterpartyDto = (dto: CounterpartyDto): CounterpartyItem => {
  const juridicalDetails = dto.data.juridicalDetails || dto.data.juridical_details
  return {
    id: dto.id,
    external_id: dto.external_id || dto.externalId,
    name: dto.data.name,
    roles: dto.data.roles,
    juridical_details: juridicalDetails ? {
      type: juridicalDetails.type,
      model_scheme: juridicalDetails.model_scheme || juridicalDetails.modelScheme,
      inn: juridicalDetails.inn,
      kpp: juridicalDetails.kpp,
      phone: juridicalDetails.phone,
      foreign_epayment_method: juridicalDetails.foreign_epayment_method,
      foreign_registration_number: juridicalDetails.foreign_registration_number,
      foreign_inn: juridicalDetails.foreign_inn,
      foreign_oksm_country_code: juridicalDetails.foreign_oksm_country_code
    } : undefined,
    sync_status: dto.sync_status || dto.syncStatus,
    expires_at: dto.expires_at || dto.expiresAt,
    updated_at: dto.updated_at || dto.updatedAt,
    created_at: dto.created_at || dto.createdAt
  }
}

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) return fallback

  if (typeof error === 'string') {
    return error.trim() || fallback
  }

  // Axios error shape
  const axiosCandidate = error as {
    message?: string | null
    response?: {
      data?: unknown
      status?: number
    }
  }

  // 1) Broken rules array from interceptor
  const brokenRulesCandidate = error as {
    brokenRules?: Array<{ message?: string | null }>
  }
  if (Array.isArray(brokenRulesCandidate?.brokenRules) && brokenRulesCandidate.brokenRules.length > 0) {
    const combinedBrokenRules = brokenRulesCandidate.brokenRules
      .map(rule => {
        if (typeof rule?.message === 'string') {
          return rule.message.trim()
        } else if (rule?.message != null) {
          return String(rule.message).trim()
        } else {
          return 'Неизвестная ошибка валидации'
        }
      })
      .filter(Boolean)
      .join('\n')

    if (combinedBrokenRules) {
      return combinedBrokenRules
    }
  }

  // 2) Backend might send { message: string }
  if (typeof axiosCandidate?.response?.data === 'object' && axiosCandidate.response.data !== null) {
    const dataObj = axiosCandidate.response.data as { message?: string | null; errorMessage?: string | null }
    const payloadMessage = dataObj.message || dataObj.errorMessage
    if (typeof payloadMessage === 'string' && payloadMessage.trim()) {
      return payloadMessage.trim()
    }
  }

  // 3) Response data is an array of messages (raw broken rules bypassing interceptor)
  if (Array.isArray(axiosCandidate?.response?.data)) {
    const arrayMessage = (axiosCandidate.response.data as Array<{ Message?: string | null; message?: string | null }>)
      .map((item) => (item?.Message || item?.message || '').trim())
      .filter(Boolean)
      .join('\n')
    if (arrayMessage) {
      return arrayMessage
    }
  }

  if (typeof axiosCandidate?.response?.data === 'string' && axiosCandidate.response.data.trim()) {
    return axiosCandidate.response.data.trim()
  }

  // 4) Top-level message from error object
  if (typeof axiosCandidate?.message === 'string' && axiosCandidate.message.trim()) {
    return axiosCandidate.message.trim()
  }

  return fallback
}

export const usePartyLookup = () => {
  const {
    wizardState,
    setAdvertiserInfo,
    setContractorInfo,
    addToPartyHistory,
    setLoading,
    setMessage
  } = useApp()

  const lookupInn = useCallback(async (kind: 'advertiser' | 'contractor') => {
    const inn = kind === 'advertiser' ? wizardState.advertiserInn : wizardState.contractorInn

    if (!isValidInn(inn)) {
      setMessage('ИНН должен содержать 10 или 12 цифр', 'error')
      return
    }

    setLoading(`lookup-${kind}`, true)
    try {
      const response = await http.post<DaDataPartyShortResponse>('/api/client/party', { inn })
      const partyData = response.data

      // Предполагаем успех, если данные получены
      if (partyData) {
        setMessage('Поиск выполнен успешно', 'success')
      } else {
        setMessage('Ошибка поиска', 'error')
        return
      }

      if (partyData) {
        const display = getPartyDisplayName(partyData.name)
        const shortWithOpf = getPartyShortWithOpf(partyData.name)
        const t = partyData.type || ''
        const info = display ? `${display}${t ? ` (${t})` : ''}` : null

        const infoData = { name: display || null, shortWithOpf: shortWithOpf || null, info }

        if (kind === 'advertiser') {
          setAdvertiserInfo(infoData)
        } else {
          setContractorInfo(infoData)
        }

        // Add to history
        addToPartyHistory({
          inn,
          shortWithOpf: shortWithOpf || display || null,
          fullName: display || null,
          type: (t as string) || null,
          timestamp: Date.now()
        })
      }
    } catch (error) {
      setMessage(extractErrorMessage(error, 'Ошибка поиска контрагента'), 'error')
    } finally {
      setLoading(`lookup-${kind}`, false)
    }
  }, [wizardState, setAdvertiserInfo, setContractorInfo, addToPartyHistory, setLoading, setMessage])

  const createCounterparty = useCallback(async (kind: 'advertiser' | 'publisher') => {
    const inn = kind === 'advertiser' ? wizardState.advertiserInn : wizardState.contractorInn
    const role = kind === 'advertiser' ? wizardState.advertiserRole : wizardState.contractorRole

    if (!isValidInn(inn)) {
      setMessage('ИНН должен содержать 10 или 12 цифр', 'error')
      return
    }

    if (role.length === 0) {
      setMessage('Необходимо выбрать роль контрагента', 'error')
      return
    }

    setLoading(`create-${kind}`, true)
    try {
      await http.post<unknown>('/api/client/set-counterparty', { inn, types: role })
      // Предполагаем успех, если нет ошибки
      setMessage('Контрагент успешно создан', 'success')
    } catch (error) {
      setMessage(extractErrorMessage(error, 'Не удалось создать контрагента'), 'error')
    } finally {
      setLoading(`create-${kind}`, false)
    }
  }, [wizardState, setLoading, setMessage])

  return { lookupInn, createCounterparty }
}

// Hook для получения списка сохраненных контрагентов
export const useCounterpartiesList = (params?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: ['counterparties', 'list', params],
    queryFn: async () => {
      try {
        // Provide default pagination parameters
        const defaultParams = {
          limit: 100,
          offset: 0,
          ...params
        }
        console.log('Fetching counterparties with params:', defaultParams)
        const response = await CounterpartiesService.getCounterpartiesList(defaultParams)
        console.log('Counterparties response:', response)
        console.log('Counterparties response.data:', response.data)
        
        // Проверяем структуру ответа и извлекаем массив контрагентов
        let counterpartiesArray: CounterpartyDto[];
        if (response.data && typeof response.data === 'object' && '$values' in response.data) {
          // Если структура содержит $values, используем его
          counterpartiesArray = (response.data as any).$values;
        } else {
          // Иначе используем response.data как массив
          counterpartiesArray = response.data;
        }
        
        console.log('Counterparties array:', counterpartiesArray)
        console.log('Counterparties array length:', counterpartiesArray.length)
        if (counterpartiesArray.length > 0) {
          console.log('First counterparty DTO:', counterpartiesArray[0])
          console.log('Transformed first counterparty:', transformCounterpartyDto(counterpartiesArray[0]))
        }
        const transformed = counterpartiesArray.map(transformCounterpartyDto)
        console.log('Transformed counterparties:', transformed)
        return transformed
      } catch (error: any) {
        console.error('Error fetching counterparties:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
        return []
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 1
  })
}
