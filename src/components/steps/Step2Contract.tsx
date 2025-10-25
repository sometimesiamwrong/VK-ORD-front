import { Button } from '../ui/button'
import React from 'react'
import {
  useWizardStep,
  useWizardLoadingState,
  useWizardActions,
  useCanNextFromStep2,
  useWizardStore,
  useWizardOpenSections
} from '../../stores/wizardStore'
import { useContractAndCreative } from '../../hooks/useContractAndCreative'
import { TemplateIndicator } from '../../features/wizard/components/TemplateIndicator'
import { useStep2Logic } from '../../features/wizard/hooks/useStep2Logic'
import { ContractSelector } from '../../features/wizard/components/ContractSelector'

export const Step2Contract: React.FC = () => {
  const currentStep = useWizardStep()
  const loadingState = useWizardLoadingState()
  const canNextFromStep2 = useCanNextFromStep2()
  const { isTemplateLoaded } = useWizardStore()
  const openSections = useWizardOpenSections()

  const { setStep, toggleSection } = useWizardActions()

  const { saveContract } = useContractAndCreative()

  const {
    contract,
    advertiser,
    contractor,
    contractsBetween,
    isLoadingContracts,
    showContractSelector,
    hasContractsBetween,
    setShowContractSelector,
    applySelectedContract,
    clearContract,
    updateContract
  } = useStep2Logic()

  // Проверяем, выбраны ли оба контрагента
  const canShowContractSelector = advertiser.inn && contractor.inn && advertiser.external_id && contractor.external_id

  return (
    <>
      <details
        open={openSections[2]}
        onToggle={(e) => {
          const isOpen = (e.target as HTMLDetailsElement).open
          if (isOpen !== openSections[2]) {
            toggleSection(2)
          }
        }}
      >
        <summary>
          2) Договор
          {isTemplateLoaded && <TemplateIndicator />}
        </summary>
        <div className="vk-card" style={{ marginTop: 10 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            {/* Информация о контрагентах */}
            <div style={{ 
              padding: '12px', 
              backgroundColor: 'var(--vk-bg-secondary, #f5f5f5)', 
              borderRadius: '6px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--vk-muted, #666)', marginBottom: '4px' }}>
                    Рекламодатель
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {advertiser.info || advertiser.name || advertiser.inn || 'Не выбран'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--vk-muted, #666)', marginBottom: '4px' }}>
                    Исполнитель
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>
                    {contractor.info || contractor.name || contractor.inn || 'Не выбран'}
                  </div>
                </div>
              </div>
              
              {/* Кнопка выбора существующего договора */}
              {canShowContractSelector && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--vk-border, #ddd)' }}>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowContractSelector(true)}
                    style={{ width: '100%' }}
                  >
                    {hasContractsBetween 
                      ? `Выбрать существующий договор (${contractsBetween.length})`
                      : 'Проверить существующие договора'
                    }
                  </Button>
                  {hasContractsBetween && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--vk-success, #4caf50)', 
                      marginTop: '6px',
                      textAlign: 'center'
                    }}>
                      Найдено {contractsBetween.length} {contractsBetween.length === 1 ? 'договор' : contractsBetween.length < 5 ? 'договора' : 'договоров'} между контрагентами
                    </div>
                  )}
                </div>
              )}
            </div>

            <label>
              Номер договора (необязательно)
              <input
                className="vk-input"
                value={contract.serial || ''}
                onChange={e => updateContract({
                  serial: e.target.value || null
                })}
                placeholder="Можно оставить пустым"
              />
            </label>
            
            <label>
              Сумма оплаты (paySum)
              <input
                className="vk-input"
                type="number"
                min={1}
                value={contract.paySum || ''}
                onChange={e => updateContract({
                  paySum: Number(e.target.value) || null
                })}
              />
            </label>
            <label>
              Дата окончания оплаты (payDateEnd)
              <input
                className="vk-input"
                type="date"
                value={contract.payDateEnd || ''}
                onChange={e => updateContract({
                  payDateEnd: e.target.value || null
                })}
              />
            </label>
          </div>
          <div className="vk-mobile-button-row">
            <Button variant="outline" onClick={clearContract}>
              Очистить поля
            </Button>
            <Button variant="outline" onClick={() => setStep(1)}>
              Назад
            </Button>
            <Button
              disabled={loadingState['contract']}
              onClick={saveContract}
            >
              {loadingState['contract'] ? 'Сохранение…' : 'Сохранить'}
            </Button>
            <Button
              disabled={!canNextFromStep2}
              onClick={() => setStep(3)}
            >
              Далее
            </Button>
          </div>
        </div>
      </details>

      {/* Модальное окно выбора договора */}
      <ContractSelector
        open={showContractSelector}
        onClose={() => setShowContractSelector(false)}
        onSelect={applySelectedContract}
        contracts={contractsBetween}
        loading={isLoadingContracts}
        advertiserName={advertiser.name || advertiser.info || undefined}
        contractorName={contractor.name || contractor.info || undefined}
      />
    </>
  )
}
