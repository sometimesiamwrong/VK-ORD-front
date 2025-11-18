import React, { useState } from 'react'
import {
  Paper,
  Box,
  Typography,
  Button,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { toast } from 'sonner'
import { useParties, usePartiesSearch } from '../hooks'
import { PartyContractSelector } from '@/components/ui/PartyContractSelector'
import type { CounterpartyItem, ContractDto } from '../../../types'
import type { PartyContractSelectionResult } from '@/components/ui/PartyContractSelector'

interface ActCreationFlowProps {
  onActCreate: (client: CounterpartyItem, contractor: CounterpartyItem, contract: ContractDto) => void
}

export const ActCreationFlow: React.FC<ActCreationFlowProps> = ({ onActCreate }) => {
  const [selection, setSelection] = useState<PartyContractSelectionResult | null>(null)

  // API hooks
  const { data: parties = [], isLoading: isLoadingParties } = useParties()
  const partiesSearchMutation = usePartiesSearch()

  const handleSelectionChange = (newSelection: PartyContractSelectionResult) => {
    setSelection(newSelection)
  }

  const handleCreateAct = () => {
    if (selection) {
      onActCreate(selection.party1, selection.party2, selection.contract)
    }
  }

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Typography variant="h6" gutterBottom>
        Создание нового акта
      </Typography>

      <PartyContractSelector
        party1Label="Клиент (Заказчик)"
        party2Label="Подрядчик (Исполнитель)"
        party1Icon={<BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />}
        party2Icon={<PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />}
        onSelectionComplete={handleSelectionChange}
        parties={parties}
        isLoadingParties={isLoadingParties}
        onSearchParties={async (query: string) => {
          if (!query.trim()) {
            return parties
          }
          try {
            const result = await partiesSearchMutation.mutateAsync(query)
            return result
          } catch (error) {
            console.error('Search error:', error)
            toast.error('Ошибка при поиске контрагентов')
            return []
          }
        }}
        party1ModalTitle="Выберите клиента"
        party2ModalTitle="Выберите подрядчика (исполнителя)"
        showSearchInfo={true}
        autoSelectFromContract={true}
        renderActions={(canProceed) => (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateAct}
              disabled={!canProceed}
              sx={{ px: 4 }}
            >
              Создать акт
            </Button>
          </Box>
        )}
      />
    </Paper>
  )
}
