import { create } from 'zustand'
import { getCookie } from '../utils/cookies'

export interface CredentialModalState {
  open: boolean
  selectedCredentialId: string
  setOpen: (value: boolean) => void
  setSelectedCredentialId: (credentialId: string) => void
}

export const useCredentialModalStore = create<CredentialModalState>((set) => ({
  open: false,
  selectedCredentialId: '',
  setOpen: (value) => set(() => ({ open: value })),
  setSelectedCredentialId: (credentialId) => set(() => ({ selectedCredentialId: credentialId })),
}))

export const promptCredentialSelection = (): string => {
  const { setOpen, setSelectedCredentialId } = useCredentialModalStore.getState()
  const credentialId = getCookie('vkord-credential-id') || ''
  setSelectedCredentialId(credentialId)

  if (!credentialId) {
    setOpen(true)
  }

  return credentialId
}

// For convenience, a function to close the modal
export const closeCredentialModal = () => {
  const { setOpen } = useCredentialModalStore.getState()
  setOpen(false)
}
