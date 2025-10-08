import React from 'react'
import { useApp } from '../../context/AppContext'
import { usePartyLookup, useCounterpartiesList } from '../../hooks/usePartyLookup'
import { isValidInn, saveToLocalStorage } from '../../utils'
import { CustomSelect } from '../ui/CustomSelect'
import { PartyModal } from '../ui/PartyModal'
import type { PartyRole, CounterpartyItem } from '../../types'

const LOCAL_KEY = 'vkord-wizard-state'

const ROLE_OPTIONS = [
  { value: 'advertiser', label: 'Рекламодатель' },
  { value: 'agency', label: 'Рекламное агентство' },
  { value: 'ors', label: 'Оператор рекламных систем' },
  { value: 'publisher', label: 'Издатель' }
]

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

export const Step1Parties: React.FC = () => {
  const {
    wizardState,
    loadingState,
    setAdvertiserInn,
    setContractorInn,
    setAdvertiserRole,
    setContractorRole,
    setAdvertiserInfo,
    setContractorInfo,
    setConsent,
    setStep,
    canNextFromStep1
  } = useApp()

  const { lookupInn, createCounterparty } = usePartyLookup()
  const { data: counterpartiesList = [], isLoading: isLoadingCounterparties, isFetching: isFetchingCounterparties, refetch: refetchCounterparties } = useCounterpartiesList()

  const [modalField, setModalField] = React.useState<'advertiser' | 'contractor' | null>(null)

  // Обновляем список при каждом открытии модального окна
  React.useEffect(() => {
    if (modalField) {
      refetchCounterparties()
    }
  }, [modalField, refetchCounterparties])

  const clearStep1 = () => {
    setAdvertiserInn('')
    setContractorInn('')
    setAdvertiserRole(['advertiser'])
    setContractorRole(['publisher'])
    setConsent(false)
  }

  const applyCounterpartyFromList = (kind: 'advertiser' | 'contractor', inn: string) => {
  const hit = counterpartiesList.find((c: CounterpartyItem) => c.juridicalDetails?.inn === inn)
    if (!hit) return

    const displayName = hit.name
    const type = hit.juridicalDetails.type
    const info = `${displayName} (${type === 'ip' ? 'ИП' : type === 'juridical' ? 'ЮР лицо' : type === 'physical' ? 'Физ. лицо' : type})`

    if (kind === 'advertiser') {
      setAdvertiserInn(inn)
      setAdvertiserInfo({
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
        name: displayName,
        shortWithOpf: null,
        info
      })
      const normalizedRoles = normalizeRoles(hit.roles)
      if (normalizedRoles.length > 0) {
        setContractorRole(normalizedRoles)
      }
    }
  }

  const recordInnToHistory = (inn: string) => {
    if (!isValidInn(inn)) return
    // This would be handled by the context automatically
  }

  const isAdvertiserInCounterparties = React.useMemo(() => {
    return counterpartiesList.some((c: CounterpartyItem) => c.juridicalDetails?.inn === wizardState.advertiserInn)
  }, [counterpartiesList, wizardState.advertiserInn])

  const isContractorInCounterparties = React.useMemo(() => {
    return counterpartiesList.some((c: CounterpartyItem) => c.juridicalDetails?.inn === wizardState.contractorInn)
  }, [counterpartiesList, wizardState.contractorInn])

  // Обновляем список контрагентов после создания
  const handleCreateCounterparty = async (kind: 'advertiser' | 'publisher') => {
    await createCounterparty(kind)
    // Перезагружаем список контрагентов
    refetchCounterparties()
  }

  return (
    <>
      <details open={wizardState.step === 1}>
      <summary>1) Контрагенты</summary>
      <div className="vk-card" style={{ marginTop: 10 }}>
        
        <div className="vk-label">ИНН рекламодателя</div>
        <div className="vk-mobile-stack">
          <div className="vk-inline-controls">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                className="vk-input vk-input-inn"
                value={wizardState.advertiserInn}
                list="innHistory"
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  setAdvertiserInn(val)
                  if (counterpartiesList.some((c: CounterpartyItem) => c.juridicalDetails?.inn === val)) {
                    applyCounterpartyFromList('advertiser', val)
                  }
                }}
                onBlur={() => { recordInnToHistory(wizardState.advertiserInn) }}
                autoComplete="on"
                placeholder="10 или 12 цифр"
                maxLength={12}
              />
              <button
                type="button"
                className="vk-btn"
                onClick={() => setModalField('advertiser')}
                aria-label="Выбрать рекламодателя из списка"
              >
                Выбрать
              </button>
            </div>
            <CustomSelect
              options={ROLE_OPTIONS}
              value={wizardState.advertiserRole}
              onChange={value => setAdvertiserRole(value as PartyRole)}
              multiSelect={true}
              hasError={wizardState.advertiserRole.length === 0}
            />

            <button
              className="vk-btn vk-btn--primary"
              disabled={!isValidInn(wizardState.advertiserInn) || loadingState['lookup-advertiser']}
              onClick={() => lookupInn('advertiser')}
            >
              {loadingState['lookup-advertiser'] ? 'Поиск…' : 'Проверить'}
            </button>
            <button
              className="vk-btn"
              disabled={!isValidInn(wizardState.advertiserInn) || wizardState.advertiserRole.length === 0 || loadingState['create-advertiser']}
              onClick={() => handleCreateCounterparty('advertiser')}
            >
              {loadingState['create-advertiser'] ? (isAdvertiserInCounterparties ? 'Обновление…' : 'Создание…') : (isAdvertiserInCounterparties ? 'Обновить в VK ОРД' : 'Создать в VK ОРД')}
            </button>
          </div>
          
        </div>
        {wizardState.advertiserInfo && (
          <div style={{ color: 'var(--vk-muted)', marginTop: 4 }}>
            {wizardState.advertiserInfo}
          </div>
        )}

        <div style={{ height: 14 }} />

        <div className="vk-label">ИНН исполнителя</div>
        <div className="vk-mobile-stack">
          <div className="vk-inline-controls">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input
                className="vk-input vk-input-inn"
                value={wizardState.contractorInn}
                list="innHistory"
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  setContractorInn(val)
                  if (counterpartiesList.some((c: CounterpartyItem) => c.juridicalDetails?.inn === val)) {
                    applyCounterpartyFromList('contractor', val)
                  }
                }}
                onBlur={() => { recordInnToHistory(wizardState.contractorInn) }}
                autoComplete="on"
                placeholder="10 или 12 цифр"
                maxLength={12}
              />
              <button
                type="button"
                className="vk-btn"
                onClick={() => setModalField('contractor')}
                aria-label="Выбрать исполнителя из списка"
              >
                Выбрать
              </button>
            </div>
            <CustomSelect
              options={ROLE_OPTIONS}
              value={wizardState.contractorRole}
              onChange={value => setContractorRole(value as PartyRole)}
              multiSelect={true}
              hasError={wizardState.contractorRole.length === 0}
            />

            <button
              className="vk-btn vk-btn--primary"
              disabled={!isValidInn(wizardState.contractorInn) || loadingState['lookup-contractor']}
              onClick={() => lookupInn('contractor')}
            >
              {loadingState['lookup-contractor'] ? 'Поиск…' : 'Проверить'}
            </button>
            <button
              className="vk-btn"
              disabled={!isValidInn(wizardState.contractorInn) || wizardState.contractorRole.length === 0 || loadingState['create-contractor']}
              onClick={() => handleCreateCounterparty('publisher')}
            >
              {loadingState['create-contractor'] ? (isContractorInCounterparties ? 'Обновление…' : 'Создание…') : (isContractorInCounterparties ? 'Обновить в VK ОРД' : 'Создать в VK ОРД')}
            </button>
          </div>
          
        </div>
        {wizardState.contractorInfo && (
          <div style={{ color: 'var(--vk-muted)', marginTop: 4 }}>
            {wizardState.contractorInfo}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={wizardState.consent}
              onChange={e => setConsent(e.target.checked)}
            />
            Согласен на обработку данных
          </label>
        </div>

        <div className="vk-mobile-button-row">
          <button className="vk-btn" onClick={clearStep1}>
            Очистить поля
          </button>
          <button className="vk-btn" onClick={() => saveToLocalStorage(LOCAL_KEY, wizardState)}>
            Сохранить шаг
          </button>
          <button
            className="vk-btn vk-btn--primary"
            disabled={!canNextFromStep1}
            onClick={() => setStep(2)}
          >
            Далее
          </button>
        </div>
      </div>
    </details>

    {/* Shared datalist for INN suggestions */}
    <datalist id="innHistory">
      {(wizardState.partyHistory || []).map(h => (
        <option key={h.inn} value={h.inn} label={`${h.shortWithOpf || h.fullName || ''}${h.type ? ` (${h.type})` : ''}`} />
      ))}
    </datalist>

    <PartyModal
      open={modalField === 'advertiser'}
      title="Выбор рекламодателя"
      counterparties={counterpartiesList}
      loading={isLoadingCounterparties || isFetchingCounterparties}
      onSelect={(inn) => { applyCounterpartyFromList('advertiser', inn); setModalField(null) }}
      onClose={() => setModalField(null)}
        onEnterManually={(value) => {
          const inn = (value || '').replace(/\D/g, '')
          if (inn) {
            setAdvertiserInn(inn)
          }
          setModalField(null)
        }}
    />
    <PartyModal
      open={modalField === 'contractor'}
      title="Выбор исполнителя"
      counterparties={counterpartiesList}
      loading={isLoadingCounterparties || isFetchingCounterparties}
      onSelect={(inn) => { applyCounterpartyFromList('contractor', inn); setModalField(null) }}
      onClose={() => setModalField(null)}
        onEnterManually={(value) => {
          const inn = (value || '').replace(/\D/g, '')
          if (inn) {
            setContractorInn(inn)
          }
          setModalField(null)
        }}
    />
    </>
  )
}
