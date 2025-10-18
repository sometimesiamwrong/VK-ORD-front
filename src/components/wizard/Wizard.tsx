import React from 'react'
import { useFileOperations } from '../../hooks/useFileOperations'
import { CredentialSelector } from '../ui/CredentialSelector'
import { Button } from '../ui/button'
import { Step1Parties } from '../steps/Step1Parties'
import { Step2Contract } from '../steps/Step2Contract'
import { Step3Creative } from '../steps/Step3Creative'
import { Step4Result } from '../steps/Step4Result'

export const Wizard: React.FC = () => {
  const { exportJson, importJsonClick, onImportFile, fileRef } = useFileOperations()

  return (
    <div className="vk-container" style={{ textAlign: 'left' }}>
      <CredentialSelector />

      <h1>Маркировка рекламы (VK ОРД)</h1>
      <p>Шаги: Контрагенты → Договор → Креатив → ERID</p>

      <div className="flex gap-2 my-5">
        <Button variant="outline" onClick={exportJson}>
          Экспорт JSON
        </Button>
        <Button variant="outline" onClick={importJsonClick}>
          Импорт JSON
        </Button>
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
    </div>
  )
}