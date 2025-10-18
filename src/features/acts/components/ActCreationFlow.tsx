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
import { toast } from 'sonner'
import { useParties, usePartiesSearch } from '../hooks'
import { useCounterpartyContractsQuery, useCounterpartyByExternalIdQuery } from '../../../hooks/useCounterparties'
import { PartyModal } from '../../../components/ui/PartyModal'
import type { CounterpartyItem, ContractDto } from '../../../types'

interface ActCreationFlowProps {
  onActCreate: (client: CounterpartyItem, contractor: CounterpartyItem, contract: ContractDto) => void
}

export const ActCreationFlow: React.FC<ActCreationFlowProps> = ({ onActCreate }) => {
  const [client, setClient] = useState<CounterpartyItem | null>(null)
  const [contractor, setContractor] = useState<CounterpartyItem | null>(null)
  const [selectedContract, setSelectedContract] = useState<ContractDto | null>(null)
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false)
  const [partyModalType, setPartyModalType] = useState<'client' | 'contractor'>('client')

  // API hooks
  const { data: parties = [], isLoading: isLoadingParties } = useParties()
  const partiesSearchMutation = usePartiesSearch()
  
  // Получаем контракты клиента (только когда он выбран)
  const { data: contractsData, isLoading: isLoadingContracts, error: contractsError } = useCounterpartyContractsQuery(
    {
      externalId: client?.external_id || '',
      cacheOnly: false
    },
    !!client?.external_id
  )
  const contracts = contractsData?.contracts || []
  
  // Определяем externalId контрактора на основе выбранного контракта
  // Контрактор ВСЕГДА берется из поля contractorExternalId в data договора
  // API возвращает camelCase в data!
  const contractorExternalId = selectedContract?.data?.contractorExternalId 
    || selectedContract?.data?.contractor_external_id 
    || selectedContract?.contractorExternalId 
    || ''
  
  console.log('=== ActCreationFlow State ===')
  console.log('selectedContract:', selectedContract)
  console.log('selectedContract.data:', selectedContract?.data)
  console.log('contractorExternalId (camelCase):', selectedContract?.data?.contractorExternalId)
  console.log('contractor_external_id (snake_case):', selectedContract?.data?.contractor_external_id)
  console.log('Final contractorExternalId:', contractorExternalId)
  console.log('Will fetch contractor:', !!contractorExternalId)
  
  // Автоматически загружаем контрактора по его externalId через API (только когда контракт выбран)
  // Используется ручка: GET /api/client/counterparties/${externalId}
  const { data: contractorFromContract, error: contractorError, isLoading: isLoadingContractor } = useCounterpartyByExternalIdQuery(
    contractorExternalId,
    !!contractorExternalId
  )
  
  console.log('Contractor query state:', { 
    isLoading: isLoadingContractor, 
    hasData: !!contractorFromContract, 
    hasError: !!contractorError 
  })

  const handleClientClick = () => {
    setPartyModalType('client')
    setIsPartyModalOpen(true)
  }

  const handlePartySelect = (party: CounterpartyItem | null) => {
    // Модальное окно используется только для выбора клиента
    // Контрактор определяется автоматически из договора
    if (partyModalType === 'client') {
      setClient(party)
      setContractor(null) // Сбрасываем контрактора
      setSelectedContract(null) // Сбрасываем договор
    }
    setIsPartyModalOpen(false)
  }

  // Автоматически устанавливаем контрактора когда загружен из контракта
  useEffect(() => {
    console.log('=== Contractor Auto-Set Effect ===')
    console.log('contractorFromContract:', contractorFromContract)
    console.log('selectedContract:', selectedContract)
    console.log('current contractor:', contractor)
    
    if (contractorFromContract && selectedContract && !contractor) {
      console.log('✅ Auto-setting contractor from contract:', contractorFromContract)
      setContractor(contractorFromContract)
    } else {
      console.log('❌ Not setting contractor:', {
        hasContractorFromContract: !!contractorFromContract,
        hasSelectedContract: !!selectedContract,
        alreadyHasContractor: !!contractor
      })
    }
  }, [contractorFromContract, selectedContract, contractor])

  // Обработка ошибок загрузки контрактов
  useEffect(() => {
    if (contractsError) {
      console.error('Error loading contracts:', contractsError)
      toast.error('Ошибка при загрузке договоров')
    }
  }, [contractsError])

  // Обработка ошибок загрузки контрактора
  useEffect(() => {
    if (contractorError) {
      console.error('Error loading contractor:', contractorError)
      toast.error('Ошибка при загрузке данных контрактора')
      setContractor(null) // Сбрасываем контрактора при ошибке
    }
  }, [contractorError])

  const handleContractSelect = (contract: ContractDto | null) => {
    console.log('=== Contract selected ===')
    console.log('Contract:', contract)
    console.log('contract.data:', contract?.data)
    console.log('client_external_id:', contract?.data?.client_external_id)
    console.log('contractor_external_id:', contract?.data?.contractor_external_id)
    setSelectedContract(contract)
    // Сбрасываем контрактора, чтобы он загрузился заново через хук
    setContractor(null)
  }

  const handleCreateAct = () => {
    if (client && contractor && selectedContract) {
      onActCreate(client, contractor, selectedContract)
    }
  }

  const canCreateAct = client && contractor && selectedContract

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Создание нового акта
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Клиент */}
        <Card 
          sx={{ 
            flex: 1, 
            cursor: 'pointer',
            border: client ? '2px solid' : '1px solid',
            borderColor: client ? 'primary.main' : 'divider',
            '&:hover': { borderColor: 'primary.main' }
          }}
          onClick={handleClientClick}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Клиент
            </Typography>
            {client ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {client.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ИНН: {client.juridical_details?.inn || ''}
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
            border: selectedContract ? '2px solid' : '1px solid',
            borderColor: selectedContract ? 'primary.main' : 'divider',
            opacity: client ? 1 : 0.5,
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <ContractIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Договор
            </Typography>
            {selectedContract ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {selectedContract.external_id || selectedContract.externalId || selectedContract.data?.serial || 'Без номера'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Сумма: {selectedContract.data?.amount || selectedContract.amount || '0'} ₽
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {client ? 'Выберите договор из списка ниже' : 'Сначала выберите клиента'}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Контрактор (Заказчик) */}
        <Card 
          sx={{ 
            flex: 1, 
            border: contractor ? '2px solid' : '1px solid',
            borderColor: contractor ? 'primary.main' : 'divider',
            opacity: selectedContract ? 1 : 0.5,
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Контрактор (Заказчик)
            </Typography>
            {contractor ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {contractor.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ИНН: {contractor.juridical_details?.inn || ''}
                </Typography>
                <Typography variant="caption" color="success.main">
                  Определён автоматически
                </Typography>
              </Box>
            ) : selectedContract ? (
              <Box>
                <CircularProgress size={24} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Загрузка контрактора...
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Выберите договор
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Автокомплит для договоров */}
      {client && (
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            options={contracts}
            getOptionLabel={(option) => {
              const serial = option.data?.serial || option.external_id || option.externalId || 'Без номера'
              const amount = option.data?.amount || option.amount || '0'
              return `${serial} - ${amount} ₽`
            }}
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
                    {option.data?.serial || option.external_id || option.externalId || 'Без номера'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Сумма: {option.data?.amount || option.amount || '0'} ₽ • Статус: {option.sync_status || option.syncStatus}
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

      {/* Модальное окно выбора клиента */}
      <PartyModal
        open={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        onSelect={handlePartySelect}
        title="Выберите клиента"
        counterparties={parties}
        loading={isLoadingParties || partiesSearchMutation.isPending}
        onSearch={async (query: string) => {
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
      />
    </Paper>
  )
}
