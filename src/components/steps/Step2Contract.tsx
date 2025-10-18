import { Button } from '../ui/button'
import React from 'react'
import { useApp } from '../../context/AppContext'
import { useContractAndCreative } from '../../hooks/useContractAndCreative'
import { generateContractExternalId } from '../../utils'

export const Step2Contract: React.FC = () => {
  const {
    wizardState,
    loadingState,
    setContractData,
    setStep,
    canNextFromStep2
  } = useApp()

  const { saveContract } = useContractAndCreative()

  const clearStep2 = () => {
    setContractData({
      externalId: '',
      serial: null,
      paySum: null,
      Date: null,
      DateEnd: null,
    })
  }

  return (
    <details open={wizardState.step === 2}>
      <summary>2) Договор</summary>
      <div className="vk-card" style={{ marginTop: 10 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            Идентификатор договора
            <input
              className="vk-input"
              value={wizardState.contractExternalId}
              onChange={e => setContractData({
                externalId: e.target.value,
                paySum: wizardState.paySum,
                payDateEnd: wizardState.payDateEnd
              })}
              onBlur={() => {
                if (!wizardState.contractExternalId || !wizardState.contractExternalId.trim()) {
                  setContractData({
                    externalId: generateContractExternalId(new Date(), 1),
                    paySum: wizardState.paySum,
                    payDateEnd: wizardState.payDateEnd
                  })
                }
              }}
            />
          </label>
          <label>
            ИНН заказчика
            <input
              className="vk-input vk-input-inn"
              value={wizardState.advertiserInn}
              readOnly
            />
          </label>
          <label>
            ИНН исполнителя
            <input
              className="vk-input vk-input-inn"
              value={wizardState.contractorInn}
              readOnly
            />
          </label>
          <label>
            Сумма оплаты (paySum)
            <input
              className="vk-input"
              type="number"
              min={1}
              value={wizardState.paySum || ''}
              onChange={e => setContractData({
                externalId: wizardState.contractExternalId,
                serial: wizardState.serial,
                paySum: Number(e.target.value) || null,
                payDateEnd: wizardState.payDateEnd
              })}
            />
          </label>
          <label>
            Дата окончания оплаты (payDateEnd)
            <input
              className="vk-input"
              type="date"
              value={wizardState.payDateEnd || ''}
              onChange={e => setContractData({
                externalId: wizardState.contractExternalId,
                serial: wizardState.serial,
                paySum: wizardState.paySum,
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
