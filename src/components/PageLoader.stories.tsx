import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { PageLoader } from './PageLoader'

/**
 * PageLoader component for full-page loading states.
 * Used with React Suspense or during route transitions.
 */
const meta = {
  title: 'Components/PageLoader',
  component: PageLoader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageLoader>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default page loader
 */
export const Default: Story = {}

/**
 * Page loader in light mode
 */
export const Light: Story = {
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}

/**
 * Page loader in dark mode
 */
export const Dark: Story = {
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: '#111827', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}

/**
 * Simulated loading sequence
 */
export const LoadingSequence: Story = {
  render: () => {
    const [isLoading, setIsLoading] = React.useState(true)

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 3000)

      return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
      return <PageLoader />
    }

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Content Loaded!
      </div>
    )
  },
}
