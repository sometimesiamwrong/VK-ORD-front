import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import { type WizardState, type LoadingState, type MessageState, type PartyHistoryItem, VkOrdCreativeForm } from '../types'
import { generateContractExternalId, nowTimestampString, loadFromLocalStorage, saveToLocalStorage, loadFromCookie, isFirstTimeUser } from '../utils'

const LOCAL_KEY = 'vkord-wizard-state'

// Action types
type WizardAction =
  | { type: 'SET_STEP'; payload: WizardState['step'] }
  | { type: 'SET_CONSENT'; payload: boolean }
  | { type: 'SET_VK_API_KEY'; payload: string | null }
  | { type: 'SET_USE_SANDBOX'; payload: boolean }
  | { type: 'SET_ADVERTISER_INN'; payload: string }
  | { type: 'SET_CONTRACTOR_INN'; payload: string }
  | { type: 'SET_ADVERTISER_ROLE'; payload: WizardState['advertiserRole'] }
  | { type: 'SET_CONTRACTOR_ROLE'; payload: WizardState['contractorRole'] }
  | { type: 'SET_ADVERTISER_INFO'; payload: { name?: string | null; shortWithOpf?: string | null; info?: string | null } }
  | { type: 'SET_CONTRACTOR_INFO'; payload: { name?: string | null; shortWithOpf?: string | null; info?: string | null } }
  | { type: 'SET_CONTRACT_DATA'; payload: { externalId: string; serial?: string | null; paySum?: number | null; date?: string | null; dateEnd?: string | null } }
  | { type: 'SET_CREATIVE_DATA'; payload: Partial<Pick<WizardState, 'creativeExternalId' | 'contractExternalIds' | 'kktus' | 'format' | 'contentUrls' | 'targetAudience' | 'text' | 'name' | 'mediaFiles'>> }
  | { type: 'SET_ERID'; payload: string | null }
  | { type: 'ADD_TO_PARTY_HISTORY'; payload: PartyHistoryItem }
  | { type: 'CLEAR_STEP'; payload: 1 | 2 | 3 | 4 }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD_STATE'; payload: Partial<WizardState> }

type LoadingAction =
  | { type: 'SET_LOADING'; payload: { key: string; value: boolean } }

type MessageAction =
  | { type: 'SET_MESSAGE'; payload: { text: string; status: MessageState['status'] } }
  | { type: 'CLEAR_MESSAGE' }
  | { type: 'HIGHLIGHT_MESSAGE' }

// Initial state
const initialWizardState: WizardState = {
  step: 1,
  consent: false,
  vkApiKey: null,
  useSandbox: false,
  advertiserInn: '',
  contractorInn: '',
  advertiserRole: ['advertiser'],
  contractorRole: ['publisher'],
  advertiserName: null,
  contractorName: null,
  advertiserShortWithOpf: null,
  contractorShortWithOpf: null,
  advertiserInfo: null,
  contractorInfo: null,
  contractExternalId: generateContractExternalId(new Date(), 1),
  serial: null,
  paySum: null,
  date: null,
  dateEnd: null,
  creativeExternalId: nowTimestampString(),
  contractExternalIds: [],
  kktus: [],
  format: VkOrdCreativeForm.TextGraphicBlock,
  contentUrls: [],
  targetAudience: null,
  text: null,
  name: null,
  mediaFiles: [],
  erid: null,
  partyHistory: []
}

const initialLoadingState: LoadingState = {}
const initialMessageState: MessageState = { text: '', status: 'info', highlight: false }

