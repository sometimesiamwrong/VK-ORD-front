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
  IconButton,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Description as ContractIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Close as CloseIcon,
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
  
  // Флаг: контрагенты выбраны вручную пользователем (не из договора)
  const [isManualSelection, setIsManualSelection] = useState(false)

  // API hooks
  const { data: parties = [], isLoading: isLoadingParties } = useParties()
  const partiesSearchMutation = usePartiesSearch()
  
  // Получаем контракты клиента (когда он выбран)
  const { data: clientContractsData, isLoading: isLoadingClientContracts, error: clientContractsError } = useCounterpartyContractsQuery(
    {
      externalId: client?.external_id || '',
      cacheOnly: false
    },
    !!client?.external_id
  )
  const clientContracts = clientContractsData?.contracts || []
  
  // Получаем контракты контрактора (когда он выбран)
  const { data: contractorContractsData, isLoading: isLoadingContractorContracts, error: contractorContractsError } = useCounterpartyContractsQuery(
    {
      externalId: contractor?.external_id || '',
      cacheOnly: false
    },
    !!contractor?.external_id
  )
  const contractorContracts = contractorContractsData?.contracts || []
  
  // Находим общие договора между клиентом и контрактором
  const commonContracts = React.useMemo(() => {
    // Если выбраны оба контрагента (в любом режиме)
    if (!client || !contractor) {
      return []
    }
    
    // Ищем договора, где контрагенты находятся в ЛЮБЫХ ролях
    const clientExtId = client.external_id
    const contractorExtId = contractor.external_id
    
    console.log('=== Finding common contracts (ANY roles) ===')
    console.log('Client external_id:', clientExtId)
    console.log('Contractor external_id:', contractorExtId)
    console.log('Client contracts count:', clientContracts.length)
    console.log('Contractor contracts count:', contractorContracts.length)
    console.log('isManualSelection:', isManualSelection)
    
    // Объединяем оба массива и убираем дубликаты по externalId
    const allContracts = [...clientContracts, ...contractorContracts]
    console.log('All contracts (before dedup):', allContracts.length)
    
    const uniqueContracts = allContracts.filter((contract, index, self) => 
      index === self.findIndex(c => 
        (c.externalId || c.external_id) === (contract.externalId || contract.external_id)
      )
    )
    console.log('Unique contracts (after dedup):', uniqueContracts.length)
    
    // Фильтруем: оставляем только те, где оба контрагента присутствуют в ЛЮБЫХ ролях
    const common = uniqueContracts.filter(contract => {
      const contractClientId = contract.data?.clientExternalId || contract.data?.client_external_id || contract.clientExternalId
      const contractContractorId = contract.data?.contractorExternalId || contract.data?.contractor_external_id || contract.contractorExternalId
      
      console.log('Checking contract:', {
        serial: contract.data?.serial || contract.externalId || contract.external_id,
        contractClientId,
        contractContractorId,
        selectedClient: clientExtId,
        selectedContractor: contractorExtId
      })
      
      // Проверяем две комбинации:
      // 1. Выбранный клиент = клиент в договоре, выбранный контрактор = контрактор в договоре
      const directMatch = contractClientId === clientExtId && contractContractorId === contractorExtId
      
      // 2. Выбранный клиент = контрактор в договоре, выбранный контрактор = клиент в договоре (обратная роль)
      const reverseMatch = contractClientId === contractorExtId && contractContractorId === clientExtId
      
      const isMatch = directMatch || reverseMatch
      
      if (isMatch) {
        console.log(`✅ Contract MATCH (${directMatch ? 'direct' : 'reverse'}):`, contract.data?.serial)
      } else {
        console.log('❌ Contract NO MATCH:', contract.data?.serial)
      }
      
      return isMatch
    })
    
    console.log('Common contracts found:', common.length)
    console.log('Common contracts:', common.map(c => c.data?.serial || c.externalId))
    return common
  }, [client, contractor, clientContracts, contractorContracts, isManualSelection])
  
  // Определяем какие договора показывать и состояние загрузки
  const contracts = React.useMemo(() => {
    // Если выбраны оба контрагента (в любом режиме) - показываем только общие
    if (client && contractor) {
      console.log('📋 Showing COMMON contracts (any roles):', commonContracts.length)
      return commonContracts
    }
    
    // Если выбран только клиент - показываем его договора
    if (client && !contractor) {
      console.log('📋 Showing CLIENT contracts:', clientContracts.length)
      return clientContracts
    }
    
    // Если выбран только контрактор - показываем его договора
    if (contractor && !client) {
      console.log('📋 Showing CONTRACTOR contracts:', contractorContracts.length)
      return contractorContracts
    }
    
    console.log('📋 Showing NO contracts')
    return []
  }, [client, contractor, commonContracts, clientContracts, contractorContracts])
    
  const isLoadingContracts = isManualSelection 
    ? (isLoadingClientContracts || isLoadingContractorContracts)
    : (isLoadingClientContracts || isLoadingContractorContracts)
  
  // Определяем externalId контрагентов из выбранного контракта
  // Клиент и контрактор ВСЕГДА берутся из полей в data договора
  // API возвращает camelCase в data!
  const clientExternalIdFromContract = selectedContract?.data?.clientExternalId 
    || selectedContract?.data?.client_external_id 
    || selectedContract?.clientExternalId 
    || ''
  
  const contractorExternalIdFromContract = selectedContract?.data?.contractorExternalId 
    || selectedContract?.data?.contractor_external_id 
    || selectedContract?.contractorExternalId 
    || ''
  
  console.log('=== ActCreationFlow State ===')
  console.log('selectedContract:', selectedContract)
  console.log('selectedContract.data:', selectedContract?.data)
  console.log('clientExternalId from contract:', clientExternalIdFromContract)
  console.log('contractorExternalId from contract:', contractorExternalIdFromContract)
  
  // Автоматически загружаем клиента из контракта через API
  const { data: clientFromContract, error: clientError, isLoading: isLoadingClientFromContract } = useCounterpartyByExternalIdQuery(
    clientExternalIdFromContract,
    !!clientExternalIdFromContract
  )
  
  // Автоматически загружаем контрактора из контракта через API
  const { data: contractorFromContract, error: contractorError, isLoading: isLoadingContractorFromContract } = useCounterpartyByExternalIdQuery(
    contractorExternalIdFromContract,
    !!contractorExternalIdFromContract
  )
  
  console.log('Client query state:', { 
    isLoading: isLoadingClientFromContract, 
    hasData: !!clientFromContract, 
    hasError: !!clientError 
  })
  console.log('Contractor query state:', { 
    isLoading: isLoadingContractorFromContract, 
    hasData: !!contractorFromContract, 
    hasError: !!contractorError 
  })

  const handleClientClick = () => {
    // Если контракт уже выбран, сбрасываем его и переходим в режим ручного выбора
    if (selectedContract) {
      setSelectedContract(null)
      setContractor(null)
    }
    setIsManualSelection(true) // Включаем ручной режим
    setPartyModalType('client')
    setIsPartyModalOpen(true)
  }

  const handleContractorClick = () => {
    // Если контракт уже выбран, сбрасываем его и переходим в режим ручного выбора
    if (selectedContract) {
      setSelectedContract(null)
      setClient(null)
    }
    setIsManualSelection(true) // Включаем ручной режим
    setPartyModalType('contractor')
    setIsPartyModalOpen(true)
  }

  const handleClearClient = (e: React.MouseEvent) => {
    e.stopPropagation() // Предотвращаем открытие модального окна
    setClient(null)
    setSelectedContract(null) // Сбрасываем договор при удалении клиента
    setIsManualSelection(true)
  }

  const handleClearContractor = (e: React.MouseEvent) => {
    e.stopPropagation() // Предотвращаем открытие модального окна
    setContractor(null)
    setSelectedContract(null) // Сбрасываем договор при удалении контрактора
    setIsManualSelection(true)
  }

  const handlePartySelect = (party: CounterpartyItem | null) => {
    // Выбор контрагента вручную
    if (partyModalType === 'client') {
      setClient(party)
      // Если выбран и другой контрагент, сбрасываем договор
      if (contractor) {
        setSelectedContract(null)
      }
    } else if (partyModalType === 'contractor') {
      setContractor(party)
      // Если выбран и другой контрагент, сбрасываем договор
      if (client) {
        setSelectedContract(null)
      }
    }
    setIsPartyModalOpen(false)
  }

  // Автоматически устанавливаем клиента и контрактора из выбранного контракта
  useEffect(() => {
    console.log('=== Auto-Set Client & Contractor Effect ===')
    console.log('clientFromContract:', clientFromContract)
    console.log('contractorFromContract:', contractorFromContract)
    console.log('selectedContract:', selectedContract)
    console.log('isManualSelection:', isManualSelection)
    console.log('current client:', client)
    console.log('current contractor:', contractor)
    
    // Только если это НЕ ручной выбор и договор выбран
    if (!isManualSelection && selectedContract && clientFromContract && contractorFromContract) {
      // Проверяем, нужно ли обновлять контрагентов
      const clientChanged = client?.external_id !== clientFromContract.external_id
      const contractorChanged = contractor?.external_id !== contractorFromContract.external_id
      
      // Обновляем только если контрагенты отличаются от текущих
      if (clientChanged || contractorChanged) {
        console.log('✅ Auto-setting client and contractor from contract (changed)')
        setClient(clientFromContract)
        setContractor(contractorFromContract)
      } else {
        console.log('⏭️ Client and contractor already set correctly, skipping')
      }
    } else {
      console.log('❌ Not setting client/contractor:', {
        isManualSelection,
        hasSelectedContract: !!selectedContract,
        hasClientFromContract: !!clientFromContract,
        hasContractorFromContract: !!contractorFromContract
      })
    }
  }, [clientFromContract, contractorFromContract, selectedContract, isManualSelection])

  // Обработка ошибок загрузки контрактов клиента
  useEffect(() => {
    if (clientContractsError) {
      console.error('Error loading client contracts:', clientContractsError)
      toast.error('Ошибка при загрузке договоров клиента')
    }
  }, [clientContractsError])
  
  // Обработка ошибок загрузки контрактов контрактора
  useEffect(() => {
    if (contractorContractsError) {
      console.error('Error loading contractor contracts:', contractorContractsError)
      toast.error('Ошибка при загрузке договоров контрактора')
    }
  }, [contractorContractsError])

  // Обработка ошибок загрузки клиента из контракта
  useEffect(() => {
    if (clientError) {
      console.error('Error loading client:', clientError)
      toast.error('Ошибка при загрузке данных клиента')
    }
  }, [clientError])

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
    console.log('client_external_id:', contract?.data?.clientExternalId || contract?.data?.client_external_id)
    console.log('contractor_external_id:', contract?.data?.contractorExternalId || contract?.data?.contractor_external_id)
    console.log('isManualSelection:', isManualSelection)
    
    setSelectedContract(contract)
    
    // Если это ручной выбор (оба контрагента уже выбраны)
    if (isManualSelection && client && contractor && contract) {
      console.log('✅ Manual selection mode: checking roles in contract')
      
      // Получаем роли из договора
      const contractClientId = contract.data?.clientExternalId || contract.data?.client_external_id || contract.clientExternalId
      const contractContractorId = contract.data?.contractorExternalId || contract.data?.contractor_external_id || contract.contractorExternalId
      
      const currentClientId = client.external_id
      const currentContractorId = contractor.external_id
      
      console.log('Contract roles:', { contractClientId, contractContractorId })
      console.log('Current selection:', { currentClientId, currentContractorId })
      
      // Проверяем, нужно ли поменять местами
      const needSwap = contractClientId === currentContractorId && contractContractorId === currentClientId
      
      if (needSwap) {
        console.log('🔄 Swapping client and contractor to match contract roles')
        // Меняем местами
        const temp = client
        setClient(contractor)
        setContractor(temp)
      } else {
        console.log('✅ Roles match, no swap needed')
      }
      
      return
    }
    
    // Иначе переключаемся в автоматический режим - клиент и контрактор загрузятся из договора
    setIsManualSelection(false)
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
        {/* Клиент (Заказчик) */}
        <Card 
          sx={{ 
            flex: 1, 
            cursor: 'pointer',
            border: client ? '2px solid' : '1px solid',
            borderColor: client ? 'primary.main' : 'divider',
            '&:hover': { borderColor: 'primary.main' },
            position: 'relative'
          }}
          onClick={handleClientClick}
        >
          {client && (
            <IconButton
              onClick={handleClearClient}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.main'
                },
                zIndex: 1
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              Клиент (Заказчик)
            </Typography>
            {client ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {client.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ИНН: {client.juridical_details?.inn || ''}
                </Typography>
                {selectedContract && !isManualSelection && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                    Из договора
                  </Typography>
                )}
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
                  {selectedContract.data?.serial || selectedContract.external_id || selectedContract.externalId || 'Без номера'}
                </Typography>
                {(selectedContract.data?.createDate || selectedContract.data?.create_date || selectedContract.data?.date) && (
                  <Typography variant="body2" color="text.secondary">
                    {new Date(
                      selectedContract.data?.createDate || 
                      selectedContract.data?.create_date || 
                      selectedContract.data?.date || ''
                    ).toLocaleDateString('ru-RU', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {client ? 'Выберите договор из списка ниже' : 'Сначала выберите клиента'}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Подрядчик (Исполнитель) */}
        <Card 
          sx={{ 
            flex: 1, 
            cursor: 'pointer',
            border: contractor ? '2px solid' : '1px solid',
            borderColor: contractor ? 'primary.main' : 'divider',
            '&:hover': { borderColor: 'primary.main' },
            position: 'relative'
          }}
          onClick={handleContractorClick}
        >
          {contractor && (
            <IconButton
              onClick={handleClearContractor}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'error.light',
                  color: 'error.main'
                },
                zIndex: 1
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" gutterBottom>
             Подрядчик (Исполнитель)
            </Typography>
            {contractor ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {contractor.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ИНН: {contractor.juridical_details?.inn || ''}
                </Typography>
                {selectedContract && !isManualSelection && (
                  <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                    Из договора
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Нажмите для выбора
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Автокомплит для договоров */}
      {(client || contractor) && (
        <Box sx={{ mb: 3 }}>
          {/* Показываем информацию о поиске общих договоров */}
          {client && contractor && (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="600" color="text.primary">
                  Поиск общих договоров
                </Typography>
                <Typography variant="caption" sx={{ 
                  px: 1.5, 
                  py: 0.5, 
                  bgcolor: commonContracts.length > 0 ? 'success.light' : 'warning.light',
                  color: commonContracts.length > 0 ? 'success.dark' : 'warning.dark',
                  borderRadius: 1,
                  fontWeight: 600
                }}>
                  {commonContracts.length} {commonContracts.length === 1 ? 'договор' : commonContracts.length > 1 && commonContracts.length < 5 ? 'договора' : 'договоров'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Контрагент 1
                  </Typography>
                  <Typography variant="body2" color="text.primary" noWrap>
                    {client.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ИНН: {client.juridical_details?.inn || 'Не указан'}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: 'text.secondary',
                  px: 1
                }}>
                  ↔
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    Контрагент 2
                  </Typography>
                  <Typography variant="body2" color="text.primary" noWrap>
                    {contractor.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ИНН: {contractor.juridical_details?.inn || 'Не указан'}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ 
                display: 'block',
                mt: 1,
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'grey.200'
              }}>
                💡 Показаны договора, где оба контрагента присутствуют в любой роли
              </Typography>
            </Box>
          )}
          
          {/* Информация для одного контрагента */}
          {((client && !contractor) || (contractor && !client)) && (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="600" color="text.primary">
                  Договора контрагента
                </Typography>
                <Typography variant="caption" sx={{ 
                  px: 1.5, 
                  py: 0.5, 
                  bgcolor: 'grey.200',
                  color: 'text.secondary',
                  borderRadius: 1,
                  fontWeight: 600
                }}>
                  {contracts.length} {contracts.length === 1 ? 'договор' : contracts.length > 1 && contracts.length < 5 ? 'договора' : 'договоров'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  {client ? 'Клиент' : 'Контрактор'}
                </Typography>
                <Typography variant="body2" color="text.primary" noWrap>
                  {client?.name || contractor?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ИНН: {client?.juridical_details?.inn || contractor?.juridical_details?.inn || 'Не указан'}
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ 
                display: 'block',
                mt: 1,
                pt: 1,
                borderTop: '1px solid',
                borderColor: 'grey.200'
              }}>
                💡 Выберите второго контрагента для поиска общих договоров
              </Typography>
            </Box>
          )}
          
          <Autocomplete
            options={contracts}
            getOptionLabel={(option) => {
              const serial = option.data?.serial || option.external_id || option.externalId || 'Без номера'
              const date = option.data?.createDate || option.data?.create_date || option.data?.date || ''
              const formattedDate = date ? new Date(date).toLocaleDateString('ru-RU', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              }) : ''
              return `${serial}${formattedDate ? ' • ' + formattedDate : ''}`
            }}
            value={selectedContract}
            onChange={(_, newValue) => handleContractSelect(newValue)}
            loading={isLoadingContracts}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  client && contractor 
                    ? 'Выберите общий договор' 
                    : 'Выберите договор'
                }
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
            renderOption={(props, option) => {
              // Получаем external IDs клиента и контрактора из договора
              const clientExtId = option.data?.clientExternalId || option.data?.client_external_id || ''
              const contractorExtId = option.data?.contractorExternalId || option.data?.contractor_external_id || ''
              
              // Находим соответствующих контрагентов в списке parties
              const clientParty = parties.find(p => p.external_id === clientExtId)
              const contractorParty = parties.find(p => p.external_id === contractorExtId)
              
              const serial = option.data?.serial || option.external_id || option.externalId || 'Без номера'
              const date = option.data?.createDate || option.data?.create_date || option.data?.date || ''
              const formattedDate = date ? new Date(date).toLocaleDateString('ru-RU', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              }) : ''
              
              // Сокращаем длинные названия
              const truncateName = (name: string, maxLength: number = 20) => {
                if (name.length <= maxLength) return name
                return name.substring(0, maxLength - 3) + '...'
              }
              
              return (
                <li {...props}>
                  <Box sx={{ 
                    width: '100%', 
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: 1.5,
                    alignItems: 'center',
                    py: 0.5
                  }}>
                    {/* Клиент - слева */}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Клиент
                      </Typography>
                      <Typography variant="body2" color="text.primary" noWrap title={clientParty?.name}>
                        {truncateName(clientParty?.name || 'Не найден', 40)}
                      </Typography>
                    </Box>
                    
                    {/* Номер и дата - по центру */}
                    <Box sx={{ textAlign: 'center', px: 1 }}>
                      <Typography variant="body2" fontWeight="600" color="primary.main" noWrap>
                        {serial}
                      </Typography>
                      {formattedDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                          {formattedDate}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* Контрактор - справа */}
                    <Box sx={{ minWidth: 0, textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Контрактор
                      </Typography>
                      <Typography variant="body2" color="text.primary" noWrap title={contractorParty?.name}>
                        {truncateName(contractorParty?.name || 'Не найден', 40)}
                      </Typography>
                    </Box>
                  </Box>
                </li>
              )
            }}
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
        title={partyModalType === 'client' ? 'Выберите клиента' : 'Выберите контрактора (заказчика)'}
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
