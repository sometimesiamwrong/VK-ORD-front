import React from 'react'
import { useLocation } from 'react-router-dom'
import { CredentialRequiredModal } from '../ui/CredentialRequiredModal'
import { useEnvironmentStore } from '../../auth/tokenStore'
import { getCookie } from '../../utils'
import { useAuth } from '../../auth/hooks'

/**
 * Guards application behind VK ORD credential requirement.
 * Renders a blocking modal when no credential is selected.
 */
import { useCredentialModalStore } from '@/stores/credentialModalStore'
import type { CredentialModalState } from '@/stores/credentialModalStore'

export const CredentialGuard: React.FC = () => {
  const location = useLocation()
  const { environment } = useEnvironmentStore()
  const { isAuthenticated } = useAuth()
  const open = useCredentialModalStore((s: CredentialModalState) => s.open)
  const selectedCredentialId = useCredentialModalStore((s: CredentialModalState) => s.selectedCredentialId)
  const setOpen = useCredentialModalStore((s: CredentialModalState) => s.setOpen)
  const setSelectedCredentialId = useCredentialModalStore((s: CredentialModalState) => s.setSelectedCredentialId)

  React.useEffect(() => {
    if (!isAuthenticated) {
      // Skip guard for unauthenticated users (login, register)
      setOpen(false)
      setSelectedCredentialId('')
      return
    }

    const path = location.pathname
    const isCredentialsPage = path.startsWith('/credentials')
    const credentialId = getCookie('vkord-credential-id') || ''

    setSelectedCredentialId(credentialId)
    setOpen(!credentialId && !isCredentialsPage)
  }, [location.pathname, environment, isAuthenticated, setOpen, setSelectedCredentialId])

  const handleCredentialSelected = (credentialId: string) => {
    setSelectedCredentialId(credentialId)
    setOpen(false)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <CredentialRequiredModal
      open={open}
      selectedCredentialId={selectedCredentialId}
      onCredentialSelect={handleCredentialSelected}
    />
  )
}
