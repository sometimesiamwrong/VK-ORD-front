import { useState, useCallback } from 'react'

/**
 * Reusable hook for managing modal state
 * @template T - Type of data associated with the modal
 * @param initialData - Optional initial data for the modal
 * @returns Object with modal state and control functions
 *
 * @example
 * ```tsx
 * const partyModal = useModal<'advertiser' | 'contractor'>()
 *
 * // Open modal with data
 * partyModal.open('advertiser')
 *
 * // In JSX
 * <PartyModal
 *   isOpen={partyModal.isOpen}
 *   kind={partyModal.data}
 *   onClose={partyModal.close}
 * />
 * ```
 */
export const useModal = <T = undefined>(initialData?: T) => {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<T | undefined>(initialData)

  const open = useCallback((modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData)
    }
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const updateData = useCallback((newData: T) => {
    setData(newData)
  }, [])

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    updateData
  }
}
