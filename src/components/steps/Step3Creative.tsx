import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useContractAndCreative } from '../../hooks/useContractAndCreative'
import { CustomSelect } from '../ui/CustomSelect'
import { TagSelector } from '../ui/TagSelector'
import { FileUploader } from '../ui/FileUploader'
import { nowTimestampString } from '../../utils'
import { VkOrdCreativeForm } from '../../types'
import type { AiKktyItem } from '../../types'

const FORMAT_OPTIONS = [
  { value: VkOrdCreativeForm.Banner.toString(), label: 'Баннер' },
  { value: VkOrdCreativeForm.TextBlock.toString(), label: 'Текст' },
  { value: VkOrdCreativeForm.TextGraphicBlock.toString(), label: 'Текстовый графический блок' },
  { value: VkOrdCreativeForm.Audio.toString(), label: 'Аудио' },
  { value: VkOrdCreativeForm.Video.toString(), label: 'Видео' },
  { value: VkOrdCreativeForm.LiveAudio.toString(), label: 'Аудио эфир' },
  { value: VkOrdCreativeForm.LiveVideo.toString(), label: 'Видео эфир' },
  { value: VkOrdCreativeForm.TextVideoBlock.toString(), label: 'Текстовый блок с видео' },
  { value: VkOrdCreativeForm.TextGraphicVideoBlock.toString(), label: 'Текстово-графический блок с видео' },
  { value: VkOrdCreativeForm.TextAudioBlock.toString(), label: 'Текстовый блок с аудио' },
  { value: VkOrdCreativeForm.TextGraphicAudioBlock.toString(), label: 'Текстово-графический блок с аудио' },
  { value: VkOrdCreativeForm.TextAudioVideoBlock.toString(), label: 'Текстово блок с аудио и видео' },
  { value: VkOrdCreativeForm.TextGraphicAudioVideoBlock.toString(), label: 'Текстово-графический блок с аудио и видео' },
  { value: VkOrdCreativeForm.BannerHtml5.toString(), label: 'HTML5 баннер' }
]

