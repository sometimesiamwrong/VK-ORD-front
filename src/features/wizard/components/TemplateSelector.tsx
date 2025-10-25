/**
 * Template Selector Component
 *
 * Modal window for selecting a flow template.
 * Displays list of available templates with search functionality.
 */

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTemplatesList } from '../hooks/useFlowTemplates'
import { FlowTemplateType } from '../../../types/flowTemplates'

interface TemplateSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (templateId: number) => void
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const [search, setSearch] = useState('')

  const { data, isLoading, error } = useTemplatesList({
    type: FlowTemplateType.VkOrdWizard,
    activeOnly: true,
    sort: 'last_used_at',
    order: 'desc'
  })

  const filteredTemplates = data?.data.filter(template =>
    template.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  const handleSelect = (templateId: number) => {
    onSelect(templateId)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выбрать шаблон</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />

          {isLoading && (
            <div className="flex justify-center p-8 text-gray-500">
              Загрузка...
            </div>
          )}

          {error && (
            <div className="flex justify-center p-8 text-red-500">
              Ошибка загрузки шаблонов
            </div>
          )}

          {!isLoading && !error && filteredTemplates.length === 0 && (
            <div className="flex justify-center p-8 text-gray-500">
              {search ? 'Шаблоны не найдены' : 'Нет сохраненных шаблонов'}
            </div>
          )}

          {!isLoading && !error && filteredTemplates.length > 0 && (
            <div className="grid gap-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelect(template.id)}
                >
                  <div className="font-medium text-lg">{template.name}</div>

                  {template.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {template.description}
                    </div>
                  )}

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {template.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    Использован: {template.useCount} раз
                    {template.lastUsedAt && (
                      <> • Последний раз: {new Date(template.lastUsedAt).toLocaleDateString('ru-RU')}</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
