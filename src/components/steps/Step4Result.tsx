import { Button } from '../ui/button'
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
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(wizardState.erid || '')}
          >
            Скопировать ERID
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(wizardState.erid || '')}`
              window.open(url, '_blank')
            }}
          >
            QR‑код
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            Печать
          </Button>
          <Button variant="secondary" onClick={exportJson}>
            Экспорт JSON
          </Button>
          <Button
            variant="destructive"
            onClick={clearAll}
          >
            Начать сначала
          </Button>
        </div>
      </div>
      <div className="vk-card" style={{ marginTop: 14, padding: 22 }}>
        <h3>Текст для копирования</h3>
        <pre className="vk-pre">{copyText}</pre>
        <div className="vk-mobile-button-row">
          <Button
            onClick={() => navigator.clipboard.writeText(copyText)}
          >
            Скопировать текст
          </Button>
        </div>
      </div>
    </>
  )
}
