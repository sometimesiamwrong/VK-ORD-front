import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WizardStep, PartyRole, PartyHistoryItem, UploadedFile } from '../types/wizard'
import type { VkOrdCreativeForm } from '../types'
import { generateContractExternalId, nowTimestampString } from '../utils'

// State interfaces
interface PartyState {
  inn: string
  external_id: string | null
  name: string | null
  shortWithOpf: string | null
  info: string | null
  type: string | null
  role: PartyRole
}

interface ContractState {
  externalId: string
  serial: string | null
  paySum: number | null
  payDateEnd: string | null
}

interface CreativeState {
  externalId: string
  contractExternalIds: string[]
  kktus: string[]
  format: VkOrdCreativeForm
  contentUrls: string[]
  text: string | null
  name: string | null
  mediaFiles: UploadedFile[]
  mediaExternalIds?: string[]
}

interface LoadingState {
  [key: string]: boolean
}

interface WizardStoreState {
  // Current step
  currentStep: WizardStep
  consent: boolean

  // Section visibility (for details elements)
  openSections: Record<WizardStep, boolean>

  // UI state
  showCreativeFlow: boolean

  // Parties (Step 1)
  advertiser: PartyState
  contractor: PartyState

  // Contract (Step 2)
  contract: ContractState

  // Creative (Step 3)
  creative: CreativeState

  // Result (Step 4)
  erid: string | null

  // History
  partyHistory: PartyHistoryItem[]

  // Loading state
  loadingState: LoadingState

  // Template state
  loadedTemplateId: number | null
  isTemplateLoaded: boolean

  // Actions
  actions: {
    // Navigation
    setStep: (step: WizardStep) => void
    nextStep: () => void
    prevStep: () => void

    // Section visibility
    toggleSection: (step: WizardStep) => void
    setSection: (step: WizardStep, open: boolean) => void

    // UI state
    setShowCreativeFlow: (show: boolean) => void

    // Consent
    setConsent: (consent: boolean) => void

    // Advertiser actions
    setAdvertiserInn: (inn: string) => void
    setAdvertiserRole: (role: PartyRole) => void
    setAdvertiserInfo: (info: { external_id?: string | null; name?: string | null; shortWithOpf?: string | null; info?: string | null; type?: string | null }) => void

    // Contractor actions
    setContractorInn: (inn: string) => void
    setContractorRole: (role: PartyRole) => void
    setContractorInfo: (info: { external_id?: string | null; name?: string | null; shortWithOpf?: string | null; info?: string | null; type?: string | null }) => void

    // Contract actions
    updateContract: (data: Partial<ContractState>) => void
    setContractExternalId: (externalId: string) => void
    setContractSerial: (serial: string | null) => void
    setContractPaySum: (paySum: number | null) => void
    setContractPayDateEnd: (payDateEnd: string | null) => void

    // Creative actions
    updateCreative: (data: Partial<Omit<CreativeState, 'mediaFiles'>>) => void
    setCreativeExternalId: (externalId: string) => void
    setCreativeContracts: (contractIds: string[]) => void
    setCreativeKktus: (kktus: string[]) => void
    setCreativeFormat: (format: VkOrdCreativeForm) => void
    setCreativeContentUrls: (urls: string[]) => void
    setCreativeText: (text: string | null) => void
    setCreativeName: (name: string | null) => void
    setCreativeMediaFiles: (files: UploadedFile[]) => void

    // ERID
    setErid: (erid: string | null) => void

    // Party history
    addToPartyHistory: (item: PartyHistoryItem) => void

    // Loading state
    setLoading: (key: string, value: boolean) => void

    // Template actions
    setLoadedTemplate: (templateId: number | null) => void
    clearLoadedTemplate: () => void

    // Clear actions
    clearStep: (step: WizardStep) => void
    clearAll: () => void
  }
}

// Initial states
const initialAdvertiserState: PartyState = {
  inn: '',
  external_id: null,
  name: null,
  shortWithOpf: null,
  info: null,
  type: null,
  role: ['advertiser']
}

const initialContractorState: PartyState = {
  inn: '',
  external_id: null,
  name: null,
  shortWithOpf: null,
  info: null,
  type: null,
  role: ['publisher']
}

const initialContractState: ContractState = {
  externalId: generateContractExternalId(new Date(), 1),
  serial: null,
  paySum: null,
  payDateEnd: null
}

const initialCreativeState: CreativeState = {
  externalId: nowTimestampString(),
  contractExternalIds: [],
  kktus: [],
  format: 2, // VkOrdCreativeForm.TextGraphicBlock
  contentUrls: [],
  text: null,
  name: null,
  mediaFiles: []
}

