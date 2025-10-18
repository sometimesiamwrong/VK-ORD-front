/**
 * PageLoader Component
 *
 * Full-page loading indicator for use with React Suspense or route transitions.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<PageLoader />}>
 *   <Routes>...</Routes>
 * </Suspense>
 * ```
 */

import React from 'react'
import { CircularProgress } from '@mui/material'

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <CircularProgress size={48} />
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Загрузка...
        </p>
      </div>
    </div>
  )
}

export default PageLoader
