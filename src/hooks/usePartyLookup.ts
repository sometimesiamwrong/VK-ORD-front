import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import http from '../api/http'
import { useApp } from '../context/AppContext'
import { isValidInn, getPartyDisplayName, getPartyShortWithOpf } from '../utils'
import type { DaDataPartyShortResponse } from '../types'

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
      const response = await http.post<DaDataPartyShortResponse>('/api/ClientApi/party', { inn })
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
    } catch (e: any) {
      setMessage(`Ошибка поиска: ${e?.message || e}`, 'error')
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
      await http.post<unknown>('/api/ClientApi/set-counterparty', { inn, types: role })
      // Предполагаем успех, если нет ошибки
      setMessage('Контрагент успешно создан', 'success')
    } catch (e: any) {
      setMessage(`Ошибка создания контрагента: ${e?.message || e}`, 'error')
    } finally {
      setLoading(`create-${kind}`, false)
    }
  }, [wizardState, setLoading, setMessage])

  return { lookupInn, createCounterparty }
}

// Hook для получения списка сохраненных контрагентов
export const useCounterpartiesList = () => {
  return useQuery({
    queryKey: ['counterparties'],
    queryFn: async () => {
      try {
        const response = await http.get('/api/ClientApi/counterparties')
        if (response.data?.data) {
          return response.data.data
        }
        return []
      } catch (error: any) {
        console.error('Error fetching counterparties:', error)
        return []
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 1
  })
}