// Reducers
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload }
    case 'SET_CONSENT':
      return { ...state, consent: action.payload }
    case 'SET_VK_API_KEY':
      return { ...state, vkApiKey: action.payload }
    case 'SET_USE_SANDBOX':
      return { ...state, useSandbox: action.payload }
    case 'SET_ADVERTISER_INN':
      return { ...state, advertiserInn: action.payload }
    case 'SET_CONTRACTOR_INN':
      return { ...state, contractorInn: action.payload }
    case 'SET_ADVERTISER_ROLE':
      return { ...state, advertiserRole: action.payload }
    case 'SET_CONTRACTOR_ROLE':
      return { ...state, contractorRole: action.payload }
    case 'SET_ADVERTISER_INFO':
      return {
        ...state,
        advertiserName: action.payload.name,
        advertiserShortWithOpf: action.payload.shortWithOpf,
        advertiserInfo: action.payload.info
      }
    case 'SET_CONTRACTOR_INFO':
      return {
        ...state,
        contractorName: action.payload.name,
        contractorShortWithOpf: action.payload.shortWithOpf,
        contractorInfo: action.payload.info
      }
    case 'SET_CONTRACT_DATA':
      return {
        ...state,
        contractExternalId: action.payload.externalId,
        serial: action.payload.serial,
        paySum: action.payload.paySum,
        date: action.payload.date,
        dateEnd: action.payload.dateEnd
      }
    case 'SET_CREATIVE_DATA':
      return { ...state, ...action.payload }
    case 'SET_ERID':
      return { ...state, erid: action.payload }
    case 'ADD_TO_PARTY_HISTORY':
      const existingIndex = state.partyHistory?.findIndex(h => h.inn === action.payload.inn) ?? -1
      const newHistory = state.partyHistory || []
      const updatedHistory = existingIndex >= 0
        ? [...newHistory.slice(0, existingIndex), action.payload, ...newHistory.slice(existingIndex + 1)]
        : [action.payload, ...newHistory]
      return { ...state, partyHistory: updatedHistory.slice(0, 10) }
    case 'CLEAR_STEP':
      switch (action.payload) {
        case 1:
          return {
            ...state,
            advertiserInn: '',
            contractorInn: '',
            advertiserRole: ['advertiser'],
            contractorRole: ['publisher'],
            advertiserName: null,
            contractorName: null,
            advertiserShortWithOpf: null,
            contractorShortWithOpf: null,
            advertiserInfo: null,
            contractorInfo: null,
            consent: false,
            erid: null
          }
        case 2:
          return {
            ...state,
            contractExternalId: '',
            serial: null,
            paySum: null,
            date: null,
            dateEnd: null,
            erid: null
          }
        case 3:
          return {
            ...state,
            creativeExternalId: '',
            contractExternalIds: [],
            kktus: [],
            format: 0, // VkOrdCreativeForm.Banner
            contentUrls: [],
            targetAudience: null,
            text: null,
            name: null,
            mediaFiles: [],
            erid: null
          }
        case 4:
          return { ...state, erid: null }
        default:
          return state
      }
    case 'CLEAR_ALL':
      return {
        ...initialWizardState,
        vkApiKey: state.vkApiKey,
        useSandbox: state.useSandbox,
        partyHistory: state.partyHistory
      }
    case 'LOAD_STATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, [action.payload.key]: action.payload.value }
    default:
      return state
  }
}

function messageReducer(state: MessageState, action: MessageAction): MessageState {
  switch (action.type) {
    case 'SET_MESSAGE':
      return { text: action.payload.text, status: action.payload.status, highlight: true }
    case 'CLEAR_MESSAGE':
      return { text: '', status: 'info', highlight: false }
    case 'HIGHLIGHT_MESSAGE':
      return { ...state, highlight: false }
    default:
      return state
  }
}

