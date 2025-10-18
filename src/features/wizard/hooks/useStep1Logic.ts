import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  useWizardAdvertiser,
  useWizardContractor,
  useWizardActions
} from '../../../stores/wizardStore'
import { usePartyLookup, useCounterpartiesList } from '../../../hooks/usePartyLookup'
import { isValidInn } from '../../../utils'
import type { PartyRole, CounterpartyItem } from '../../../types'

const ROLE_MAP: Record<string, PartyRole[number]> = {
  advertiser: 'advertiser',
  'рекламодатель': 'advertiser',
  '0': 'advertiser',
  agency: 'agency',
  'агентство': 'agency',
  'рекламное агентство': 'agency',
  '1': 'agency',
  publisher: 'publisher',
  'издатель': 'publisher',
  '3': 'publisher',
  ors: 'ors',
  'оператор рекламных систем': 'ors',
  'оператор рекламной системы': 'ors',
  '2': 'ors'
}

const normalizeRoles = (roles: CounterpartyItem['roles']): PartyRole => {
  if (!Array.isArray(roles)) {
    return []
  }

  const normalized = new Set<PartyRole[number]>()

  roles.forEach((role) => {
    if (role === null || role === undefined) return

    if (typeof role === 'number') {
      const mapped = ROLE_MAP[String(role)]
      if (mapped) {
        normalized.add(mapped)
      }
      return
    }

    const key = role.toString().trim().toLowerCase()
    const keyWithoutSpaces = key.replace(/\s+/g, ' ')
    const mapped = ROLE_MAP[keyWithoutSpaces] || ROLE_MAP[key]
    if (mapped) {
      normalized.add(mapped)
    }
  })

  return Array.from(normalized)
}

type PartyKind = 'advertiser' | 'contractor'

export const useStep1Logic = () => {
  const advertiser = useWizardAdvertiser()
  const contractor = useWizardContractor()

  const {
    setAdvertiserInn,
    setContractorInn,
    setAdvertiserRole,
    setContractorRole,
    setAdvertiserInfo,
    setContractorInfo,
    setConsent
  } = useWizardActions()

  const { lookupInn, createCounterparty } = usePartyLookup()
  const {
    data: counterpartiesList = [],
    isLoading: isLoadingCounterparties,
    isFetching: isFetchingCounterparties,
    refetch: refetchCounterparties
  } = useCounterpartiesList()

  const [modalField, setModalField] = useState<PartyKind | null>(null)

  // Refetch counterparties when modal opens
  useEffect(() => {
    if (modalField) {
      refetchCounterparties()
    }
  }, [modalField, refetchCounterparties])

  const clearStep1 = useCallback(() => {
    setAdvertiserInn('')
    setContractorInn('')
    setAdvertiserRole(['advertiser'])
    setContractorRole(['publisher'])
    setConsent(false)
  }, [setAdvertiserInn, setContractorInn, setAdvertiserRole, setContractorRole, setConsent])

  const applyCounterpartyFromList = useCallback((kind: PartyKind, inn: string) => {
    const hit = counterpartiesList.find((c: CounterpartyItem) => c.juridical_details?.inn === inn)
    if (!hit) return

    const displayName = hit.name
    const type = hit.juridical_details?.type
    const info = `${displayName} (${type === 'ip' ? 'ИП' : type === 'juridical' ? 'ЮР лицо' : type === 'physical' ? 'Физ. лицо' : type})`

    if (kind === 'advertiser') {
      setAdvertiserInn(inn)
      setAdvertiserInfo({
        external_id: hit.external_id, // ✅ Set external_id from counterparty
        name: displayName,
        shortWithOpf: null,
        info
      })
      const normalizedRoles = normalizeRoles(hit.roles)
      if (normalizedRoles.length > 0) {
        setAdvertiserRole(normalizedRoles)
      }
    } else {
      setContractorInn(inn)
      setContractorInfo({
        external_id: hit.external_id, // ✅ Set external_id from counterparty
        name: displayName,
        shortWithOpf: null,
        info
      })
      const normalizedRoles = normalizeRoles(hit.roles)
      if (normalizedRoles.length > 0) {
        setContractorRole(normalizedRoles)
      }
    }
  }, [counterpartiesList, setAdvertiserInn, setAdvertiserInfo, setAdvertiserRole, setContractorInn, setContractorInfo, setContractorRole])

  const handleCreateCounterparty = useCallback(async (kind: 'advertiser' | 'publisher') => {
    await createCounterparty(kind)
    refetchCounterparties()
  }, [createCounterparty, refetchCounterparties])

  const isAdvertiserInCounterparties = useMemo(() => {
    return counterpartiesList.some((c: CounterpartyItem) => c.juridical_details?.inn === advertiser.inn)
  }, [counterpartiesList, advertiser.inn])

  const isContractorInCounterparties = useMemo(() => {
    return counterpartiesList.some((c: CounterpartyItem) => c.juridical_details?.inn === contractor.inn)
  }, [counterpartiesList, contractor.inn])

  const handleInnChange = useCallback((kind: PartyKind, value: string) => {
    const cleanValue = value.replace(/\D/g, '')

    if (kind === 'advertiser') {
      setAdvertiserInn(cleanValue)
      if (counterpartiesList.some((c: CounterpartyItem) => c.juridical_details?.inn === cleanValue)) {
        applyCounterpartyFromList('advertiser', cleanValue)
      }
    } else {
      setContractorInn(cleanValue)
      if (counterpartiesList.some((c: CounterpartyItem) => c.juridical_details?.inn === cleanValue)) {
        applyCounterpartyFromList('contractor', cleanValue)
      }
    }
  }, [setAdvertiserInn, setContractorInn, counterpartiesList, applyCounterpartyFromList])

  const recordInnToHistory = useCallback((inn: string) => {
    if (!isValidInn(inn)) return
    // History is automatically handled by wizardStore
  }, [])

  return {
    // State
    advertiser,
    contractor,
    counterpartiesList,
    isLoadingCounterparties: isLoadingCounterparties || isFetchingCounterparties,
    modalField,

    // Actions
    setModalField,
    lookupInn,
    handleCreateCounterparty,
    clearStep1,
    applyCounterpartyFromList,
    handleInnChange,
    recordInnToHistory,
    setAdvertiserRole,
    setContractorRole,

    // Computed
    isAdvertiserInCounterparties,
    isContractorInCounterparties
  }
}
