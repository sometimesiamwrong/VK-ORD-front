// Global toast utility - will be replaced with context-based notifications
// This is a temporary solution until all components are migrated to use AppContext

export const toast = {
  success: (message: string) => {
    // For now, just log to console. Components should use AppContext setMessage instead
    console.log('Success:', message)
  },
  error: (message: string) => {
    // For now, just log to console. Components should use AppContext setMessage instead
    console.error('Error:', message)
  },
  info: (message: string) => {
    // For now, just log to console. Components should use AppContext setMessage instead
    console.info('Info:', message)
  }
}