// Context
interface AppContextType {
  // Wizard state
  wizardState: WizardState
  setStep: (step: WizardState['step']) => void
  setConsent: (consent: boolean) => void
  setVkApiKey: (key: string | null) => void
  setUseSandbox: (useSandbox: boolean) => void
  setAdvertiserInn: (inn: string) => void
  setContractorInn: (inn: string) => void
  setAdvertiserRole: (role: WizardState['advertiserRole']) => void
  setContractorRole: (role: WizardState['contractorRole']) => void
  setAdvertiserInfo: (info: { name?: string | null; shortWithOpf?: string | null; info?: string | null }) => void
  setContractorInfo: (info: { name?: string | null; shortWithOpf?: string | null; info?: string | null }) => void
  setContractData: (data: { externalId: string; serial?: string | null; paySum?: number | null; date?: string | null; dateEnd?: string | null }) => void
  setCreativeData: (data: Partial<Pick<WizardState, 'creativeExternalId' | 'contractExternalIds' | 'kktus' | 'format' | 'contentUrls' | 'targetAudience' | 'text' | 'name' | 'mediaFiles'>>) => void
  setErid: (erid: string | null) => void
  addToPartyHistory: (item: PartyHistoryItem) => void
  clearStep: (step: 1 | 2 | 3 | 4) => void
  clearAll: () => void

  // Loading state
  loadingState: LoadingState
  setLoading: (key: string, value: boolean) => void

  // Message state
  messageState: MessageState
  setMessage: (text: string, status?: MessageState['status']) => void
  clearMessage: () => void

  // Computed values
  canNextFromStep1: boolean
  canNextFromStep2: boolean
  canSubmitCreative: boolean
}