// Create store
export const useWizardStore = create<WizardStoreState>()(
  persist(
    (set) => ({
      // Initial state
      currentStep: 1,
      consent: false,
      openSections: { 1: true, 2: false, 3: false, 4: false },
      showCreativeFlow: false,
      advertiser: initialAdvertiserState,
      contractor: initialContractorState,
      contract: initialContractState,
      creative: initialCreativeState,
      erid: null,
      partyHistory: [],
      loadingState: {},
      loadedTemplateId: null,
      isTemplateLoaded: false,

      // Actions
      actions: {
        // Navigation
        setStep: (step) => set((state) => ({
          currentStep: step,
          openSections: { ...state.openSections, [step]: true }
        })),
        nextStep: () => set((state) => {
          const nextStep = Math.min(4, state.currentStep + 1) as WizardStep
          return {
            currentStep: nextStep,
            openSections: { ...state.openSections, [nextStep]: true }
          }
        }),
        prevStep: () => set((state) => {
          const prevStep = Math.max(1, state.currentStep - 1) as WizardStep
          return {
            currentStep: prevStep,
            openSections: { ...state.openSections, [prevStep]: true }
          }
        }),

        // Section visibility
        toggleSection: (step) => set((state) => ({
          openSections: { ...state.openSections, [step]: !state.openSections[step] }
        })),
        setSection: (step, open) => set((state) => ({
          openSections: { ...state.openSections, [step]: open }
        })),

        // UI state
        setShowCreativeFlow: (show) => set({ showCreativeFlow: show }),

        // Consent
        setConsent: (consent) => set({ consent }),

        // Advertiser
        setAdvertiserInn: (inn) =>
          set((state) => ({
            advertiser: { ...state.advertiser, inn }
          })),

        setAdvertiserRole: (role) =>
          set((state) => ({
            advertiser: { ...state.advertiser, role }
          })),

        setAdvertiserInfo: ({ external_id, name, shortWithOpf, info, type }) =>
          set((state) => ({
            advertiser: {
              ...state.advertiser,
              external_id: external_id !== undefined ? external_id : state.advertiser.external_id,
              name: name !== undefined ? name : state.advertiser.name,
              shortWithOpf: shortWithOpf !== undefined ? shortWithOpf : state.advertiser.shortWithOpf,
              info: info !== undefined ? info : state.advertiser.info,
              type: type !== undefined ? type : state.advertiser.type
            }
          })),

        // Contractor
        setContractorInn: (inn) =>
          set((state) => ({
            contractor: { ...state.contractor, inn }
          })),

        setContractorRole: (role) =>
          set((state) => ({
            contractor: { ...state.contractor, role }
          })),

        setContractorInfo: ({ external_id, name, shortWithOpf, info, type }) =>
          set((state) => ({
            contractor: {
              ...state.contractor,
              external_id: external_id !== undefined ? external_id : state.contractor.external_id,
              name: name !== undefined ? name : state.contractor.name,
              shortWithOpf: shortWithOpf !== undefined ? shortWithOpf : state.contractor.shortWithOpf,
              info: info !== undefined ? info : state.contractor.info,
              type: type !== undefined ? type : state.contractor.type
            }
          })),

        // Contract
        updateContract: (data) =>
          set((state) => ({
            contract: { ...state.contract, ...data }
          })),

        setContractExternalId: (externalId) =>
          set((state) => ({
            contract: { ...state.contract, externalId }
          })),

        setContractSerial: (serial) =>
          set((state) => ({
            contract: { ...state.contract, serial }
          })),

        setContractPaySum: (paySum) =>
          set((state) => ({
            contract: { ...state.contract, paySum }
          })),

        setContractPayDateEnd: (payDateEnd) =>
          set((state) => ({
            contract: { ...state.contract, payDateEnd }
          })),

        // Creative
        updateCreative: (data) =>
          set((state) => ({
            creative: { ...state.creative, ...data }
          })),

        setCreativeExternalId: (externalId) =>
          set((state) => ({
            creative: { ...state.creative, externalId }
          })),

        setCreativeContracts: (contractIds) =>
          set((state) => ({
            creative: { ...state.creative, contractExternalIds: contractIds }
          })),

        setCreativeKktus: (kktus) =>
          set((state) => ({
            creative: { ...state.creative, kktus }
          })),

        setCreativeFormat: (format) =>
          set((state) => ({
            creative: { ...state.creative, format }
          })),

        setCreativeContentUrls: (urls) =>
          set((state) => ({
            creative: { ...state.creative, contentUrls: urls }
          })),

        setCreativeText: (text) =>
          set((state) => ({
            creative: { ...state.creative, text }
          })),

        setCreativeName: (name) =>
          set((state) => ({
            creative: { ...state.creative, name }
          })),

        setCreativeMediaFiles: (files) =>
          set((state) => ({
            creative: { ...state.creative, mediaFiles: files }
          })),

        // ERID
        setErid: (erid) => set({ erid }),

        // Party history
        addToPartyHistory: (item) =>
          set((state) => {
            // Use external_id for comparison if available, fallback to inn
            const existingIndex = state.partyHistory.findIndex((h) => 
              (item.external_id && h.external_id === item.external_id) || 
              (!item.external_id && h.inn === item.inn)
            )
            const newHistory = [...state.partyHistory]

            if (existingIndex >= 0) {
              newHistory[existingIndex] = item
            } else {
              newHistory.unshift(item)
            }

            return { partyHistory: newHistory.slice(0, 10) }
          }),

        // Loading state
        setLoading: (key, value) =>
          set((state) => ({
            loadingState: { ...state.loadingState, [key]: value }
          })),

        // Template actions
        setLoadedTemplate: (templateId) =>
          set({ loadedTemplateId: templateId, isTemplateLoaded: !!templateId }),

        clearLoadedTemplate: () =>
          set({ loadedTemplateId: null, isTemplateLoaded: false }),

        // Clear actions
        clearStep: (step) =>
          set((state) => {
            switch (step) {
              case 1:
                return {
                  advertiser: initialAdvertiserState,
                  contractor: initialContractorState,
                  consent: false,
                  erid: null
                }
              case 2:
                return {
                  contract: initialContractState,
                  erid: null
                }
              case 3:
                return {
                  creative: initialCreativeState,
                  erid: null
                }
              case 4:
                return {
                  erid: null
                }
              default:
                return state
            }
          }),

        clearAll: () =>
          set((state) => ({
            currentStep: 1,
            consent: false,
            openSections: { 1: true, 2: false, 3: false, 4: false },
            showCreativeFlow: false,
            advertiser: initialAdvertiserState,
            contractor: initialContractorState,
            contract: { ...initialContractState, externalId: generateContractExternalId(new Date(), 1) },
            creative: { ...initialCreativeState, externalId: nowTimestampString() },
            erid: null,
            loadedTemplateId: null,
            isTemplateLoaded: false,
            // Keep party history
            partyHistory: state.partyHistory
          }))
      }
    }),
    {
      name: 'vk-ord-wizard',
      // Only persist specific fields (exclude actions and mediaFiles)
      partialize: (state) => ({
        currentStep: state.currentStep,
        consent: state.consent,
        openSections: state.openSections,
        advertiser: {
          inn: state.advertiser.inn,
          external_id: state.advertiser.external_id,
          name: state.advertiser.name,
          shortWithOpf: state.advertiser.shortWithOpf,
          info: state.advertiser.info,
          role: state.advertiser.role
        },
        contractor: {
          inn: state.contractor.inn,
          external_id: state.contractor.external_id,
          name: state.contractor.name,
          shortWithOpf: state.contractor.shortWithOpf,
          info: state.contractor.info,
          role: state.contractor.role
        },
        contract: state.contract,
        creative: {
          externalId: state.creative.externalId,
          contractExternalIds: state.creative.contractExternalIds,
          kktus: state.creative.kktus,
          format: state.creative.format,
          contentUrls: state.creative.contentUrls,
          text: state.creative.text,
          name: state.creative.name
          // Don't persist mediaFiles (File objects can't be serialized)
        },
        erid: state.erid,
        partyHistory: state.partyHistory,
        loadedTemplateId: state.loadedTemplateId,
        isTemplateLoaded: state.isTemplateLoaded
      }),
      onRehydrateStorage: () => (state) => {
        // Ensure mediaFiles is always an array after rehydration
        if (state && !state.creative.mediaFiles) {
          state.creative.mediaFiles = []
        }
        
        // ВАЖНО: Генерируем НОВЫЙ externalId для креатива при загрузке страницы
        // Это гарантирует, что при refresh страницы креатив всегда будет новым
        if (state) {
          state.creative.externalId = nowTimestampString()
        }
      }
    }
  )
)

