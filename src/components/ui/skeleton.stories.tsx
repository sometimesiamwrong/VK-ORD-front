import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

/**
 * Skeleton loading component for displaying placeholder content
 * while data is being fetched.
 */
const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '400px', padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic skeleton line
 */
export const Line: Story = {
  args: {
    className: 'h-4 w-full',
  },
}

/**
 * Short skeleton line
 */
export const ShortLine: Story = {
  args: {
    className: 'h-4 w-1/2',
  },
}

/**
 * Skeleton circle (for avatars)
 */
export const Circle: Story = {
  args: {
    className: 'h-12 w-12 rounded-full',
  },
}

/**
 * Skeleton rectangle (for images/cards)
 */
export const Rectangle: Story = {
  args: {
    className: 'h-32 w-full rounded-lg',
  },
}

/**
 * Card skeleton with multiple elements
 */
export const Card: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
}

/**
 * List item skeleton
 */
export const ListItem: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ),
}

/**
 * Table row skeleton
 */
export const TableRow: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  ),
}

/**
 * Complete list skeleton with multiple items
 */
export const List: Story = {
  render: () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  ),
}

/**
 * Article skeleton
 */
export const Article: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
}

/**
 * User profile skeleton
 */
export const Profile: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  ),
}

/**
 * Dashboard widget skeleton
 */
export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 p-4 border rounded-lg">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
      </div>
      <div className="space-y-2 p-4 border rounded-lg">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
      </div>
      <div className="col-span-2 space-y-2 p-4 border rounded-lg">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-32 w-full rounded" />
      </div>
    </div>
  ),
}