const AppContext = createContext<AppContextType | null>(null)

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [wizardState, dispatchWizard] = useReducer(wizardReducer, initialWizardState)
  const [loadingState, dispatchLoading] = useReducer(loadingReducer, initialLoadingState)
  const [messageState, dispatchMessage] = useReducer(messageReducer, initialMessageState)

  // Load initial state from localStorage and cookies
  useEffect(() => {
    const isNewUser = isFirstTimeUser(LOCAL_KEY)
    const localState = loadFromLocalStorage(LOCAL_KEY, initialWizardState)

    // Load VK API settings from cookies
    const vkApiKey = loadFromCookie('vkord-api-key')
    const credentialId = loadFromCookie('vkord-credential-id')
    const useSandbox = loadFromCookie('vkord-use-sandbox') === 'true'

    // If we have a credential ID but no manual API key, use the credential ID as vkApiKey
    const finalVkApiKey = vkApiKey || credentialId

    const finalState = {
      ...localState,
      vkApiKey: finalVkApiKey,
      useSandbox
    }

    if (isNewUser) {
      finalState.advertiserRole = ['advertiser']
      finalState.contractorRole = ['publisher']
    }

    dispatchWizard({ type: 'LOAD_STATE', payload: finalState })
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    const id = setInterval(() => saveToLocalStorage(LOCAL_KEY, wizardState), 2000)
    return () => clearInterval(id)
  }, [wizardState])

  // Save on window blur
  useEffect(() => {
    const onBlur = () => saveToLocalStorage(LOCAL_KEY, wizardState)
    window.addEventListener('blur', onBlur, true)
    return () => window.removeEventListener('blur', onBlur, true)
  }, [wizardState])

  // Clear message highlight after animation with different timeouts for different message types
  useEffect(() => {
    if (messageState.highlight) {
      // Different timeouts for different message types
      const timeout = messageState.status === 'success' ? 2000 : // 2 seconds for success
                      messageState.status === 'error' ? 5000 :   // 5 seconds for errors
                      3000 // 3 seconds for info messages

      const timer = setTimeout(() => {
        dispatchMessage({ type: 'HIGHLIGHT_MESSAGE' }) // This will set highlight to false in the reducer
      }, timeout)
      return () => clearTimeout(timer)
    }
  }, [messageState.highlight, messageState.status])

  // Computed values
  const canNextFromStep1 = React.useMemo(() =>
    wizardState.advertiserInn.length > 0 &&
    wizardState.contractorInn.length > 0 &&
    wizardState.consent &&
    wizardState.advertiserRole.length > 0 &&
    wizardState.contractorRole.length > 0,
    [wizardState]
  )

  const canNextFromStep2 = React.useMemo(() =>
    !!wizardState.contractExternalId && !!wizardState.date,
    [wizardState]
  )

  const canSubmitCreative = React.useMemo(() =>
    !!wizardState.creativeExternalId &&
    wizardState.contractExternalIds.length >= 1 &&
    !!(wizardState.kktus && Array.isArray(wizardState.kktus) && wizardState.kktus.length > 0) &&
    !!wizardState.name?.trim() &&
    !!wizardState.text?.trim(),
    [wizardState]
  )

  // Action creators
  const setStep = (step: WizardState['step']) => dispatchWizard({ type: 'SET_STEP', payload: step })
  const setConsent = (consent: boolean) => dispatchWizard({ type: 'SET_CONSENT', payload: consent })
  const setVkApiKey = (key: string | null) => dispatchWizard({ type: 'SET_VK_API_KEY', payload: key })
  const setUseSandbox = (useSandbox: boolean) => dispatchWizard({ type: 'SET_USE_SANDBOX', payload: useSandbox })
  const setAdvertiserInn = (inn: string) => dispatchWizard({ type: 'SET_ADVERTISER_INN', payload: inn })
  const setContractorInn = (inn: string) => dispatchWizard({ type: 'SET_CONTRACTOR_INN', payload: inn })
  const setAdvertiserRole = (role: WizardState['advertiserRole']) => dispatchWizard({ type: 'SET_ADVERTISER_ROLE', payload: role })
  const setContractorRole = (role: WizardState['contractorRole']) => dispatchWizard({ type: 'SET_CONTRACTOR_ROLE', payload: role })
  const setAdvertiserInfo = (info: { name?: string | null; shortWithOpf?: string | null; info?: string | null }) => dispatchWizard({ type: 'SET_ADVERTISER_INFO', payload: info })
  const setContractorInfo = (info: { name?: string | null; shortWithOpf?: string | null; info?: string | null }) => dispatchWizard({ type: 'SET_CONTRACTOR_INFO', payload: info })
  const setContractData = (data: { externalId: string; serial?: string | null; paySum?: number | null; date?: string | null; dateEnd?: string | null }) => dispatchWizard({ type: 'SET_CONTRACT_DATA', payload: data })
  const setCreativeData = (data: Partial<Pick<WizardState, 'creativeExternalId' | 'contractExternalIds' | 'kktus' | 'format' | 'contentUrls' | 'targetAudience' | 'text' | 'name'>>) => dispatchWizard({ type: 'SET_CREATIVE_DATA', payload: data })
  const setErid = (erid: string | null) => dispatchWizard({ type: 'SET_ERID', payload: erid })
  const addToPartyHistory = (item: PartyHistoryItem) => dispatchWizard({ type: 'ADD_TO_PARTY_HISTORY', payload: item })
  const clearStep = (step: 1 | 2 | 3 | 4) => dispatchWizard({ type: 'CLEAR_STEP', payload: step })
  const clearAll = () => dispatchWizard({ type: 'CLEAR_ALL' })

  const setLoading = (key: string, value: boolean) => dispatchLoading({ type: 'SET_LOADING', payload: { key, value } })

  const setMessage = (text: string, status: MessageState['status'] = 'info') => dispatchMessage({ type: 'SET_MESSAGE', payload: { text, status } })
  const clearMessage = () => dispatchMessage({ type: 'CLEAR_MESSAGE' })

  const value: AppContextType = {
    wizardState,
    setStep,
    setConsent,
    setVkApiKey,
    setUseSandbox,
    setAdvertiserInn,
    setContractorInn,
    setAdvertiserRole,
    setContractorRole,
    setAdvertiserInfo,
    setContractorInfo,
    setContractData,
    setCreativeData,
    setErid,
    addToPartyHistory,
    clearStep,
    clearAll,
    loadingState,
    setLoading,
    messageState,
    setMessage,
    clearMessage,
    canNextFromStep1,
    canNextFromStep2,
    canSubmitCreative
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
