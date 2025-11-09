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
export const CredentialGuard: React.FC = () => {
  const location = useLocation()
  const { environment } = useEnvironmentStore()
  const { isAuthenticated } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [selectedCredentialId, setSelectedCredentialId] = React.useState('')

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
  }, [location.pathname, environment, isAuthenticated])

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
