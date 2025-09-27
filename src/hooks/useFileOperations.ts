import { useRef } from 'react'
import { useApp } from '../context/AppContext'
import { saveToLocalStorage } from '../utils'

const LOCAL_KEY = 'vkord-wizard-state'

export const useFileOperations = () => {
  const { wizardState, setMessage } = useApp()
  const fileRef = useRef<HTMLInputElement | null>(null)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(wizardState, null, 2)], { type: 'application/json' })
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
        // Load the parsed state (this will be handled by the context)
        Object.keys(parsed).forEach(key => {
          if (key in wizardState) {
            // This is a simplified approach - in a real app you'd dispatch actions
            // For now, we'll just update localStorage and reload
            saveToLocalStorage(LOCAL_KEY, parsed)
            window.location.reload()
          }
        })
        setMessage('Импорт выполнен', 'success')
      } catch {
        setMessage('Не удалось импортировать JSON', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return { exportJson, importJsonClick, onImportFile, fileRef }
}

