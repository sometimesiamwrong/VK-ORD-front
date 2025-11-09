import { useState, useCallback } from 'react'
import { useWizardCreative, useWizardActions } from '../../../stores/wizardStore'
import { useContractAndCreative } from '../../../hooks/useContractAndCreative'
import { nowTimestampString } from '../../../utils'
import { VkOrdCreativeForm } from '../../../types'
import type { AiKktyItem } from '../../../types'

const parseList = (input: string): string[] => {
  return input
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

const isLikelyUrl = (value: string): boolean => {
  const v = value.trim()
  if (!v) return false
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export const useStep3Logic = () => {
  const creative = useWizardCreative()
  const { updateCreative, setCreativeMediaFiles, setErid } = useWizardActions()
  const { createCreative, guessKktyByText } = useContractAndCreative()

  const [kktyHints, setKktyHints] = useState<AiKktyItem[]>([])
  const [contentUrlDraft, setContentUrlDraft] = useState('')

  const clearStep3 = useCallback(() => {
    // ВАЖНО: Генерируем НОВЫЙ externalId при очистке полей
    updateCreative({
      externalId: nowTimestampString(),
      contractExternalIds: [],
      kktus: [],
      format: VkOrdCreativeForm.Banner,
      contentUrls: [],
      text: null,
      name: null
    })
    setCreativeMediaFiles([])
    setKktyHints([])
    // Сбрасываем ERID, чтобы кнопка снова показывала "Получить ERID"
    setErid(null)
  }, [updateCreative, setCreativeMediaFiles, setErid])

  const handleGuessKkty = useCallback(async () => {
    const hints = await guessKktyByText()
    if (hints) {
      // Преобразуем KktyItem[] в AiKktyItem[] (фильтруем null/undefined)
      const validHints = hints.filter((h): h is AiKktyItem => 
        !!h.code && !!h.fullName && !!h.reason && h.relevanceScore !== undefined
      )
      setKktyHints(validHints)
    }
  }, [guessKktyByText])

  const addUrls = useCallback((values: string[]) => {
    const normalized = values
      .map(v => v.trim())
      .filter(Boolean)
      .filter(isLikelyUrl)
    if (normalized.length === 0) return
    const existing = creative.contentUrls || []
    const merged = Array.from(new Set([...existing, ...normalized]))
    updateCreative({
      contentUrls: merged
    })
  }, [creative.contentUrls, updateCreative])

  const addFromDraft = useCallback(() => {
    if (!contentUrlDraft.trim()) return
    const parts = parseList(contentUrlDraft)
    addUrls(parts)
    setContentUrlDraft('')
  }, [contentUrlDraft, addUrls])

  const removeUrlAt = useCallback((index: number) => {
    const next = (creative.contentUrls || []).filter((_, i) => i !== index)
    updateCreative({
      contentUrls: next
    })
  }, [creative.contentUrls, updateCreative])

  const handleUrlPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData?.getData('text') || ''
    const list = parseList(text)
    if (list.length > 1) {
      e.preventDefault()
      addUrls(list)
    }
  }, [addUrls])

  const handleUrlKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault()
      addFromDraft()
    }
  }, [addFromDraft])

  return {
    // State
    creative,
    kktyHints,
    contentUrlDraft,

    // Actions
    setContentUrlDraft,
    updateCreative,
    setCreativeMediaFiles,
    createCreative,
    clearStep3,
    handleGuessKkty,
    addFromDraft,
    removeUrlAt,
    handleUrlPaste,
    handleUrlKeyDown,

    // Utils
    parseList
  }
}
