import React from 'react'
import { useApp } from '../../context/AppContext'
import { useFileOperations } from '../../hooks/useFileOperations'

export const Step4Result: React.FC = () => {
  const { wizardState, clearAll } = useApp()
  const { exportJson } = useFileOperations()

  if (wizardState.step !== 4 || !wizardState.erid) {
    return null
  }

  const advertiserShortWithOpf = wizardState.advertiserShortWithOpf || wizardState.advertiserName || ''
  const copyText = `Реклама. ${advertiserShortWithOpf}, ИНН ${wizardState.advertiserInn || ''}, erid ${wizardState.erid || ''}`

  return (
    <>
      <div className="vk-card" style={{ padding: 22 }}>
        <h2>ERID</h2>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{wizardState.erid}</div>
        <div className="vk-mobile-button-row">
          <button
            className="vk-btn"
            onClick={() => navigator.clipboard.writeText(wizardState.erid || '')}
          >
            Скопировать ERID
          </button>
          <button
            className="vk-btn"
            onClick={() => {
              const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wizardState.erid || '')}`
              window.open(url, '_blank')
            }}
          >
            QR‑код
          </button>
          <button className="vk-btn" onClick={() => window.print()}>
            Печать
          </button>
          <button className="vk-btn vk-btn--secondary" onClick={exportJson}>
            Экспорт JSON
          </button>
          <button
            className="vk-btn vk-btn--danger vk-btn-hover-muted"
            onClick={clearAll}
          >
            Начать сначала
          </button>
        </div>
      </div>
      <div className="vk-card" style={{ marginTop: 14, padding: 22 }}>
        <h3>Текст для копирования</h3>
        <pre className="vk-pre">{copyText}</pre>
        <div className="vk-mobile-button-row">
          <button
            className="vk-btn vk-btn--primary"
            onClick={() => navigator.clipboard.writeText(copyText)}
          >
            Скопировать текст
          </button>
        </div>
      </div>
    </>
  )
}
