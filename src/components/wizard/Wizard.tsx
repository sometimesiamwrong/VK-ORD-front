import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useFileOperations } from '../../hooks/useFileOperations'
import { Button } from '../ui/button'
import { Step1Parties } from '../steps/Step1Parties'
import { Step2Contract } from '../steps/Step2Contract'
import { Step3Creative } from '../steps/Step3Creative'
import { Step4Result } from '../steps/Step4Result'
import { TemplateSelector } from '../../features/wizard/components/TemplateSelector'
import { WizardCreationFlow } from '../../features/wizard/components/WizardCreationFlow'
import { useTemplateById, useIncrementTemplateUse } from '../../features/wizard/hooks/useFlowTemplates'
import { mapTemplateToWizardState } from '../../features/wizard/utils/templateToWizard'
import { useShowCreativeFlow } from '../../stores/wizardStore'
import { useWizardStore } from '../../stores/wizardStore'

export const Wizard: React.FC = () => {
  const { exportJson, importJsonClick, onImportFile, fileRef } = useFileOperations()

  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [loadedTemplateName, setLoadedTemplateName] = useState<string | null>(null)

  const showCreativeFlow = useShowCreativeFlow()

  const { data: templateData, isLoading: isLoadingTemplate } = useTemplateById(selectedTemplateId)
  const incrementUse = useIncrementTemplateUse()

  const { actions } = useWizardStore()

  // Load template data when fetched
  useEffect(() => {
    if (templateData?.value && selectedTemplateId) {
      const mapped = mapTemplateToWizardState(templateData.value)

      console.log('Mapped template to wizard state:', mapped)
      // Fill Step 1: Advertiser
      actions.setAdvertiserInn(mapped.advertiser.inn)
      actions.setAdvertiserInfo({
        external_id: mapped.advertiser.external_id,
        name: mapped.advertiser.name,
        shortWithOpf: mapped.advertiser.shortWithOpf,
        info: mapped.advertiser.info,
        type: mapped.advertiser.juridicalDetails?.type || null
      })
      actions.setAdvertiserRole(mapped.advertiser.role)

      // Fill Step 1: Contractor
      actions.setContractorInn(mapped.contractor.inn)
      actions.setContractorInfo({
        external_id: mapped.contractor.external_id,
        name: mapped.contractor.name,
        shortWithOpf: mapped.contractor.shortWithOpf,
        info: mapped.contractor.info,
        type: mapped.contractor.juridicalDetails?.type || null
      })
      actions.setContractorRole(mapped.contractor.role)

      // Set consent (required for next step)
      actions.setConsent(true)

      // Fill Step 2: Contract
      actions.updateContract({
        externalId: mapped.contract.externalId,
        serial: mapped.contract.serial,
        paySum: mapped.contract.paySum,
        payDateEnd: mapped.contract.payDateEnd
      })

      // Fill Step 3: Creative (only specified fields)
      // ВАЖНО: Генерируем НОВЫЙ externalId при загрузке из шаблона
      actions.updateCreative({
        externalId: Date.now().toString(), // Новый ID креатива
        format: mapped.creative.format as any,
        contractExternalIds: mapped.creative.contractExternalIds,
        contentUrls: mapped.creative.contentUrls,
        kktus: mapped.creative.kktus
      })

      // Mark template as loaded
      actions.setLoadedTemplate(selectedTemplateId)

      // Save template name
      setLoadedTemplateName(templateData.name)

      // Increment use count
      incrementUse.mutate(selectedTemplateId)

      // Reset selected template ID
      setSelectedTemplateId(null)

      // Show creative step after loading template
      actions.setShowCreativeFlow(true)

      toast.success(`Шаблон "${templateData.name}" успешно загружен`)
    }
  }, [templateData, selectedTemplateId, actions, incrementUse])

  const handleProceedToCreative = () => {
    actions.setShowCreativeFlow(true)
    // Закрываем секции 1 и 2, открываем 3
    actions.setSection(1, false)
    actions.setSection(2, false)
    actions.setSection(3, true)
    actions.setStep(3)
  }

  const handleStartOver = () => {
    actions.clearAll()
    setLoadedTemplateName(null)
    toast.info('Начинаем заново')
  }

  return (
    <div className="vk-container" style={{ textAlign: 'left' }}>
      <h1>Маркировка рекламы (VK ОРД)</h1>
      <p>Выберите контрагентов и договор, затем создайте креатив для получения ERID</p>

      {/* Template and Action Buttons */}
      <div className="my-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex gap-3 flex-wrap items-center">
          <Button
            variant="default"
            onClick={() => setSelectorOpen(true)}
            disabled={isLoadingTemplate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md disabled:opacity-50"
          >
            {isLoadingTemplate ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Загрузка...
              </>
            ) : (
              <>📋 Загрузить из шаблона</>
            )}
          </Button>
          {loadedTemplateName && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md border border-blue-300 shadow-sm">
              <span className="text-sm text-gray-600">Из шаблона:</span>
              <span className="text-sm font-semibold text-blue-700">{loadedTemplateName}</span>
            </div>
          )}
          {showCreativeFlow && (
            <Button
              variant="outline"
              onClick={handleStartOver}
              className="border-gray-700 hover:bg-gray-50"
            >
              🔄 Начать сначала
            </Button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          style={{ display: 'none' }}
          onChange={onImportFile}
        />
      </div>

      {/* Alternative UI: Quick flow for party and contract selection */}
      {!showCreativeFlow && (
        <div className="mt-8 mb-8">
          <WizardCreationFlow onProceedToCreative={handleProceedToCreative} />
        </div>
      )}

      {/* Standard step-by-step wizard (shown only when creative step is active) */}
      {showCreativeFlow && (
        <div className="space-y-8">
          <Step1Parties />
          <Step2Contract />
          <Step3Creative />
          <Step4Result />
        </div>
      )}

      <TemplateSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={(id) => setSelectedTemplateId(id)}
      />
    </div>
  )
}