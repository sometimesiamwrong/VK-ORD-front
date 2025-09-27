import { useCallback } from 'react'
import { api } from '../services/api'
import { useApp } from '../context/AppContext'
import { generateContractExternalId } from '../utils'
import type { ApiResponse, CreateContractRequest, CreateCreativeRequest, CreateCreativeResponse, AiKktyResponse } from '../types'

export const useContractAndCreative = () => {
  const {
    wizardState,
    setContractData,
    setCreativeData,
    setErid,
    setStep,
    setLoading,
    setMessage
  } = useApp()

  const saveContract = useCallback(async () => {
    // Ensure contractExternalId is present
    let contractExternalId = wizardState.contractExternalId
    if (!contractExternalId || !contractExternalId.trim()) {
      contractExternalId = generateContractExternalId(new Date(), 1)
      setContractData({ externalId: contractExternalId, paySum: wizardState.paySum, payDateEnd: wizardState.payDateEnd })
    }

    const payload: CreateContractRequest = {
      externalId: contractExternalId,
      clientExternalId: wizardState.advertiserInn,
      contractorExternalId: wizardState.contractorInn,
      paySum: wizardState.paySum || 0,
      payDateEnd: wizardState.payDateEnd || undefined
    }

    setLoading('contract', true)
    try {
      const resp: ApiResponse<any> = await api.createContract(payload)
      if (resp.success) {
        setMessage('Договор успешно создан', 'success')
      } else {
        setMessage(resp.message || 'Ошибка создания договора', 'error')
      }
      if (resp.success && resp.data?.externalId) {
        setContractData({
          externalId: resp.data.externalId,
          paySum: wizardState.paySum,
          payDateEnd: wizardState.payDateEnd
        })
        setCreativeData({ contractExternalIds: [resp.data.externalId] })
      }
    } catch (e: any) {
      setMessage(`Ошибка создания договора: ${e?.message || e}`, 'error')
    } finally {
      setLoading('contract', false)
    }
  }, [wizardState, setContractData, setCreativeData, setLoading, setMessage])

  const createCreative = useCallback(async () => {
    const payload: CreateCreativeRequest = {
      externalId: wizardState.creativeExternalId,
      contractExternalIds: wizardState.contractExternalIds.length ? wizardState.contractExternalIds : [wizardState.contractExternalId],
      kktyCodes: wizardState.kktyCodes ? (Array.isArray(wizardState.kktyCodes) ? wizardState.kktyCodes : [wizardState.kktyCodes]) : [],
      format: wizardState.format,
      contentUrls: wizardState.contentUrls.length ? wizardState.contentUrls : undefined,
      targetAudience: wizardState.targetAudience || undefined,
      text: wizardState.text || undefined,
      name: wizardState.name || undefined
    }

    setLoading('creative', true)
    try {
      const resp: ApiResponse<CreateCreativeResponse> = await api.createCreative(payload)
      if (resp.success) {
        setMessage('Креатив успешно создан', 'success')
      } else {
        setMessage(resp.message || 'Ошибка создания креатива', 'error')
      }
      let erid = resp?.data?.erid || null
      if (!erid) {
        const getResp: ApiResponse<CreateCreativeResponse> = await api.getCreative(wizardState.creativeExternalId)
        if (getResp.success) {
          setMessage('ERID получен', 'success')
        } else {
          setMessage(getResp.message || 'Ошибка получения ERID', 'error')
        }
        erid = getResp?.data?.erid || null
      }
      if (erid) {
        setErid(erid)
        setStep(4)
      }
    } catch (e: any) {
      setMessage(`Ошибка создания креатива: ${e?.message || e}`, 'error')
    } finally {
      setLoading('creative', false)
    }
  }, [wizardState, setErid, setStep, setLoading, setMessage])

  const guessKktyByText = useCallback(async () => {
    const text = wizardState.text?.trim() || ''
    if (!text) {
      setMessage('Введите текст для подбора ККТУ', 'info')
      return
    }

    setLoading('ai-kkty', true)
    try {
      const resp: ApiResponse<AiKktyResponse> = await api.getKktyByText(text)
      if (resp.success) {
        setMessage('ККТУ подобраны', 'success')
      } else {
        setMessage(resp.message || 'Ошибка подбора ККТУ', 'error')
      }
      const list = resp?.data?.kkty || []

      if (list.length && (!wizardState.kktyCodes || wizardState.kktyCodes.length === 0)) {
        // Set first found code if kktyCodes is not selected yet
        const firstCode = list[0].code
        if (firstCode) {
          setCreativeData({ kktyCodes: [firstCode] })
        }
      }

      return list
    } catch (e: any) {
      setMessage(`Ошибка подбора ККТУ: ${e?.message || e}`, 'error')
      return []
    } finally {
      setLoading('ai-kkty', false)
    }
  }, [wizardState.text, wizardState.kktyCodes, setCreativeData, setLoading, setMessage])

  return { saveContract, createCreative, guessKktyByText }
}
