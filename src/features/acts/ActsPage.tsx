import React from 'react'
import {
  Box,
  Typography,
  Button,
} from '@mui/material'
import { useState } from 'react'
import { useActs, useParties, usePartiesSearch, useActDetails, useContractsByParty, useContractCreatives } from './hooks'
import { PartyLookup } from './components/PartyLookup'
import { ActListPanel } from './components/ActListPanel'
import { ActEditor } from './components/ActEditor'
import { ActHintsSidebar } from './components/ActHintsSidebar'
import { ActCreationFlow } from './components/ActCreationFlow'
import { toast } from '../../utils/toast'
import type { CounterpartyItem, ActSummary, ContractDto } from '../../types'

export const ActsPage: React.FC = () => {
  const [selectedParty, setSelectedParty] = useState<CounterpartyItem | null>(null)
  const [selectedActId, setSelectedActId] = useState<string | null>(null)
  const [selectedContractId, setSelectedContractId] = useState<string>('')
  const [isCreatingNewAct, setIsCreatingNewAct] = useState(false)
  const [showCreationFlow, setShowCreationFlow] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // API hooks
  const { data: parties = [], isLoading: isLoadingParties } = useParties()
  const partiesSearchMutation = usePartiesSearch()
  const { data: actsData, isLoading: isLoadingActs, error: actsError } = useActs({
    companyId: selectedParty?.juridicalDetails?.inn || '',
    page,
    limit: rowsPerPage
  })
  const { data: selectedAct, isLoading: isLoadingActDetails } = useActDetails(selectedActId || '')
  const { data: contractsData } = useContractsByParty(selectedParty?.juridicalDetails?.inn || '')
  const { data: contractCreativesData } = useContractCreatives(selectedContractId)

  const acts = actsData?.acts || []
  const totalActs = actsData?.total || 0
  const contracts = contractsData?.contracts || []
  const creatives = contractCreativesData?.creatives || []

  // Party search with autocomplete
  const handlePartySelect = (party: CounterpartyItem | null) => {
    setSelectedParty(party)
    setSelectedActId(null)
    setPage(0) // Reset pagination when changing party
  }

  const handlePartySearch = async (query: string) => {
    if (!query.trim()) return parties

    try {
      const result = await partiesSearchMutation.mutateAsync(query)
      return result
    } catch (error) {
      toast.error('Ошибка при поиске контрагентов')
      return []
    }
  }

  const handleActSelect = (act: ActSummary) => {
    setSelectedActId(act.id)
  }

  const handleCreateAct = () => {
    setShowCreationFlow(true)
    setIsCreatingNewAct(false)
    setSelectedActId(null) // Убираем выбранный акт при создании нового
  }

  const handleActCreateFromFlow = (firstParty: CounterpartyItem, secondParty: CounterpartyItem, contract: ContractDto) => {
    setSelectedParty(firstParty)
    setSelectedContractId(contract.externalId || '')
    setIsCreatingNewAct(true)
    setShowCreationFlow(false)
    toast.success(`Акт создан для ${firstParty.name} и ${secondParty.name}`)
  }

  const handleCancelCreationFlow = () => {
    setShowCreationFlow(false)
  }

  const handleContractSelect = (contractId: string) => {
    setSelectedContractId(contractId)
  }

  const handleCancelCreateAct = () => {
    setIsCreatingNewAct(false)
    setSelectedActId(null)
  }


  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление актами
      </Typography>

      {/* New Act Creation Flow */}
      {showCreationFlow && (
        <Box sx={{ mb: 3 }}>
          <ActCreationFlow onActCreate={handleActCreateFromFlow} />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="outlined" onClick={handleCancelCreationFlow}>
              Отмена
            </Button>
          </Box>
        </Box>
      )}

      {/* Top Section: Party Search and Acts List */}
      {!showCreationFlow && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
          {/* Party Search Section */}
          <Box sx={{ flex: { xs: 1, lg: '0 0 33.333%' } }}>
            <PartyLookup
              selectedCompany={selectedParty}
              companies={parties}
              isLoadingCompanies={isLoadingParties}
              companySearchLoading={partiesSearchMutation.isPending}
              onCompanySelect={handlePartySelect}
              onCompanySearch={handlePartySearch}
            />
          </Box>

          {/* Acts List Section */}
          <Box sx={{ flex: { xs: 1, lg: '0 0 66.667%' } }}>
            <ActListPanel
              selectedCompany={selectedParty}
              acts={acts}
              totalActs={totalActs}
              isLoading={isLoadingActs}
              error={actsError}
              page={page}
              rowsPerPage={rowsPerPage}
              selectedActId={selectedActId}
              onActSelect={handleActSelect}
              onCreateAct={handleCreateAct}
              onPageChange={setPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </Box>
        </Box>
      )}

      {/* Bottom Section: Act Editor with Sidebar */}
      {(selectedActId || isCreatingNewAct) && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <ActEditor
              act={selectedAct || null}
              isLoading={isLoadingActDetails}
              isCreatingNew={isCreatingNewAct}
              contracts={contracts}
              creatives={creatives}
              onSave={() => console.log('Save act')}
              onSubmit={() => console.log('Submit act')}
              onExport={() => console.log('Export act')}
              onDelete={() => console.log('Delete act')}
              onCancel={handleCancelCreateAct}
              onContractSelect={handleContractSelect}
            />
          </Box>
          <ActHintsSidebar
            act={selectedAct || null}
            onCreateRelatedAct={() => console.log('Create related act')}
            onCopyClientDetails={() => console.log('Copy client details')}
          />
        </Box>
      )}
    </Box>
  )
}
