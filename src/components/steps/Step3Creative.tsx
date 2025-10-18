import { Button } from '../ui/button'
import React from 'react'
import {
  useWizardStep,
  useWizardContract,
  useWizardLoadingState,
  useWizardActions,
  useCanSubmitCreative
} from '../../stores/wizardStore'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TagSelector } from '../ui/TagSelector'
import { FileUploader } from '../ui/FileUploader'
import { VkOrdCreativeForm } from '../../types'
import { useStep3Logic } from '../../features/wizard/hooks/useStep3Logic'
import { UrlTagList } from '../../features/wizard/components/UrlTagList'
import { KktyHintsPanel } from '../../features/wizard/components/KktyHintsPanel'

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

export const Step3Creative: React.FC = () => {
  const currentStep = useWizardStep()
  const contract = useWizardContract()
  const loadingState = useWizardLoadingState()
  const canSubmitCreative = useCanSubmitCreative()
  const { setStep } = useWizardActions()

  const {
    creative,
    kktyHints,
    contentUrlDraft,
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
    parseList
  } = useStep3Logic()

  return (
    <details open={currentStep === 3}>
      <summary>3) Креатив</summary>
      <div className="vk-card" style={{ marginTop: 10 }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <label>
            Идентификатор креатива
            <input
              className="vk-input"
              value={creative.externalId}
              onChange={e => updateCreative({
                externalId: e.target.value
              })}
            />
          </label>
          <label>
            Идентификатор договора
            <input
              className="vk-input"
              value={creative.contractExternalIds.join(',')}
              onChange={e => updateCreative({
                contractExternalIds: parseList(e.target.value)
              })}
              placeholder={contract.externalId}
            />
          </label>
          <label>
            Формат
            <Select
              value={creative.format?.toString() || VkOrdCreativeForm.Banner.toString()}
              onValueChange={value => updateCreative({
                format: parseInt(value as string) as VkOrdCreativeForm
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Формат" />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label>
            Ссылки на контент
            <input
              className="vk-input"
              value={contentUrlDraft}
              onChange={e => setContentUrlDraft(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              onBlur={addFromDraft}
              onPaste={handleUrlPaste}
              placeholder="Вставьте ссылку и нажмите Enter"
            />
            <UrlTagList
              urls={creative.contentUrls || []}
              onRemove={removeUrlAt}
            />
          </label>
          <label>
            Целевая аудитория
            <input
              className="vk-input"
              value={creative.targetAudience || ''}
              onChange={e => updateCreative({
                targetAudience: e.target.value
              })}
            />
          </label>
          <label>
            Название креатива
            <input
              className={`vk-input ${!creative.name?.trim() ? 'error' : ''}`}
              value={creative.name || ''}
              onChange={e => updateCreative({
                name: e.target.value
              })}
              placeholder="Введите название креатива..."
            />
          </label>
          <label>
            Текст
            <textarea
              className={`vk-textarea ${!creative.text?.trim() ? 'error' : ''}`}
              value={creative.text || ''}
              onChange={e => updateCreative({
                text: e.target.value
              })}
              rows={4}
              placeholder="Опишите ваш креатив или текст рекламы..."
            />
          </label>

          {/* AI KKTY Suggestions with relevance highlighting */}
          <KktyHintsPanel hints={kktyHints} />

          <div className="vk-mobile-row" style={{ justifyContent: 'center', gap: 20 }}>
            <Button
              className="mt-2 mb-2"
              disabled={!creative.text?.trim() || loadingState['ai-kkty']}
              onClick={handleGuessKkty}
            >
              {loadingState['ai-kkty'] ? '✨ Подбор…' : '✨ Узнать ККТУ по тексту'}
            </Button>
          </div>

          <TagSelector
            selectedCodes={creative.kktus && creative.kktus.length > 0 ? creative.kktus[0] : ''}
            onChange={code => updateCreative({
              kktus: code ? [code] : []
            })}
            hasError={!(creative.kktus && Array.isArray(creative.kktus) && creative.kktus.length > 0)}
          />

          <FileUploader
            mediaFiles={creative.mediaFiles}
            onChange={(files) => setCreativeMediaFiles(files)}
            maxFiles={10}
          />
        </div>

        <div className="vk-mobile-button-row">
          <Button variant="outline" onClick={clearStep3}>
            Очистить поля
          </Button>
          <Button variant="outline" onClick={() => setStep(2)}>
            Назад
          </Button>
          <Button
            disabled={!canSubmitCreative || loadingState['creative']}
            onClick={createCreative}
          >
            {loadingState['creative'] ? 'Отправка…' : 'Получить ERID'}
          </Button>
        </div>
      </div>
    </details>
  )
}

