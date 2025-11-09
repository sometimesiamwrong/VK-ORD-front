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
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Power, PowerOff } from 'lucide-react'
import { useTemplatesList, useDeleteTemplate, useActivateTemplate } from '../hooks/useFlowTemplates'
import { FlowTemplateType, type FlowTemplateListItemResponse } from '../../../types/flowTemplates'
import { EditTemplateDialog } from './EditTemplateDialog'

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
  const [showInactive, setShowInactive] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<FlowTemplateListItemResponse | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const { data, isLoading, error } = useTemplatesList({
    type: FlowTemplateType.VkOrdWizard,
    activeOnly: !showInactive,
    sort: 'last_used_at',
    order: 'desc'
  })

  const deleteMutation = useDeleteTemplate()
  const activateMutation = useActivateTemplate()

  const filteredTemplates = data?.data.filter(template =>
    template.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  const handleSelect = (templateId: number) => {
    onSelect(templateId)
    onClose()
  }

  const handleEdit = (template: FlowTemplateListItemResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingTemplate(template)
    setEditDialogOpen(true)
  }

  const handleDelete = async (templateId: number, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Вы уверены, что хотите удалить шаблон "${templateName}"?`)) {
      await deleteMutation.mutateAsync(templateId)
    }
  }

  const handleToggleActive = async (template: FlowTemplateListItemResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    await activateMutation.mutateAsync({
      id: template.id,
      isActive: !template.isActive
    })
  }

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false)
    setEditingTemplate(null)
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-inactive"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="show-inactive" className="text-sm text-gray-700 cursor-pointer">
              Показать неактивные шаблоны
            </label>
          </div>

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
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex gap-3"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleSelect(template.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-lg">{template.name}</div>
                      <Badge
                        className={
                          template.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
                        }
                      >
                        {template.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                    </div>

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

                  <div className="flex flex-col gap-2 justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(template, e)}
                      title="Редактировать"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleToggleActive(template, e)}
                      title={template.isActive ? 'Деактивировать' : 'Активировать'}
                      className="h-8 w-8 p-0"
                    >
                      {template.isActive ? (
                        <PowerOff className="h-4 w-4" />
                      ) : (
                        <Power className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(template.id, template.name, e)}
                      title="Удалить"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

      <EditTemplateDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        template={editingTemplate}
      />
    </Dialog>
  )
}
