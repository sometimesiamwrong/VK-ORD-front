import React from 'react'
import {
  Box,
  Typography,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActs, useParties, usePartiesSearch, useActDetails, useContractsByParty, useContractCreatives } from './hooks'
import { PartyLookup } from './components/PartyLookup'
import { ActListPanel } from './components/ActListPanel'
import { ActEditor } from './components/ActEditor'
import { ActHintsSidebar } from './components/ActHintsSidebar'
import { ActCreationFlow } from './components/ActCreationFlow'
import { toast } from 'sonner'
import type { CounterpartyItem, ActSummary, ContractDto } from '../../types'

export const ActsPage: React.FC = () => {
  const navigate = useNavigate()
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
    externalId: selectedParty?.externalId || '',
    page,
    limit: rowsPerPage
  })
  const { data: selectedAct, isLoading: isLoadingActDetails } = useActDetails(selectedActId || '')
  const { data: contractsData } = useContractsByParty(selectedParty?.externalId || '')
  const { data: contractCreativesData } = useContractCreatives(selectedContractId)

  const acts = actsData?.data || []
  const totalActs = actsData?.totalItemsCount || 0
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
    // Navigate to edit page with selected party info
    navigate(`/acts/${act.externalId}/edit`, {
      state: {
        party: selectedParty
      }
    })
  }

  const handleCreateAct = () => {
    setShowCreationFlow(true)
    setIsCreatingNewAct(false)
    setSelectedActId(null) // Убираем выбранный акт при создании нового
  }

  const handleActCreateFromFlow = (client: CounterpartyItem, contractor: CounterpartyItem, contract: ContractDto) => {
    // Переходим на полную форму создания акта с полными данными через state
    navigate('/acts/new', {
      state: {
        client,
        contractor,
        contract
      }
    })
    toast.success(`Переход к созданию акта: ${client.name} ↔ ${contractor.name}`)
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
            <Button variant="outline" onClick={handleCancelCreationFlow}>
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
              onCancel={handleCancelCreateAct}
              onContractSelect={handleContractSelect}
              onSave={() => toast.info('Используйте страницу редактирования акта')}
              onSubmit={() => toast.info('Используйте страницу редактирования акта')}
              onExport={() => toast.info('Экспорт пока недоступен')}
              onDelete={() => toast.info('Используйте страницу редактирования акта')}
            />
          </Box>
          <ActHintsSidebar
            act={selectedAct || null}
            onCreateRelatedAct={() => toast.info('Используйте кнопку "Создать акт" выше')}
            onCopyClientDetails={() => toast.info('Копирование пока недоступно')}
          />
        </Box>
      )}
    </Box>
  )
}
