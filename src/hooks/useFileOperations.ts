import { useRef } from 'react'
import { useWizardStore } from '../stores/wizardStore'
import { toast } from 'sonner'
import { saveToLocalStorage } from '../utils'

const LOCAL_KEY = 'vkord-wizard-state'

export const useFileOperations = () => {
  const wizardState = useWizardStore()
  const fileRef = useRef<HTMLInputElement | null>(null)

  const exportJson = () => {
    // Export only the data fields, not actions
    const dataToExport = {
      currentStep: wizardState.currentStep,
      consent: wizardState.consent,
      advertiser: wizardState.advertiser,
      contractor: wizardState.contractor,
      contract: wizardState.contract,
      creative: {
        externalId: wizardState.creative.externalId,
        contractExternalIds: wizardState.creative.contractExternalIds,
        kktus: wizardState.creative.kktus,
        format: wizardState.creative.format,
        contentUrls: wizardState.creative.contentUrls,
        text: wizardState.creative.text,
        name: wizardState.creative.name
      },
      erid: wizardState.erid,
      partyHistory: wizardState.partyHistory
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vkord-state-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJsonClick = () => {
    fileRef.current?.click()
  }

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        // Save to localStorage - Zustand persist middleware will handle loading
        saveToLocalStorage(LOCAL_KEY, parsed)
        window.location.reload()
        toast.success('Импорт выполнен')
      } catch {
        toast.error('Не удалось импортировать JSON')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return { exportJson, importJsonClick, onImportFile, fileRef }
}

