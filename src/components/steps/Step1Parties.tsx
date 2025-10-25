import { Button } from '../ui/button'
import React from 'react'
import {
  useWizardStep,
  useWizardConsent,
  useWizardPartyHistory,
  useWizardLoadingState,
  useWizardActions,
  useCanNextFromStep1,
  useWizardStore,
  useWizardOpenSections
} from '../../stores/wizardStore'
import { PartyModal } from '../ui/PartyModal'
import { PartyInputSection } from '../../features/wizard/components/PartyInputSection'
import { useStep1Logic } from '../../features/wizard/hooks/useStep1Logic'
import { TemplateIndicator } from '../../features/wizard/components/TemplateIndicator'

export const Step1Parties: React.FC = () => {
  const currentStep = useWizardStep()
  const consent = useWizardConsent()
  const partyHistory = useWizardPartyHistory()
  const loadingState = useWizardLoadingState()
  const canNextFromStep1 = useCanNextFromStep1()
  const { isTemplateLoaded } = useWizardStore()
  const openSections = useWizardOpenSections()
  const { setConsent, setStep, toggleSection } = useWizardActions()

  const {
    advertiser,
    contractor,
    counterpartiesList,
    isLoadingCounterparties,
    modalField,
    setModalField,
    lookupInn,
    handleCreateCounterparty,
    clearStep1,
    applyCounterpartyFromList,
    handleInnChange,
    recordInnToHistory,
    setAdvertiserRole,
    setContractorRole,
    isAdvertiserInCounterparties,
    isContractorInCounterparties
  } = useStep1Logic()

  return (
    <>
      <details 
        open={openSections[1]}
        onToggle={(e) => {
          const isOpen = (e.target as HTMLDetailsElement).open
          if (isOpen !== openSections[1]) {
            toggleSection(1)
          }
        }}
      >
        <summary>
          1) Контрагенты
          {isTemplateLoaded && <TemplateIndicator />}
        </summary>
        <div className="vk-card" style={{ marginTop: 10 }}>

          <PartyInputSection
            label="ИНН рекламодателя"
            inn={advertiser.inn}
            role={advertiser.role}
            info={advertiser.info}
            isLoading={loadingState['lookup-advertiser']}
            isInCounterparties={isAdvertiserInCounterparties}
            onInnChange={(value) => handleInnChange('advertiser', value)}
            onInnBlur={() => recordInnToHistory(advertiser.inn)}
            onRoleChange={(roles) => setAdvertiserRole(roles)}
            onSelectClick={() => setModalField('advertiser')}
            onLookupClick={() => lookupInn('advertiser')}
            onCreateClick={() => handleCreateCounterparty('advertiser')}
            isCreating={loadingState['create-advertiser']}
          />

          <div style={{ height: 14 }} />

          <PartyInputSection
            label="ИНН исполнителя"
            inn={contractor.inn}
            role={contractor.role}
            info={contractor.info}
            isLoading={loadingState['lookup-contractor']}
            isInCounterparties={isContractorInCounterparties}
            onInnChange={(value) => handleInnChange('contractor', value)}
            onInnBlur={() => recordInnToHistory(contractor.inn)}
            onRoleChange={(roles) => setContractorRole(roles)}
            onSelectClick={() => setModalField('contractor')}
            onLookupClick={() => lookupInn('contractor')}
            onCreateClick={() => handleCreateCounterparty('publisher')}
            isCreating={loadingState['create-contractor']}
          />

        <div style={{ marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
            />
            Согласен на обработку данных
          </label>
        </div>

        <div className="vk-mobile-button-row">
          <Button variant="outline" onClick={clearStep1}>
            Очистить поля
          </Button>
          <Button
            disabled={!canNextFromStep1}
            onClick={() => setStep(2)}
          >
            Далее
          </Button>
        </div>
      </div>
    </details>

    {/* Shared datalist for INN suggestions */}
    <datalist id="innHistory">
      {partyHistory.map(h => (
        <option key={h.inn} value={h.inn} label={`${h.shortWithOpf || h.fullName || ''}${h.type ? ` (${h.type})` : ''}`} />
      ))}
    </datalist>

    <PartyModal
      open={modalField === 'advertiser'}
      title="Выбор рекламодателя"
      counterparties={counterpartiesList}
      loading={isLoadingCounterparties}
      onSelect={(party) => { 
        if (party) {
          applyCounterpartyFromList('advertiser', party)
        }
        setModalField(null) 
      }}
      onClose={() => setModalField(null)}
        onEnterManually={(value) => {
          const inn = (value || '').replace(/\D/g, '')
          if (inn) {
            handleInnChange('advertiser', inn)
          }
          setModalField(null)
        }}
    />
    <PartyModal
      open={modalField === 'contractor'}
      title="Выбор исполнителя"
      counterparties={counterpartiesList}
      loading={isLoadingCounterparties}
      onSelect={(party) => { 
        if (party) {
          applyCounterpartyFromList('contractor', party)
        }
        setModalField(null) 
      }}
      onClose={() => setModalField(null)}
        onEnterManually={(value) => {
          const inn = (value || '').replace(/\D/g, '')
          if (inn) {
            handleInnChange('contractor', inn)
          }
          setModalField(null)
        }}
    />
    </>
  )
}
