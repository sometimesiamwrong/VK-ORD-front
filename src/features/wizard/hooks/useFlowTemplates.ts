/**
 * Flow Templates Hooks
 *
 * React Query hooks for managing flow templates.
 * Provides hooks for fetching, creating, updating, and deleting templates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FlowTemplatesService } from '../../../services/flowTemplates'
import { getErrorMessage } from '../../../api/errorHandler'
import type {
  CreateFlowTemplateRequest,
  UpdateFlowTemplateRequest,
  GetTemplatesParams
} from '../../../types/flowTemplates'

// Query keys
export const FLOW_TEMPLATES_QUERY_KEY = ['flowTemplates']

/**
 * Hook for fetching list of flow templates
 *
 * @param filters - Filters for template list
 * @returns Query result with template list
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useTemplatesList({
 *   type: FlowTemplateType.VkOrdWizard,
 *   activeOnly: true
 * })
 * ```
 */
export const useTemplatesList = (filters?: GetTemplatesParams) => {
  return useQuery({
    queryKey: [...FLOW_TEMPLATES_QUERY_KEY, 'list', filters],
    queryFn: () => FlowTemplatesService.getTemplates(filters)
  })
}

/**
 * Hook for fetching a single template by ID
 *
 * @param id - Template ID (null to disable query)
 * @returns Query result with full template data
 *
 * @example
 * ```tsx
 * const { data: template } = useTemplateById(templateId)
 * ```
 */
export const useTemplateById = (id: number | null) => {
  return useQuery({
    queryKey: [...FLOW_TEMPLATES_QUERY_KEY, id],
    queryFn: () => FlowTemplatesService.getTemplateById(id!),
    enabled: !!id
  })
}

/**
 * Hook for fetching template types
 *
 * @returns Query result with template types list
 *
 * @example
 * ```tsx
 * const { data: types } = useTemplateTypes()
 * ```
 */
export const useTemplateTypes = () => {
  return useQuery({
    queryKey: [...FLOW_TEMPLATES_QUERY_KEY, 'types'],
    queryFn: () => FlowTemplatesService.getTemplateTypes(),
    staleTime: 1000 * 60 * 60 // Cache for 1 hour (types don't change often)
  })
}

/**
 * Hook for creating a new template
 *
 * @returns Mutation for creating templates
 *
 * @example
 * ```tsx
 * const createMutation = useCreateTemplate()
 * await createMutation.mutateAsync({
 *   name: 'My Template',
 *   type: FlowTemplateType.VkOrdWizard,
 *   value: { ... }
 * })
 * ```
 */
export const useCreateTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFlowTemplateRequest) =>
      FlowTemplatesService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...FLOW_TEMPLATES_QUERY_KEY, 'list'] })
      toast.success('Шаблон успешно сохранен')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Ошибка при сохранении шаблона'))
    }
  })
}

/**
 * Hook for updating an existing template
 *
 * @returns Mutation for updating templates
 *
 * @example
 * ```tsx
 * const updateMutation = useUpdateTemplate()
 * await updateMutation.mutateAsync({
 *   id: 123,
 *   data: { name: 'Updated Name' }
 * })
 * ```
 */
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFlowTemplateRequest }) =>
      FlowTemplatesService.updateTemplate(id, data),
    onSuccess: (updatedTemplate) => {
      queryClient.invalidateQueries({ queryKey: [...FLOW_TEMPLATES_QUERY_KEY] })
      toast.success('Шаблон успешно обновлен')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Ошибка при обновлении шаблона'))
    }
  })
}

/**
 * Hook for deleting a template
 *
 * @returns Mutation for deleting templates
 *
 * @example
 * ```tsx
 * const deleteMutation = useDeleteTemplate()
 * await deleteMutation.mutateAsync(templateId)
 * ```
 */
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => FlowTemplatesService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...FLOW_TEMPLATES_QUERY_KEY, 'list'] })
      toast.success('Шаблон удален')
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Ошибка при удалении шаблона'))
    }
  })
}

/**
 * Hook for activating/deactivating a template
 *
 * @returns Mutation for template activation
 *
 * @example
 * ```tsx
 * const activateMutation = useActivateTemplate()
 * await activateMutation.mutateAsync({ id: 123, isActive: false })
 * ```
 */
export const useActivateTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      FlowTemplatesService.activateTemplate(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...FLOW_TEMPLATES_QUERY_KEY] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Ошибка при изменении статуса шаблона'))
    }
  })
}

/**
 * Hook for incrementing template use count
 * Call this when user applies a template
 *
 * @returns Mutation for incrementing use count
 *
 * @example
 * ```tsx
 * const incrementMutation = useIncrementTemplateUse()
 * await incrementMutation.mutateAsync(templateId)
 * ```
 */
export const useIncrementTemplateUse = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => FlowTemplatesService.incrementUseCount(id),
    onSuccess: () => {
      // Silently update cache, no need to show toast
      queryClient.invalidateQueries({ queryKey: [...FLOW_TEMPLATES_QUERY_KEY] })
    },
    onError: () => {
      // Silently fail, this is not critical
      console.warn('Failed to increment template use count')
    }
  })
}
