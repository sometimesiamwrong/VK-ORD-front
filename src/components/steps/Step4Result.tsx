import { Button } from '../ui/button'
import React, { useState } from 'react'
import {
  useWizardStep,
  useWizardAdvertiser,
  useWizardContractor,
  useWizardContract,
  useWizardCreative,
  useWizardErid,
  useWizardActions,
  useWizardStore
} from '../../stores/wizardStore'
import { useFileOperations } from '../../hooks/useFileOperations'
import { TemplateSaver } from '../../features/wizard/components/TemplateSaver'
import { mapWizardStateToTemplate } from '../../features/wizard/utils/wizardToTemplate'

export const Step4Result: React.FC = () => {
  const currentStep = useWizardStep()
  const advertiser = useWizardAdvertiser()
  const contractor = useWizardContractor()
  const contract = useWizardContract()
  const creative = useWizardCreative()
  const erid = useWizardErid()
  const { loadedTemplateId } = useWizardStore()
  const { clearAll } = useWizardActions()

  const [saverOpen, setSaverOpen] = useState(false)

  // Map current wizard state to template data
  // This ensures templateData always contains the LATEST creative_external_id
  const templateData = mapWizardStateToTemplate({
    advertiser,
    contractor,
    contract,
    creative
  })

  if (currentStep !== 4 || !erid) {
    return null
  }

  const advertiserShortWithOpf = advertiser.shortWithOpf || advertiser.name || ''
  const copyText = `Реклама. ${advertiserShortWithOpf}, ИНН ${advertiser.inn || ''}, erid ${erid || ''}`

  return (
    <>
      <div className="vk-card" style={{ padding: 22 }}>
        <h2>ERID</h2>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{erid}</div>
        <div className="vk-mobile-button-row">
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(erid || '')}
          >
            Скопировать ERID
          </Button>
          <Button variant="outline"  className="border-gray-700 hover:bg-gray-50" onClick={() => setSaverOpen(true)}>
            💾 Сохранить шаблон
          </Button>
          <Button
            variant="outline"
            className="border-red-700 bg-red-100 hover:bg-gray-50"
            onClick={clearAll}
          >
            🔄 Сбросить
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

      <TemplateSaver
        open={saverOpen}
        onClose={() => setSaverOpen(false)}
        templateData={templateData}
        existingTemplateId={loadedTemplateId}
      />
    </>
  )
}
