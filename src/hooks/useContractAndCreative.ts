import { useCallback } from 'react'
import http from '../api/http'
import { useApp } from '../context/AppContext'
import { generateContractExternalId, getCookie } from '../utils'
import type { CreateContractRequest, CreateCreativeRequest, VkOrdCreativeV3RequestResponse, GetKktyByTextResponseLegacy } from '../types'

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

    // Get credential ID from cookie
    const apiCredentialPublicId = getCookie('vkord-credential-id')
    if (!apiCredentialPublicId) {
      setMessage('Не выбран токен VK API', 'error')
      return
    }

    const payload: CreateContractRequest = {
      apiCredentialPublicId,
      externalId: contractExternalId,
      clientExternalId: wizardState.advertiserInn,
      contractorExternalId: wizardState.contractorInn,
      serial: wizardState.serial || undefined,
      paySum: wizardState.paySum || 0,
      payDateEnd: wizardState.payDateEnd || undefined
    }

    setLoading('contract', true)
    try {
      await http.post('/api/clientapi/create_contract', payload)
      // Contract creation doesn't return data in new API
      setMessage('Договор успешно создан', 'success')
      setContractData({
        externalId: contractExternalId,
        paySum: wizardState.paySum,
        payDateEnd: wizardState.payDateEnd
      })
      setCreativeData({ contractExternalIds: [contractExternalId] })
    } catch (e: any) {
      setMessage(`Ошибка создания договора: ${e?.message || e}`, 'error')
    } finally {
      setLoading('contract', false)
    }
  }, [wizardState, setContractData, setCreativeData, setLoading, setMessage])

  const createCreative = useCallback(async () => {
    // Get credential ID from cookie
    const apiCredentialPublicId = getCookie('vkord-credential-id')
    if (!apiCredentialPublicId) {
      setMessage('Не выбран токен VK API', 'error')
      return
    }

    const payload: CreateCreativeRequest = {
      apiCredentialPublicId,
      externalId: wizardState.creativeExternalId,
      contractExternalIds: wizardState.contractExternalIds.length ? wizardState.contractExternalIds : [wizardState.contractExternalId],
      kktus: wizardState.kktus ? (Array.isArray(wizardState.kktus) ? wizardState.kktus : [wizardState.kktus]) : [],
      type: wizardState.format,
      targetUrls: wizardState.contentUrls.length ? wizardState.contentUrls : undefined,
      targetAudience: wizardState.targetAudience || undefined,
      texts: wizardState.text ? [wizardState.text] : undefined,
      name: wizardState.name || undefined,
      mediaExternalIds: wizardState.mediaExternalIds?.length ? wizardState.mediaExternalIds : undefined,
      payType: 0 // Default to CPM
    }

    setLoading('creative', true)
    try {
      const response = await http.post<VkOrdCreativeV3RequestResponse>('/api/clientapi/create_creative', payload)
      const creativeData = response.data

      // Предполагаем успех, если данные получены
      if (creativeData?.erid) {
        setMessage('Креатив успешно создан', 'success')
        setErid(creativeData.erid)
        setStep(4)
      } else {
        setMessage('Ошибка создания креатива', 'error')
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
      const response = await http.post<GetKktyByTextResponseLegacy>('/api/ai/get-kkty_by-text', { text })
      const aiData = response.data

      // Предполагаем успех, если данные получены
      if (aiData) {
        setMessage('ККТУ подобраны', 'success')
      } else {
        setMessage('Ошибка подбора ККТУ', 'error')
        return []
      }

      const list = aiData?.kkty || []

      if (list.length && (!wizardState.kktus || wizardState.kktus.length === 0)) {
        // Set first found code if kktus is not selected yet
        const firstCode = list[0].code
        if (firstCode) {
          setCreativeData({ kktus: [firstCode] })
        }
      }

      return list
    } catch (e: any) {
      setMessage(`Ошибка подбора ККТУ: ${e?.message || e}`, 'error')
      return []
    } finally {
      setLoading('ai-kkty', false)
    }
  }, [wizardState.text, wizardState.kktus, setCreativeData, setLoading, setMessage])

  return { saveContract, createCreative, guessKktyByText }
}
