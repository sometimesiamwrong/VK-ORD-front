/**
 * Error Boundary Component
 *
 * Catches React errors and displays a user-friendly error page
 * instead of crashing the entire application.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 * ```
 */

import React, { Component, type ReactNode, type ErrorInfo } from 'react'
import { logger } from '../utils/logger'
import { Button } from './ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to our logging service
    logger.error('React Error Boundary caught an error', error)
    logger.debug('Error component stack', errorInfo.componentStack)

    // Update state with error info
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })

    // Reload the page to reset state
    window.location.reload()
  }

  handleGoHome = (): void => {
    window.location.href = '/#/wizard'
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // Custom fallback provided
      if (fallback) {
        return fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <div className="text-center">
              {/* Error icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              {/* Error message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Что-то пошло не так
              </h2>
              <p className="text-gray-600 mb-6">
                Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
              </p>

              {/* Error details (development only) */}
              {import.meta.env.DEV && error && (
                <details className="text-left mb-6 bg-gray-50 rounded p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    Технические детали
                  </summary>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>
                      <strong>Ошибка:</strong>
                      <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
                        {error.toString()}
                      </pre>
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo && (
                      <div>
                        <strong>Component stack:</strong>
                        <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="default"
                >
                  Перезагрузить страницу
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                >
                  На главную
                </Button>
              </div>

              {/* Support info */}
              <p className="text-sm text-gray-500 mt-6">
                Если проблема повторяется, обратитесь в техподдержку
              </p>
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

/**
 * Hook version of ErrorBoundary for functional components
 *
 * Note: This is a simplified wrapper since hooks can't catch errors
 * in the same component. ErrorBoundary must be a class component.
 */
export function useErrorHandler(): (error: Error) => void {
  const [, setError] = React.useState<Error>()

  return React.useCallback((error: Error) => {
    logger.error('Error thrown via useErrorHandler', error)
    setError(() => {
      throw error
    })
  }, [])
}

export default ErrorBoundary
