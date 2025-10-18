/**
 * EmptyState Component
 *
 * Displays a user-friendly empty state when lists or data are empty.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<InboxIcon className="w-12 h-12" />}
 *   title="Нет данных"
 *   description="Добавьте первую запись, чтобы начать работу"
 *   action={<Button onClick={onCreate}>Создать</Button>}
 * />
 * ```
 */

import React from 'react'

export interface EmptyStateProps {
  /** Icon to display (optional) */
  icon?: React.ReactNode
  /** Title of the empty state */
  title: string
  /** Description text (optional) */
  description?: string
  /** Action button or element (optional) */
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-600">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
