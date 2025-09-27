import React from 'react'
import { useApp } from '../../context/AppContext'
import { usePartyLookup } from '../../hooks/usePartyLookup'
import { isValidInn, saveToLocalStorage } from '../../utils'
import { CustomSelect } from '../ui/CustomSelect'
import type { PartyRole } from '../../types'

const LOCAL_KEY = 'vkord-wizard-state'

const ROLE_OPTIONS = [
  { value: 'advertiser', label: 'Рекламодатель' },
  { value: 'agency', label: 'Рекламное агентство' },
  { value: 'publisher', label: 'Издатель' }
]

export const Step1Parties: React.FC = () => {
  const {
    wizardState,
    loadingState,
    setAdvertiserInn,
    setContractorInn,
    setAdvertiserRole,
    setContractorRole,
    setConsent,
    setStep,
    canNextFromStep1
  } = useApp()

  const { lookupInn, createCounterparty } = usePartyLookup()

  const clearStep1 = () => {
    setAdvertiserInn('')
    setContractorInn('')
    setAdvertiserRole(['advertiser'])
    setContractorRole(['publisher'])
    setConsent(false)
  }

  const applyInnFromHistory = (kind: 'advertiser' | 'contractor', inn: string) => {
    const hit = (wizardState.partyHistory || []).find(h => h.inn === inn)
    if (!hit) return

    if (kind === 'advertiser') {
      setAdvertiserInn(inn)
    } else {
      setContractorInn(inn)
    }
  }

  const recordInnToHistory = (inn: string) => {
    if (!isValidInn(inn)) return
    // This would be handled by the context automatically
  }

  return (
    <>
      <details open={wizardState.step === 1}>
      <summary>1) Контрагенты</summary>
      <div className="vk-card" style={{ marginTop: 10 }}>
        <div className="vk-label">ИНН рекламодателя</div>
        <div className="vk-mobile-stack">
          <div className="vk-inline-controls">
            <input
              className="vk-input vk-input-inn"
              value={wizardState.advertiserInn}
              list="innHistory"
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '')
                setAdvertiserInn(val)
                if ((wizardState.partyHistory || []).some(h => h.inn === val)) {
                  applyInnFromHistory('advertiser', val)
                }
              }}
              onBlur={() => recordInnToHistory(wizardState.advertiserInn)}
              autoComplete="on"
              placeholder="10 или 12 цифр"
              maxLength={12}
            />
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
              onClick={() => createCounterparty('advertiser')}
            >
              {loadingState['create-advertiser'] ? 'Создание…' : 'Создать в VK ОРД'}
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
            <input
              className="vk-input vk-input-inn"
              value={wizardState.contractorInn}
              list="innHistory"
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '')
                setContractorInn(val)
                if ((wizardState.partyHistory || []).some(h => h.inn === val)) {
                  applyInnFromHistory('contractor', val)
                }
              }}
              onBlur={() => recordInnToHistory(wizardState.contractorInn)}
              autoComplete="on"
              placeholder="10 или 12 цифр"
              maxLength={12}
            />
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
              onClick={() => createCounterparty('publisher')}
            >
              {loadingState['create-contractor'] ? 'Создание…' : 'Создать в VK ОРД'}
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
    </>
  )
}
