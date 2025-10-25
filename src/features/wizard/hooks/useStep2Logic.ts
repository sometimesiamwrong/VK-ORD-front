import { useState, useMemo, useCallback } from 'react'
import {
  useWizardAdvertiser,
  useWizardContractor,
  useWizardContract,
  useWizardActions
} from '../../../stores/wizardStore'
import { useCounterpartyContractsQuery } from '../../../hooks/useCounterparties'
import type { ContractDto } from '../../../types'

export const useStep2Logic = () => {
  const advertiser = useWizardAdvertiser()
  const contractor = useWizardContractor()
  const contract = useWizardContract()
  const { updateContract } = useWizardActions()

  const [showContractSelector, setShowContractSelector] = useState(false)

  // Получаем external_id контрагентов
  const advertiserExternalId = advertiser.external_id || ''
  const contractorExternalId = contractor.external_id || ''

  // Загружаем договоры рекламодателя
  const {
    data: advertiserContractsData,
    isLoading: isLoadingAdvertiserContracts,
    isFetching: isFetchingAdvertiserContracts
  } = useCounterpartyContractsQuery(
    {
      externalId: advertiserExternalId,
      cacheOnly: false
    },
    !!advertiserExternalId && showContractSelector
  )
  const advertiserContracts = advertiserContractsData?.contracts || []

  // Загружаем договоры исполнителя
  const {
    data: contractorContractsData,
    isLoading: isLoadingContractorContracts,
    isFetching: isFetchingContractorContracts
  } = useCounterpartyContractsQuery(
    {
      externalId: contractorExternalId,
      cacheOnly: false
    },
    !!contractorExternalId && showContractSelector
  )
  const contractorContracts = contractorContractsData?.contracts || []

  // Находим общие договоры между контрагентами
  const contractsBetween = useMemo(() => {
    if (!advertiserExternalId || !contractorExternalId) {
      return []
    }

    console.log('=== Finding contracts between parties ===')
    console.log('Advertiser external_id:', advertiserExternalId)
    console.log('Contractor external_id:', contractorExternalId)
    console.log('Advertiser contracts count:', advertiserContracts.length)
    console.log('Contractor contracts count:', contractorContracts.length)

    // Объединяем оба массива и убираем дубликаты по externalId
    const allContracts = [...advertiserContracts, ...contractorContracts]
    console.log('All contracts (before dedup):', allContracts.length)

    const uniqueContracts = allContracts.filter((contract, index, self) =>
      index === self.findIndex(c =>
        (c.externalId || c.externalId) === (contract.externalId || contract.externalId)
      )
    )
    console.log('Unique contracts (after dedup):', uniqueContracts.length)

    // Фильтруем: оставляем только те, где оба контрагента присутствуют в ЛЮБЫХ ролях
    const common = uniqueContracts.filter(contract => {
      const contractClientId = contract.data?.clientExternalId || contract.clientExternalId
      const contractContractorId = contract.data?.contractorExternalId || contract.contractorExternalId

      console.log('Checking contract:', {
        serial: contract.data?.serial || contract.externalId,
        contractClientId,
        contractContractorId,
        selectedAdvertiser: advertiserExternalId,
        selectedContractor: contractorExternalId
      })

      // Проверяем две комбинации:
      // 1. Рекламодатель = клиент в договоре, Исполнитель = контрактор в договоре
      const directMatch = contractClientId === advertiserExternalId && contractContractorId === contractorExternalId

      // 2. Рекламодатель = контрактор в договоре, Исполнитель = клиент в договоре (обратная роль)
      const reverseMatch = contractClientId === contractorExternalId && contractContractorId === advertiserExternalId

      const isMatch = directMatch || reverseMatch

      if (isMatch) {
        console.log(`✅ Contract MATCH (${directMatch ? 'direct' : 'reverse'}):`, contract.data?.serial)
      } else {
        console.log('❌ Contract NO MATCH:', contract.data?.serial)
      }

      return isMatch
    })

    console.log('Common contracts found:', common.length)
    console.log('Common contracts:', common.map(c => c.data?.serial || c.externalId))
    return common
  }, [advertiserExternalId, contractorExternalId, advertiserContracts, contractorContracts])

  // Проверяем, есть ли договоры между контрагентами
  const hasContractsBetween = useMemo(() => {
    return contractsBetween.length > 0
  }, [contractsBetween])

  const isLoadingContracts = (isLoadingAdvertiserContracts || isFetchingAdvertiserContracts) || 
                            (isLoadingContractorContracts || isFetchingContractorContracts)

  // Применяем выбранный договор
  const applySelectedContract = useCallback((selectedContract: ContractDto) => {
    if (!selectedContract) return

    updateContract({
      externalId: selectedContract.externalId || '',
      serial: selectedContract.data?.serial || null,
      paySum: selectedContract.amount ? Number(selectedContract.amount) : null,
      payDateEnd: selectedContract.data?.dateEnd || null
    })

    setShowContractSelector(false)
  }, [updateContract])

  // Очистка полей договора
  const clearContract = useCallback(() => {
    updateContract({
      externalId: '',
      serial: null,
      paySum: null,
      payDateEnd: null
    })
  }, [updateContract])

  return {
    // State
    contract,
    advertiser,
    contractor,
    contractsBetween,
    isLoadingContracts,
    showContractSelector,
    hasContractsBetween,

    // Actions
    setShowContractSelector,
    applySelectedContract,
    clearContract,
    updateContract
  }
}
