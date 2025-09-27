import { useCallback } from 'react'
import { api } from '../services/api'
import { useApp } from '../context/AppContext'
import { isValidInn, getPartyDisplayName, getPartyShortWithOpf } from '../utils'
import type { ApiResponse, DaDataPartyShortResponse } from '../types'

export const usePartyLookup = () => {
  const {
    setAdvertiserInfo,
    setContractorInfo,
    addToPartyHistory,
    setLoading,
    setMessage
  } = useApp()

  const lookupInn = useCallback(async (kind: 'advertiser' | 'contractor') => {
    const { wizardState } = useApp()
    const inn = kind === 'advertiser' ? wizardState.advertiserInn : wizardState.contractorInn

    if (!isValidInn(inn)) {
      setMessage('ИНН должен содержать 10 или 12 цифр', 'error')
      return
    }

    setLoading(`lookup-${kind}`, true)
    try {
      const resp: ApiResponse<DaDataPartyShortResponse> = await api.partyLookup(inn)
      if (resp.success) {
        setMessage('Поиск выполнен успешно', 'success')
      } else {
        setMessage(resp.message || 'Ошибка поиска', 'error')
      }

      if (resp.success && resp.data) {
        const display = getPartyDisplayName(resp.data.name)
        const shortWithOpf = getPartyShortWithOpf(resp.data.name)
        const t = resp.data.type || ''
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
  }, [setAdvertiserInfo, setContractorInfo, addToPartyHistory, setLoading, setMessage])

  const createCounterparty = useCallback(async (kind: 'advertiser' | 'publisher') => {
    const { wizardState } = useApp()
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
      const resp = await api.setCounterparty(inn, role)
      if (resp.success) {
        setMessage('Контрагент успешно создан', 'success')
      } else {
        setMessage(resp.message || 'Ошибка создания контрагента', 'error')
      }
    } catch (e: any) {
      setMessage(`Ошибка создания контрагента: ${e?.message || e}`, 'error')
    } finally {
      setLoading(`create-${kind}`, false)
    }
  }, [setLoading, setMessage])

  return { lookupInn, createCounterparty }
}