// Selectors for optimized re-renders
export const useWizardStep = () => useWizardStore((state) => state.currentStep)
export const useWizardConsent = () => useWizardStore((state) => state.consent)
export const useWizardOpenSections = () => useWizardStore((state) => state.openSections)
export const useShowCreativeFlow = () => useWizardStore((state) => state.showCreativeFlow)
export const useWizardAdvertiser = () => useWizardStore((state) => state.advertiser)
export const useWizardContractor = () => useWizardStore((state) => state.contractor)
export const useWizardContract = () => useWizardStore((state) => state.contract)
export const useWizardCreative = () => useWizardStore((state) => state.creative)
export const useWizardErid = () => useWizardStore((state) => state.erid)
export const useWizardPartyHistory = () => useWizardStore((state) => state.partyHistory)
export const useWizardLoadingState = () => useWizardStore((state) => state.loadingState)
export const useWizardActions = () => useWizardStore((state) => state.actions)

// Computed selectors
export const useCanNextFromStep1 = () =>
  useWizardStore((state) =>
    state.advertiser.inn.length > 0 &&
    state.contractor.inn.length > 0 &&
    state.advertiser.external_id !== null &&
    state.contractor.external_id !== null &&
    state.consent &&
    state.advertiser.role.length > 0 &&
    state.contractor.role.length > 0
  )

export const useCanNextFromStep2 = () =>
  useWizardStore((state) =>
    !!state.contract.externalId &&
    !!state.contract.paySum &&
    state.contract.paySum > 0
  )

export const useCanSubmitCreative = () =>
  useWizardStore((state) =>
    !!state.creative.externalId &&
    state.creative.contractExternalIds.length >= 1 &&
    state.creative.kktus.length > 0 &&
    !!state.creative.name?.trim() &&
    !!state.creative.text?.trim()
  )