const parseList = (input: string): string[] => {
  return input
    .split(/[\n,;]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

export const Step3Creative: React.FC = () => {
  const {
    wizardState,
    loadingState,
    setCreativeData,
    setStep,
    canSubmitCreative
  } = useApp()

  const { createCreative, guessKktyByText } = useContractAndCreative()
  const [kktyHints, setKktyHints] = useState<AiKktyItem[]>([])
  const [contentUrlDraft, setContentUrlDraft] = useState('')

  const clearStep3 = () => {
    setCreativeData({
      creativeExternalId: nowTimestampString(),
      contractExternalIds: [],
      kktus: [],
      format: VkOrdCreativeForm.Banner,
      contentUrls: [],
      targetAudience: null,
      text: null,
      name: null,
      mediaFiles: []
    })
    setKktyHints([])
  }

  const handleGuessKkty = async () => {
    const hints = await guessKktyByText()
    if (hints) {
      setKktyHints(hints)
    }
  }

  const isLikelyUrl = (value: string) => {
    const v = value.trim()
    if (!v) return false
    try {
      const u = new URL(v)
      return u.protocol === 'http:' || u.protocol === 'https:'
    } catch {
      return false
    }
  }

  const addUrls = (values: string[]) => {
    const normalized = values
      .map(v => v.trim())
      .filter(Boolean)
      .filter(isLikelyUrl)
    if (normalized.length === 0) return
    const existing = wizardState.contentUrls || []
    const merged = Array.from(new Set([...existing, ...normalized]))
    setCreativeData({
      ...wizardState,
      contentUrls: merged
    })
  }

  const addFromDraft = () => {
    if (!contentUrlDraft.trim()) return
    const parts = parseList(contentUrlDraft)
    addUrls(parts)
    setContentUrlDraft('')
  }

  const removeUrlAt = (index: number) => {
    const next = (wizardState.contentUrls || []).filter((_, i) => i !== index)
    setCreativeData({
      ...wizardState,
      contentUrls: next
    })
  }

  return (
    <details open={wizardState.step === 3}>
      <summary>3) Креатив</summary>
      <div className="vk-card" style={{ marginTop: 10 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            Идентификатор креатива
            <input
              className="vk-input"
              value={wizardState.creativeExternalId}
              onChange={e => setCreativeData({
                ...wizardState,
                creativeExternalId: e.target.value
              })}
            />
          </label>
          <label>
            Идентификатор договора
            <input
              className="vk-input"
              value={wizardState.contractExternalIds.join(',')}
              onChange={e => setCreativeData({
                ...wizardState,
                contractExternalIds: parseList(e.target.value)
              })}
              placeholder={wizardState.contractExternalId}
            />
          </label>
          <label>
            Формат
            <CustomSelect
              options={FORMAT_OPTIONS}
              value={wizardState.format?.toString() || VkOrdCreativeForm.Banner.toString()}
              onChange={value => setCreativeData({
                ...wizardState,
                format: parseInt(value as string) as VkOrdCreativeForm
              })}
              size="wide"
            />
          </label>
          <label>
            Ссылки на контент
            <input
              className="vk-input"
              value={contentUrlDraft}
              onChange={e => setContentUrlDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
                  e.preventDefault()
                  addFromDraft()
                }
              }}
              onBlur={addFromDraft}
              onPaste={e => {
                const text = e.clipboardData?.getData('text') || ''
                const list = parseList(text)
                if (list.length > 1) {
                  e.preventDefault()
                  addUrls(list)
                }
              }}
              placeholder="Вставьте ссылку и нажмите Enter"
            />
            {(wizardState.contentUrls && wizardState.contentUrls.length > 0) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {wizardState.contentUrls.map((url, idx) => (
                  <span
                    key={url + idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 8px',
                      background: 'var(--vk-primary)',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 500
                    }}
                    title={url}
                  >
                    {url}
                    <button
                      onClick={() => removeUrlAt(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1,
                        padding: 0
                      }}
                      aria-label="Удалить ссылку"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </label>
          <label>
            Целевая аудитория
            <input
              className="vk-input"
              value={wizardState.targetAudience || ''}
              onChange={e => setCreativeData({
                ...wizardState,
                targetAudience: e.target.value
              })}
            />
          </label>
          <label>
            Название креатива
            <input
              className={`vk-input ${!wizardState.name?.trim() ? 'error' : ''}`}
              value={wizardState.name || ''}
              onChange={e => setCreativeData({
                ...wizardState,
                name: e.target.value
              })}
              placeholder="Введите название креатива..."
            />
          </label>
          <label>
            Текст
            <textarea
              className={`vk-textarea ${!wizardState.text?.trim() ? 'error' : ''}`}
              value={wizardState.text || ''}
              onChange={e => setCreativeData({
                ...wizardState,
                text: e.target.value
              })}
              rows={4}
              placeholder="Опишите ваш креатив или текст рекламы..."
            />
          </label>

          {/* AI KKTY Suggestions with relevance highlighting */}
          {kktyHints.length > 0 && (
            <div className="vk-card" style={{ marginTop: 6 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                {kktyHints
                  .slice()
                  .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
                  .map((h, idx) => {
                    const score = typeof h.relevanceScore === 'number' ? h.relevanceScore : 0
                    const isHigh = score >= 0.9
                    const isMedium = !isHigh && score >= 0.6
                    const badgeClass = isHigh
                      ? 'vk-badge vk-badge--score-high'
                      : isMedium
                        ? 'vk-badge vk-badge--score-medium'
                        : ''
                    const badgeLabel = isHigh ? 'Главная тема' : isMedium ? 'Важная деталь' : ''
                    return (
                      <div key={idx} style={{ display: 'grid', gap: 2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ fontWeight: 700 }}>
                            {h.code}: {h.fullName}
                          </div>
                          {badgeClass && (
                            <span className={badgeClass} title={`relevanceScore: ${score.toFixed(2)}`}>
                              {badgeLabel}
                            </span>
                          )}
                        </div>
                        <div style={{ color: 'var(--vk-muted)' }}>{h.reason}</div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          <div className="vk-mobile-row" style={{ justifyContent: 'center', gap: 20 }}>
            <button
              className="vk-btn vk-btn-magic"
              style={{ marginTop: 8, marginBottom: 8 }}
              disabled={!wizardState.text?.trim() || loadingState['ai-kkty']}
              onClick={handleGuessKkty}
            >
              {loadingState['ai-kkty'] ? '✨ Подбор…' : '✨ Узнать ККТУ по тексту'}
            </button>
          </div>

          <TagSelector
            selectedCodes={wizardState.kktus && wizardState.kktus.length > 0 ? wizardState.kktus[0] : ''}
            onChange={code => setCreativeData({
              ...wizardState,
              kktus: code ? [code] : []
            })}
            hasError={!(wizardState.kktus && Array.isArray(wizardState.kktus) && wizardState.kktus.length > 0)}
          />

          <FileUploader
            mediaFiles={wizardState.mediaFiles}
            onChange={(files) => setCreativeData({
              mediaFiles: files
            })}
            maxFiles={10}
          />
        </div>

        <div className="vk-mobile-button-row">
          <button className="vk-btn" onClick={clearStep3}>
            Очистить поля
          </button>
          <button className="vk-btn" onClick={() => setStep(2)}>
            Назад
          </button>
          <button
            className="vk-btn vk-btn--primary"
            disabled={!canSubmitCreative || loadingState['creative']}
            onClick={createCreative}
          >
            {loadingState['creative'] ? 'Отправка…' : 'Получить ERID'}
          </button>
        </div>
      </div>
    </details>
  )
}

