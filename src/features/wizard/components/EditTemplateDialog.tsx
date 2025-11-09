/**
 * Edit Template Dialog Component
 *
 * Modal window for editing template name and description.
 */

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateTemplateHeaders } from '../hooks/useFlowTemplates'
import type { FlowTemplateListItemResponse } from '../../../types/flowTemplates'

interface EditTemplateDialogProps {
  open: boolean
  onClose: () => void
  template: FlowTemplateListItemResponse | null
}

export const EditTemplateDialog: React.FC<EditTemplateDialogProps> = ({
  open,
  onClose,
  template
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const updateHeadersMutation = useUpdateTemplateHeaders()

  // Fill form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description || '')
    }
  }, [template])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
    }
  }, [open])

  const handleSave = async () => {
    if (!template || !name.trim()) {
      return
    }

    try {
      await updateHeadersMutation.mutateAsync({
        id: template.id,
        data: {
          name: name.trim(),
          description: description.trim(),
          tags: template.tags || [],
          isActive: template.isActive
        }
      })
      onClose()
    } catch (error) {
      // Error handled by mutation hook
      console.error('Failed to update template headers:', error)
    }
  }

  const isLoading = updateHeadersMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать шаблон</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-template-name" className="block text-sm font-medium mb-1">
              Название шаблона <span className="text-red-500">*</span>
            </label>
            <Input
              id="edit-template-name"
              placeholder="Введите название шаблона"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="edit-template-description" className="block text-sm font-medium mb-1">
              Описание (опционально)
            </label>
            <Textarea
              id="edit-template-description"
              placeholder="Опишите для чего этот шаблон"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
