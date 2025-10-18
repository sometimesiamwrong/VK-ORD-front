import { Button } from '../ui/button'
import React from 'react'
import {
  useWizardStep,
  useWizardAdvertiser,
  useWizardContractor,
  useWizardContract,
  useWizardLoadingState,
  useWizardActions,
  useCanNextFromStep2
} from '../../stores/wizardStore'
import { useContractAndCreative } from '../../hooks/useContractAndCreative'
import { generateContractExternalId } from '../../utils'

export const Step2Contract: React.FC = () => {
  const currentStep = useWizardStep()
  const advertiser = useWizardAdvertiser()
  const contractor = useWizardContractor()
  const contract = useWizardContract()
  const loadingState = useWizardLoadingState()
  const canNextFromStep2 = useCanNextFromStep2()

  const { setStep, updateContract } = useWizardActions()

  const { saveContract } = useContractAndCreative()

  const clearStep2 = () => {
    updateContract({
      externalId: '',
      serial: null,
      paySum: null,
      payDateEnd: null
    })
  }

  return (
    <details open={currentStep === 2}>
      <summary>2) Договор</summary>
      <div className="vk-card" style={{ marginTop: 10 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            Идентификатор договора
            <input
              className="vk-input"
              value={contract.externalId}
              onChange={e => updateContract({
                externalId: e.target.value
              })}
              onBlur={() => {
                if (!contract.externalId || !contract.externalId.trim()) {
                  updateContract({
                    externalId: generateContractExternalId(new Date(), 1)
                  })
                }
              }}
            />
          </label>
          <label>
            ИНН заказчика
            <input
              className="vk-input vk-input-inn"
              value={advertiser.inn}
              readOnly
            />
          </label>
          <label>
            ИНН исполнителя
            <input
              className="vk-input vk-input-inn"
              value={contractor.inn}
              readOnly
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
          <Button variant="outline" onClick={clearStep2}>
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
  )
}
