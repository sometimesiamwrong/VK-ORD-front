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
      date: null,
      dateEnd: null,
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
                serial: wizardState.serial,
                paySum: wizardState.paySum,
                date: wizardState.date,
                dateEnd: wizardState.dateEnd
              })}
              onBlur={() => {
                if (!wizardState.contractExternalId || !wizardState.contractExternalId.trim()) {
                  setContractData({
                    externalId: generateContractExternalId(new Date(), 1),
                    serial: wizardState.serial,
                    paySum: wizardState.paySum,
                    date: wizardState.date,
                    dateEnd: wizardState.dateEnd
                  })
                }
              }}
            />
          </label>
          <label>
            Серийный номер (serial)
            <input
              className="vk-input"
              value={wizardState.serial || ''}
              onChange={e => setContractData({
                externalId: wizardState.contractExternalId,
                serial: e.target.value || null,
                paySum: wizardState.paySum,
                date: wizardState.date,
                dateEnd: wizardState.dateEnd
              })}
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
                date: wizardState.date,
                dateEnd: wizardState.dateEnd
              })}
            />
          </label>
          <label>
            Дата заключения договора
            <input
              className="vk-input"
              type="date"
              required
              value={wizardState.date || ''}
              onChange={e => setContractData({
                externalId: wizardState.contractExternalId,
                serial: wizardState.serial,
                paySum: wizardState.paySum,
                date: e.target.value || null,
                dateEnd: wizardState.dateEnd
              })}
            />
          </label>
          <label>
            Дата окончания договора
            <input
              className="vk-input"
              type="date"
              value={wizardState.dateEnd || ''}
              onChange={e => setContractData({
                externalId: wizardState.contractExternalId,
                serial: wizardState.serial,
                paySum: wizardState.paySum,
                date: wizardState.date,
                dateEnd: e.target.value || null
              })}
            />
          </label>
        </div>
        <div className="vk-mobile-button-row">
          <button className="vk-btn" onClick={clearStep2}>
            Очистить поля
          </button>
          <button className="vk-btn" onClick={() => setStep(1)}>
            Назад
          </button>
          <button
            className="vk-btn vk-btn--primary"
            disabled={loadingState['contract']}
            onClick={saveContract}
          >
            {loadingState['contract'] ? 'Сохранение…' : 'Сохранить'}
          </button>
          <button
            className="vk-btn vk-btn--primary"
            disabled={!canNextFromStep2}
            onClick={() => setStep(3)}
          >
            Далее
          </button>
        </div>
      </div>
    </details>
  )
}
