/**
 * Logger Utility
 *
 * Centralized logging with environment-aware behavior.
 * In development: logs to console
 * In production: can be extended to send to external logging service
 *
 * @example
 * ```ts
 * logger.info('User logged in', { userId: 123 })
 * logger.error('API call failed', apiError)
 * logger.warn('Deprecated function used')
 * ```
 */

import type { ApiError } from '../api/errors'
import { isApiError } from '../api/errors'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  error?: Error | ApiError
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private isProduction = import.meta.env.PROD

  /**
   * Log debug information (only in development)
   */
  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data)
    }
  }

  /**
   * Log informational message
   */
  info(message: string, data?: unknown): void {
    const entry = this.createLogEntry('info', message, data)

    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, data)
    }

    // In production, could send to external service
    if (this.isProduction) {
      this.sendToExternalService(entry)
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: unknown): void {
    const entry = this.createLogEntry('warn', message, data)

    console.warn(`[WARN] ${message}`, data)

    if (this.isProduction) {
      this.sendToExternalService(entry)
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | ApiError | unknown): void {
    const entry = this.createLogEntry('error', message, undefined, error)

    console.error(`[ERROR] ${message}`, error)

    // Always send errors to external service in production
    if (this.isProduction) {
      this.sendToExternalService(entry)
    }
  }

  /**
   * Log API error with full details
   */
  apiError(error: ApiError, context?: string): void {
    const message = context
      ? `${context}: ${error.userMessage}`
      : error.userMessage

    const entry = this.createLogEntry('error', message, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      context
    }, error)

    if (this.isDevelopment) {
      console.error(`[API ERROR] ${message}`, {
        error: error.toJSON(),
        context
      })
    }

    if (this.isProduction) {
      this.sendToExternalService(entry)
    }
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: unknown,
    error?: unknown
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data
    }

    if (error) {
      if (error instanceof Error) {
        entry.error = error
      } else if (isApiError(error)) {
        entry.error = error
      }
    }

    return entry
  }

  /**
   * Send log entry to external logging service
   *
   * TODO: Implement integration with:
   * - Sentry
   * - LogRocket
   * - Datadog
   * - Custom backend endpoint
   */
  private sendToExternalService(entry: LogEntry): void {
    // Placeholder for external logging service integration
    // In a real application, you would send logs to:
    // - Sentry.captureMessage() / Sentry.captureException()
    // - Custom API endpoint
    // - Browser's beacon API for non-blocking sends

    if (entry.level === 'error' && entry.error) {
      // Example: Sentry integration
      // Sentry.captureException(entry.error, {
      //   extra: entry.data,
      //   tags: { level: entry.level }
      // })
    }

    // For now, just store in sessionStorage for debugging
    try {
      const logs = this.getStoredLogs()
      logs.push(entry)

      // Keep only last 50 logs
      const recentLogs = logs.slice(-50)
      sessionStorage.setItem('app-logs', JSON.stringify(recentLogs))
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Get logs stored in sessionStorage (for debugging)
   */
  getStoredLogs(): LogEntry[] {
    try {
      const stored = sessionStorage.getItem('app-logs')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    try {
      sessionStorage.removeItem('app-logs')
    } catch {
      // Ignore
    }
  }

  /**
   * Export logs as JSON (for support/debugging)
   */
  exportLogs(): string {
    return JSON.stringify(this.getStoredLogs(), null, 2)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for testing
export default logger
