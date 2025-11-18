/**
 * Template Saver Component
 *
 * Modal window for saving wizard state as a template.
 * If a template was previously loaded, asks whether to update it or create new.
 */

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTemplate, useUpdateTemplate, useTemplateById } from '../hooks/useFlowTemplates'
import { FlowTemplateType, type TemplateExternalIds } from '../../../types/flowTemplates'

interface TemplateSaverProps {
  open: boolean
  onClose: () => void
  templateData: TemplateExternalIds
  existingTemplateId: number | null
}

export const TemplateSaver: React.FC<TemplateSaverProps> = ({
  open,
  onClose,
  templateData,
  existingTemplateId
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saveMode, setSaveMode] = useState<'new' | 'update' | null>(
    existingTemplateId ? null : 'new'
  )

  const createMutation = useCreateTemplate()
  const updateMutation = useUpdateTemplate()

  // Fetch existing template data when updating
  const { data: existingTemplate, isLoading: isLoadingTemplate } = useTemplateById(
    saveMode === 'update' ? existingTemplateId : null
  )

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
      setSaveMode(existingTemplateId ? null : 'new')
    }
  }, [open, existingTemplateId])

  const handleSave = async () => {
    try {
      if (saveMode === 'update') {
        // Button should be disabled if template is not loaded, but add safeguard
        if (!existingTemplateId || !existingTemplate) {
          return
        }
        // Send full UpdateFlowTemplateRequest with all required fields
        // templateData contains CURRENT wizard state (including latest creative_external_id)
        // Other fields (name, type, description, tags, isActive) are preserved from existing template
        await updateMutation.mutateAsync({
          id: existingTemplateId,
          data: {
            name: existingTemplate.name,
            type: existingTemplate.type,
            description: existingTemplate.description || '',
            value: templateData, // Uses current wizard state with latest creative_external_id
            tags: existingTemplate.tags || [],
            isActive: existingTemplate.isActive
          }
        })
      } else {
        if (!name.trim()) {
          return
        }
        await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          type: FlowTemplateType.VkOrdWizard,
          value: templateData
        })
      }
      onClose()
    } catch (error) {
      // Error handled by mutation hooks
      console.error('Failed to save template:', error)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending || isLoadingTemplate

  // If template was loaded, first ask: update or create new
  if (existingTemplateId && saveMode === null) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить шаблон</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-700">
              Вы использовали существующий шаблон. Хотите обновить его или создать новый?
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
                Отмена
              </Button>
              <Button
                variant="outline"
                onClick={() => setSaveMode('update')}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Обновить
              </Button>
              <Button onClick={() => setSaveMode('new')} disabled={isLoading} className="w-full sm:w-auto">
                Создать новый
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Create new or Update existing
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {saveMode === 'update' ? 'Обновить шаблон' : 'Создать новый шаблон'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {saveMode === 'new' ? (
            <>
              <div>
                <label htmlFor="template-name" className="block text-sm font-medium mb-1">
                  Название шаблона <span className="text-red-500">*</span>
                </label>
                <Input
                  id="template-name"
                  placeholder="Введите название шаблона"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="template-description" className="block text-sm font-medium mb-1">
                  Описание (опционально)
                </label>
                <Textarea
                  id="template-description"
                  placeholder="Опишите для чего этот шаблон"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600">
              Существующий шаблон будет обновлен с новыми данными из текущего wizard.
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isLoading ||
                (saveMode === 'new' && !name.trim()) ||
                (saveMode === 'update' && !existingTemplate)
              }
              className="w-full sm:w-auto"
            >
              {isLoadingTemplate
                ? 'Загрузка...'
                : (createMutation.isPending || updateMutation.isPending)
                  ? 'Сохранение...'
                  : 'Сохранить'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
