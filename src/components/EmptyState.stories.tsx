import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './EmptyState'
import { Button } from './ui/button'

/**
 * EmptyState component for displaying user-friendly messages
 * when lists or data are empty.
 */
const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Main title text',
    },
    description: {
      control: 'text',
      description: 'Optional description text',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic empty state with just a title
 */
export const Basic: Story = {
  args: {
    title: 'Нет данных',
  },
}

/**
 * Empty state with title and description
 */
export const WithDescription: Story = {
  args: {
    title: 'Нет контрагентов',
    description: 'Вы еще не добавили ни одного контрагента. Создайте первого контрагента, чтобы начать работу.',
  },
}

/**
 * Empty state with icon
 */
export const WithIcon: Story = {
  args: {
    title: 'Нет договоров',
    description: 'Договоры появятся здесь после создания',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
}

/**
 * Empty state with action button
 */
export const WithAction: Story = {
  args: {
    title: 'Нет креативов',
    description: 'Создайте свой первый креатив для получения ERID',
    action: <Button>Создать креатив</Button>,
  },
}

/**
 * Complete empty state with all props
 */
export const Complete: Story = {
  args: {
    title: 'Список пуст',
    description: 'Добавьте первый элемент, чтобы начать работу с системой. Это займет всего пару минут.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
    action: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button>Добавить</Button>
        <Button variant="outline">Импорт</Button>
      </div>
    ),
  },
}

/**
 * Empty search results
 */
export const EmptySearch: Story = {
  args: {
    title: 'Ничего не найдено',
    description: 'Попробуйте изменить параметры поиска или очистить фильтры',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    action: <Button variant="outline">Очистить фильтры</Button>,
  },
}

/**
 * No access / permissions
 */
export const NoAccess: Story = {
  args: {
    title: 'Нет доступа',
    description: 'У вас недостаточно прав для просмотра этого раздела. Обратитесь к администратору.',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
}
