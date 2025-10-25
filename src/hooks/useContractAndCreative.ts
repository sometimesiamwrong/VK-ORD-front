import { useCallback } from 'react'
import { toast } from 'sonner'
import {
  useWizardAdvertiser,
  useWizardContractor,
  useWizardContract,
  useWizardCreative,
  useWizardActions
} from '../stores/wizardStore'
import WizardService from '../services/wizard'
import { generateContractExternalId, getCookie } from '../utils'
import type { CreateContractRequest, CreateCreativeRequest } from '../types'

export const useContractAndCreative = () => {
  const advertiser = useWizardAdvertiser()
  const contractor = useWizardContractor()
  const contract = useWizardContract()
  const creative = useWizardCreative()
  const {
    updateContract,
    updateCreative,
    setErid,
    setStep,
    setLoading
  } = useWizardActions()

  const saveContract = useCallback(async () => {
    // Ensure contractExternalId is present
    let contractExternalId = contract.externalId
    if (!contractExternalId || !contractExternalId.trim()) {
      contractExternalId = generateContractExternalId(new Date(), 1)
      updateContract({ externalId: contractExternalId })
    }

    // Get credential ID from cookie
    const apiCredentialPublicId = getCookie('vkord-credential-id')
    if (!apiCredentialPublicId) {
      toast.error('Не выбран токен VK API')
      return
    }

    // Validate that both parties have external_id
    if (!advertiser.external_id) {
      toast.error('Не найден external_id рекламодателя. Пожалуйста, создайте контрагента заново.')
      return
    }
    if (!contractor.external_id) {
      toast.error('Не найден external_id исполнителя. Пожалуйста, создайте контрагента заново.')
      return
    }

    const payload: CreateContractRequest = {
      apiCredentialPublicId,
      externalId: contractExternalId,
      clientExternalId: advertiser.external_id,
      contractorExternalId: contractor.external_id,
      serial: contract.serial || undefined,
      paySum: contract.paySum || 0,
      payDateEnd: contract.payDateEnd || undefined
    }

    setLoading('contract', true)
    try {
      await WizardService.createContract(payload)
      toast.success('Договор успешно создан')
      updateContract({
        externalId: contractExternalId
      })
      updateCreative({ contractExternalIds: [contractExternalId] })
    } catch (e: any) {
      toast.error(`Ошибка создания договора: ${e?.message || e}`)
    } finally {
      setLoading('contract', false)
    }
  }, [contract, advertiser.external_id, contractor.external_id, updateContract, updateCreative, setLoading])

  const createCreative = useCallback(async () => {
    // Get credential ID from cookie
    const apiCredentialPublicId = getCookie('vkord-credential-id')
    if (!apiCredentialPublicId) {
      toast.error('Не выбран токен VK API')
      return
    }

    // Extract media external IDs from uploaded files
    const mediaExternalIds = creative.mediaFiles?.length 
      ? creative.mediaFiles.map(file => file.externalId)
      : undefined

    const payload: CreateCreativeRequest = {
      apiCredentialPublicId,
      externalId: creative.externalId,
      contractExternalIds: creative.contractExternalIds.length ? creative.contractExternalIds : [contract.externalId],
      kktus: creative.kktus ? (Array.isArray(creative.kktus) ? creative.kktus : [creative.kktus]) : [],
      type: creative.format,
      targetUrls: creative.contentUrls && creative.contentUrls.length ? creative.contentUrls : undefined,
      targetAudience: creative.targetAudience || undefined,
      texts: creative.text ? [creative.text] : undefined,
      name: creative.name || undefined,
      mediaExternalIds: mediaExternalIds,
      payType: 0 // Default to CPM
    }

    setLoading('creative', true)
    try {
      const creativeData = await WizardService.createCreative(payload)

      // Extract ERID from response - can be in data.erid or erid
      const erid = creativeData?.data?.erid || creativeData?.erid

      if (erid) {
        toast.success('Креатив успешно создан')
        setErid(erid)
        setStep(4)
      } else {
        toast.error('Ошибка: ERID не получен от сервера')
      }
    } catch (e: any) {
      toast.error(`Ошибка создания креатива: ${e?.message || e}`)
    } finally {
      setLoading('creative', false)
    }
  }, [creative, contract.externalId, setErid, setStep, setLoading])

  const guessKktyByText = useCallback(async () => {
    const text = creative.text?.trim() || ''
    if (!text) {
      toast.info('Введите текст для подбора ККТУ')
      return
    }

    setLoading('ai-kkty', true)
    try {
      const aiData = await WizardService.getKktuSuggestions({ text })

      if (aiData) {
        toast.success('ККТУ подобраны')
      } else {
        toast.error('Ошибка подбора ККТУ')
        return []
      }

      const list = aiData?.kkty || []

      if (list.length && (!creative.kktus || creative.kktus.length === 0)) {
        // Set first found code if kktus is not selected yet
        const firstCode = list[0].code
        if (firstCode) {
          updateCreative({ kktus: [firstCode] })
        }
      }

      return list
    } catch (e: any) {
      toast.error(`Ошибка подбора ККТУ: ${e?.message || e}`)
      return []
    } finally {
      setLoading('ai-kkty', false)
    }
  }, [creative.text, creative.kktus, updateCreative, setLoading])

  return { saveContract, createCreative, guessKktyByText }
}
