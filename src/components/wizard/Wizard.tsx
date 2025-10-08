import React from 'react'
import { useApp } from '../../context/AppContext'
import { useFileOperations } from '../../hooks/useFileOperations'
import { CredentialSelector } from '../ui/CredentialSelector'
import { ToastNotification } from '../ui/ToastNotification'
import { Step1Parties } from '../steps/Step1Parties'
import { Step2Contract } from '../steps/Step2Contract'
import { Step3Creative } from '../steps/Step3Creative'
import { Step4Result } from '../steps/Step4Result'

export const Wizard: React.FC = () => {
  const {
    wizardState,
    messageState,
    setVkApiKey,
    setUseSandbox,
    clearMessage
  } = useApp()

  const { exportJson, importJsonClick, onImportFile, fileRef } = useFileOperations()

  return (
    <div className="vk-container" style={{ textAlign: 'left' }}>
      <CredentialSelector
        vkApiKey={wizardState.vkApiKey || null}
        useSandbox={wizardState.useSandbox}
        onVkApiKeyChange={setVkApiKey}
        onUseSandboxChange={setUseSandbox}
      />

      <h1>Маркировка рекламы (VK ОРД)</h1>
      <p>Шаги: Контрагенты → Договор → Креатив → ERID</p>

      <div className="vk-mobile-row" style={{ marginTop: 12, marginBottom: 20 }}>
        <button className="vk-btn vk-btn--secondary" onClick={exportJson}>
          Экспорт JSON
        </button>
        <button className="vk-btn vk-btn--secondary" onClick={importJsonClick}>
          Импорт JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={onImportFile}
        />
      </div>

      <Step1Parties />
      <Step2Contract />
      <Step3Creative />
      <Step4Result />

      <ToastNotification
        message={messageState}
        onClose={clearMessage}
      />
    </div>
  )
}

