import React, { useState, useEffect } from 'react'
import {
  Paper,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Description as ContractIcon,
  Person as PersonIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useParties, usePartiesSearch, useContractsByParty, useRelatedParties, useContractBetweenParties } from '../hooks'
import { PartyModal } from '../../../components/ui/PartyModal'
import type { CounterpartyItem, ContractDto } from '../../../types'

interface ActCreationFlowProps {
  onActCreate: (firstParty: CounterpartyItem, secondParty: CounterpartyItem, contract: ContractDto) => void
}

export const ActCreationFlow: React.FC<ActCreationFlowProps> = ({ onActCreate }) => {
  const [firstParty, setFirstParty] = useState<CounterpartyItem | null>(null)
  const [secondParty, setSecondParty] = useState<CounterpartyItem | null>(null)
  const [selectedContract, setSelectedContract] = useState<ContractDto | null>(null)
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false)
  const [partyModalType, setPartyModalType] = useState<'first' | 'second'>('first')

  // API hooks
  const { data: parties = [], isLoading: isLoadingParties } = useParties()
  const partiesSearchMutation = usePartiesSearch()
  const { data: contractsData, isLoading: isLoadingContracts } = useContractsByParty(
    firstParty?.juridicalDetails?.inn || ''
  )
  const contracts = contractsData?.contracts || []
  const { data: relatedPartiesData, isLoading: isLoadingRelatedParties } = useRelatedParties(
    firstParty?.juridicalDetails?.inn || ''
  )
  const relatedParties = relatedPartiesData?.relatedCounterparties || []
  const { data: contractBetweenData, isLoading: isLoadingContractBetween } = useContractBetweenParties(
    firstParty?.juridicalDetails?.inn || '',
    secondParty?.juridicalDetails?.inn || ''
  )
  const contractBetweenParties = contractBetweenData?.contract || null

  const handleFirstPartyClick = () => {
    setPartyModalType('first')
    setIsPartyModalOpen(true)
  }

  const handleSecondPartyClick = () => {
    if (!firstParty) {
      return // Нельзя выбрать второго контрагента без первого
    }
    setPartyModalType('second')
    setIsPartyModalOpen(true)
  }

  const handleContractClick = () => {
    if (!firstParty) {
      return // Нельзя выбрать договор без первого контрагента
    }
    // Логика выбора договора будет реализована позже
  }

  const handlePartySelect = (party: CounterpartyItem | null) => {
    if (partyModalType === 'first') {
      setFirstParty(party)
      setSecondParty(null) // Сбрасываем второго контрагента
      setSelectedContract(null) // Сбрасываем договор
    } else {
      setSecondParty(party)
      // Договор автоматически найдется через хук useContractBetweenParties
    }
    setIsPartyModalOpen(false)
  }

  // Автоматически устанавливаем договор когда найден между контрагентами
  useEffect(() => {
    if (contractBetweenParties && firstParty && secondParty) {
      setSelectedContract(contractBetweenParties)
    }
  }, [contractBetweenParties, firstParty, secondParty])

  const handleContractSelect = (contract: ContractDto | null) => {
    setSelectedContract(contract)
    // Автоматически заполняем второго контрагента на основе договора
    if (contract && firstParty) {
      // Находим второго контрагента по contractorExternalId или clientExternalId
      const secondPartyInn = contract.clientExternalId === firstParty.juridicalDetails?.inn 
        ? contract.contractorExternalId 
        : contract.clientExternalId
      
      // Ищем контрагента в списке связанных
      const foundParty = relatedParties.find(party => 
        party.juridicalDetails?.inn === secondPartyInn
      )
      
      if (foundParty) {
        setSecondParty(foundParty)
      }
    }
  }

  const handleCreateAct = () => {
    if (firstParty && secondParty && selectedContract) {
      onActCreate(firstParty, secondParty, selectedContract)
    }
  }

  const canCreateAct = firstParty && secondParty && selectedContract

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Создание нового акта
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Первый контрагент */}
        <Card 
          sx={{ 
            flex: 1, 
            cursor: 'pointer',
            border: firstParty ? '2px solid' : '1px solid',
            borderColor: firstParty ? 'primary.main' : 'divider',
            '&:hover': { borderColor: 'primary.main' }
          }}
          onClick={handleFirstPartyClick}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Первый контрагент
            </Typography>
            {firstParty ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {firstParty.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ИНН: {firstParty.juridicalDetails?.inn || ''}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Нажмите для выбора
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Договор */}
        <Card 
          sx={{ 
            flex: 1, 
            cursor: firstParty ? 'pointer' : 'not-allowed',
            border: selectedContract ? '2px solid' : '1px solid',
            borderColor: selectedContract ? 'primary.main' : 'divider',
            opacity: firstParty ? 1 : 0.5,
            '&:hover': firstParty ? { borderColor: 'primary.main' } : {}
          }}
          onClick={handleContractClick}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <ContractIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Договор
            </Typography>
            {selectedContract ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {selectedContract.externalId || 'Без номера'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Сумма: {selectedContract.amount || '0'} ₽
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {firstParty ? 'Нажмите для выбора' : 'Сначала выберите контрагента'}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Второй контрагент */}
        <Card 
          sx={{ 
            flex: 1, 
            cursor: firstParty ? 'pointer' : 'not-allowed',
            border: secondParty ? '2px solid' : '1px solid',
            borderColor: secondParty ? 'primary.main' : 'divider',
            opacity: firstParty ? 1 : 0.5,
            '&:hover': firstParty ? { borderColor: 'primary.main' } : {}
          }}
          onClick={handleSecondPartyClick}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Второй контрагент
            </Typography>
            {secondParty ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {secondParty.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ИНН: {secondParty.juridicalDetails?.inn || ''}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {firstParty ? 'Нажмите для выбора' : 'Сначала выберите первого контрагента'}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Автокомплит для договоров */}
      {firstParty && (
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            options={contracts}
            getOptionLabel={(option) => `${option.externalId || 'Без номера'} - ${option.amount || '0'} ₽`}
            value={selectedContract}
            onChange={(_, newValue) => handleContractSelect(newValue)}
            loading={isLoadingContracts}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Выберите договор"
                placeholder="Поиск договора..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingContracts ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1">
                    {option.externalId || 'Без номера'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Сумма: {option.amount || '0'} ₽ • Статус: {option.syncStatus}
                  </Typography>
                </Box>
              </li>
            )}
            noOptionsText="Договоры не найдены"
            loadingText="Загрузка договоров..."
          />
        </Box>
      )}

      {/* Кнопка создания акта */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleCreateAct}
          disabled={!canCreateAct}
          sx={{ px: 4 }}
        >
          Создать акт
        </Button>
      </Box>

      {/* Модальное окно выбора контрагента */}
      <PartyModal
        open={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        onSelect={handlePartySelect}
        title={partyModalType === 'first' ? 'Выберите первого контрагента' : 'Выберите второго контрагента'}
        counterparties={parties}
        loading={isLoadingParties || partiesSearchMutation.isPending}
        onSearch={async (query: string) => {
          if (!query.trim()) {
            // Если это выбор второго контрагента, показываем только связанных
            return partyModalType === 'second' ? relatedParties : parties
          }
          try {
            const result = await partiesSearchMutation.mutateAsync(query)
            // Если это выбор второго контрагента, фильтруем только связанных
            if (partyModalType === 'second') {
              return result.filter((party: CounterpartyItem) => 
                relatedParties.some(related => related.juridicalDetails?.inn === party.juridicalDetails?.inn)
              )
            }
            return result
          } catch (error) {
            console.error('Search error:', error)
            return []
          }
        }}
      />
    </Paper>
  )
}
