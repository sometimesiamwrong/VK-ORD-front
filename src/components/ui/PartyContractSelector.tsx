import React, { useState, useMemo, useEffect } from 'react'
import {
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Autocomplete,
  TextField,
  CircularProgress,
} from '@mui/material'
import {
  Close as CloseIcon,
  Description as ContractIcon,
} from '@mui/icons-material'
import { PartyModal } from './PartyModal'
import { useCounterpartyContractsQuery, useCounterpartyByExternalIdQuery } from '@/hooks/useCounterparties'
import type { CounterpartyItem, ContractDto } from '@/types'

export interface PartyContractSelectionResult {
  party1: CounterpartyItem
  party2: CounterpartyItem
  contract: ContractDto
}

export interface PartyContractSelectorProps {
  // Метки для контрагентов
  party1Label: string
  party2Label: string

  // Иконки для карточек контрагентов
  party1Icon: React.ReactNode
  party2Icon: React.ReactNode

  // Callback при завершении выбора
  onSelectionComplete?: (selection: PartyContractSelectionResult) => void

  // Список контрагентов для выбора
  parties: CounterpartyItem[]
  isLoadingParties?: boolean

  // Поиск контрагентов
  onSearchParties?: (query: string) => Promise<CounterpartyItem[]>

  // Заголовки для модальных окон
  party1ModalTitle?: string
  party2ModalTitle?: string

  // Показывать ли дополнительную информацию о поиске
  showSearchInfo?: boolean

  // Начальные значения (для редактирования)
  initialParty1?: CounterpartyItem | null
  initialParty2?: CounterpartyItem | null
  initialContract?: ContractDto | null

  // Режим автоматического выбора из договора
  autoSelectFromContract?: boolean

  // Рендер кастомных кнопок действий
  renderActions?: (canProceed: boolean) => React.ReactNode
}

export const PartyContractSelector: React.FC<PartyContractSelectorProps> = ({
  party1Label,
  party2Label,
  party1Icon,
  party2Icon,
  onSelectionComplete,
  parties,
  isLoadingParties = false,
  onSearchParties,
  party1ModalTitle,
  party2ModalTitle,
  showSearchInfo = true,
  initialParty1 = null,
  initialParty2 = null,
  initialContract = null,
  autoSelectFromContract = true,
  renderActions,
}) => {
  const [party1, setParty1] = useState<CounterpartyItem | null>(initialParty1)
  const [party2, setParty2] = useState<CounterpartyItem | null>(initialParty2)
  const [selectedContract, setSelectedContract] = useState<ContractDto | null>(initialContract)
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false)
  const [partyModalType, setPartyModalType] = useState<'party1' | 'party2'>('party1')

  // Флаг: контрагенты выбраны вручную пользователем (не из договора)
  const [isManualSelection, setIsManualSelection] = useState(!autoSelectFromContract)

  // Получаем контракты party1 (когда он выбран)
  const { data: party1ContractsData, isLoading: isLoadingParty1Contracts, error: party1ContractsError } = useCounterpartyContractsQuery(
    {
      externalId: party1?.externalId || '',
      cacheOnly: false
    },
    !!party1?.externalId
  )
  const party1Contracts = party1ContractsData?.contracts || []

  // Получаем контракты party2 (когда он выбран)
  const { data: party2ContractsData, isLoading: isLoadingParty2Contracts, error: party2ContractsError } = useCounterpartyContractsQuery(
    {
      externalId: party2?.externalId || '',
      cacheOnly: false
    },
    !!party2?.externalId
  )
  const party2Contracts = party2ContractsData?.contracts || []

  // Находим общие договора между контрагентами
  const commonContracts = useMemo(() => {
    if (!party1 || !party2) {
      return []
    }

    const party1ExtId = party1.externalId
    const party2ExtId = party2.externalId

    console.log('=== Finding common contracts (ANY roles) ===')
    console.log('Party1 external_id:', party1ExtId)
    console.log('Party2 external_id:', party2ExtId)
    console.log('Party1 contracts count:', party1Contracts.length)
    console.log('Party2 contracts count:', party2Contracts.length)
    console.log('isManualSelection:', isManualSelection)

    // Объединяем оба массива и убираем дубликаты по externalId
    const allContracts = [...party1Contracts, ...party2Contracts]
    console.log('All contracts (before dedup):', allContracts.length)

    const uniqueContracts = allContracts.filter((contract, index, self) =>
      index === self.findIndex(c =>
        (c.externalId || c.externalId) === (contract.externalId || contract.externalId)
      )
    )
    console.log('Unique contracts (after dedup):', uniqueContracts.length)

    // Фильтруем: оставляем только те, где оба контрагента присутствуют в ЛЮБЫХ ролях
    const common = uniqueContracts.filter(contract => {
      const contractClientId = contract.data?.clientExternalId || contract.clientExternalId
      const contractContractorId = contract.data?.contractorExternalId || contract.contractorExternalId

      console.log('Checking contract:', {
        serial: contract.data?.serial || contract.externalId,
        contractClientId,
        contractContractorId,
        selectedParty1: party1ExtId,
        selectedParty2: party2ExtId
      })

      // Проверяем две комбинации:
      const directMatch = contractClientId === party1ExtId && contractContractorId === party2ExtId
      const reverseMatch = contractClientId === party2ExtId && contractContractorId === party1ExtId

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
  }, [party1, party2, party1Contracts, party2Contracts, isManualSelection])

  // Определяем какие договора показывать и состояние загрузки
  const contracts = useMemo(() => {
    // Если выбраны оба контрагента - показываем только общие
    if (party1 && party2) {
      console.log('📋 Showing COMMON contracts (any roles):', commonContracts.length)
      return commonContracts
    }

    // Если выбран только party1 - показываем его договора
    if (party1 && !party2) {
      console.log('📋 Showing PARTY1 contracts:', party1Contracts.length)
      return party1Contracts
    }

    // Если выбран только party2 - показываем его договора
    if (party2 && !party1) {
      console.log('📋 Showing PARTY2 contracts:', party2Contracts.length)
      return party2Contracts
    }

    console.log('📋 Showing NO contracts')
    return []
  }, [party1, party2, commonContracts, party1Contracts, party2Contracts])

  const isLoadingContracts = isLoadingParty1Contracts || isLoadingParty2Contracts

  // Определяем externalId контрагентов из выбранного контракта
  const party1ExternalIdFromContract = selectedContract?.data?.clientExternalId
    || selectedContract?.clientExternalId
    || ''

  const party2ExternalIdFromContract = selectedContract?.data?.contractorExternalId
    || selectedContract?.contractorExternalId
    || ''

  console.log('=== PartyContractSelector State ===')
  console.log('selectedContract:', selectedContract)
  console.log('selectedContract.data:', selectedContract?.data)
  console.log('party1ExternalId from contract:', party1ExternalIdFromContract)
  console.log('party2ExternalId from contract:', party2ExternalIdFromContract)

  // Автоматически загружаем party1 из контракта через API
  const { data: party1FromContract, error: party1Error, isLoading: isLoadingParty1FromContract } = useCounterpartyByExternalIdQuery(
    party1ExternalIdFromContract,
    !!party1ExternalIdFromContract && autoSelectFromContract
  )

  // Автоматически загружаем party2 из контракта через API
  const { data: party2FromContract, error: party2Error, isLoading: isLoadingParty2FromContract } = useCounterpartyByExternalIdQuery(
    party2ExternalIdFromContract,
    !!party2ExternalIdFromContract && autoSelectFromContract
  )

  console.log('Party1 query state:', {
    isLoading: isLoadingParty1FromContract,
    hasData: !!party1FromContract,
    hasError: !!party1Error
  })
  console.log('Party2 query state:', {
    isLoading: isLoadingParty2FromContract,
    hasData: !!party2FromContract,
    hasError: !!party2Error
  })

  const handleParty1Click = () => {
    // Если контракт уже выбран, сбрасываем его и переходим в режим ручного выбора
    if (selectedContract) {
      setSelectedContract(null)
      setParty2(null)
    }
    setIsManualSelection(true)
    setPartyModalType('party1')
    setIsPartyModalOpen(true)
  }

  const handleParty2Click = () => {
    // Если контракт уже выбран, сбрасываем его и переходим в режим ручного выбора
    if (selectedContract) {
      setSelectedContract(null)
      setParty1(null)
    }
    setIsManualSelection(true)
    setPartyModalType('party2')
    setIsPartyModalOpen(true)
  }

  const handleClearParty1 = (e: React.MouseEvent) => {
    e.stopPropagation()
    setParty1(null)
    setSelectedContract(null)
    setIsManualSelection(true)
  }

  const handleClearParty2 = (e: React.MouseEvent) => {
    e.stopPropagation()
    setParty2(null)
    setSelectedContract(null)
    setIsManualSelection(true)
  }

  const handlePartySelect = (party: CounterpartyItem | null) => {
    if (partyModalType === 'party1') {
      setParty1(party)
      if (party2) {
        setSelectedContract(null)
      }
    } else if (partyModalType === 'party2') {
      setParty2(party)
      if (party1) {
        setSelectedContract(null)
      }
    }
    setIsPartyModalOpen(false)
  }

  // Автоматически устанавливаем party1 и party2 из выбранного контракта
  useEffect(() => {
    if (!autoSelectFromContract) return

    console.log('=== Auto-Set Parties Effect ===')
    console.log('party1FromContract:', party1FromContract)
    console.log('party2FromContract:', party2FromContract)
    console.log('selectedContract:', selectedContract)
    console.log('isManualSelection:', isManualSelection)
    console.log('current party1:', party1)
    console.log('current party2:', party2)

    // Только если это НЕ ручной выбор и договор выбран
    if (!isManualSelection && selectedContract && party1FromContract && party2FromContract) {
      // Проверяем, нужно ли обновлять контрагентов
      const party1Changed = party1?.externalId !== party1FromContract.externalId
      const party2Changed = party2?.externalId !== party2FromContract.externalId

      // Обновляем только если контрагенты отличаются от текущих
      if (party1Changed || party2Changed) {
        console.log('✅ Auto-setting parties from contract (changed)')
        setParty1(party1FromContract)
        setParty2(party2FromContract)
      } else {
        console.log('⏭️ Parties already set correctly, skipping')
      }
    } else {
      console.log('❌ Not setting parties:', {
        isManualSelection,
        hasSelectedContract: !!selectedContract,
        hasParty1FromContract: !!party1FromContract,
        hasParty2FromContract: !!party2FromContract
      })
    }
  }, [party1FromContract, party2FromContract, selectedContract, isManualSelection, autoSelectFromContract])

  const handleContractSelect = (contract: ContractDto | null) => {
    console.log('=== Contract selected ===')
    console.log('Contract:', contract)
    console.log('contract.data:', contract?.data)
    console.log('client_external_id:', contract?.data?.clientExternalId)
    console.log('contractor_external_id:', contract?.data?.contractorExternalId)
    console.log('isManualSelection:', isManualSelection)

    setSelectedContract(contract)

    // Если это ручной выбор (оба контрагента уже выбраны)
    if (isManualSelection && party1 && party2 && contract) {
      console.log('✅ Manual selection mode: checking roles in contract')

      // Получаем роли из договора
      const contractClientId = contract.data?.clientExternalId || contract.clientExternalId
      const contractContractorId = contract.data?.contractorExternalId || contract.contractorExternalId

      const currentParty1Id = party1.externalId
      const currentParty2Id = party2.externalId

      console.log('Contract roles:', { contractClientId, contractContractorId })
      console.log('Current selection:', { currentParty1Id, currentParty2Id })

      // Проверяем, нужно ли поменять местами
      const needSwap = contractClientId === currentParty2Id && contractContractorId === currentParty1Id

      if (needSwap) {
        console.log('🔄 Swapping parties to match contract roles')
        const temp = party1
        setParty1(party2)
        setParty2(temp)
      } else {
        console.log('✅ Roles match, no swap needed')
      }

      return
    }

    // Иначе переключаемся в автоматический режим - party1 и party2 загрузятся из договора
    if (autoSelectFromContract) {
      setIsManualSelection(false)
    }
  }

  // Эффект для вызова callback при завершении выбора
  useEffect(() => {
    if (party1 && party2 && selectedContract && onSelectionComplete) {
      onSelectionComplete({ party1, party2, contract: selectedContract })
    }
  }, [party1, party2, selectedContract])

  const canProceed = party1 && party2 && selectedContract

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Party 1 */}
        <Card
          sx={{
            flex: 1,
            cursor: 'pointer',
            border: party1 ? '2px solid' : '1px solid',
            borderColor: party1 ? 'primary.main' : 'divider',
            '&:hover': { borderColor: 'primary.main' },
            position: 'relative'
          }}
          onClick={handleParty1Click}
        >
          {party1 && (
            <IconButton
              onClick={handleClearParty1}
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
            {party1Icon}
            <Typography variant="h6" gutterBottom>
              {party1Label}
            </Typography>
            {party1 ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {party1.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ИНН: {party1.juridicalDetails?.inn || ''}
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
            opacity: party1 ? 1 : 0.5,
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
                  {selectedContract.data?.serial || selectedContract.externalId || 'Без номера'}
                </Typography>
                {(selectedContract.data?.createDate || selectedContract.data?.date) && (
                  <Typography variant="body2" color="text.secondary">
                    {new Date(
                      selectedContract.data?.createDate ||
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
                {party1 ? 'Выберите договор из списка ниже' : `Сначала выберите ${party1Label.toLowerCase()}`}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Party 2 */}
        <Card
          sx={{
            flex: 1,
            cursor: 'pointer',
            border: party2 ? '2px solid' : '1px solid',
            borderColor: party2 ? 'primary.main' : 'divider',
            '&:hover': { borderColor: 'primary.main' },
            position: 'relative'
          }}
          onClick={handleParty2Click}
        >
          {party2 && (
            <IconButton
              onClick={handleClearParty2}
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
            {party2Icon}
            <Typography variant="h6" gutterBottom>
              {party2Label}
            </Typography>
            {party2 ? (
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {party2.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ИНН: {party2.juridicalDetails?.inn || ''}
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
      {(party1 || party2) && (
        <Box sx={{ mb: 3 }}>
          {/* Показываем информацию о поиске общих договоров */}
          {showSearchInfo && party1 && party2 && (
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
                    {party1Label}
                  </Typography>
                  <Typography variant="body2" color="text.primary" noWrap>
                    {party1.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ИНН: {party1.juridicalDetails?.inn || 'Не указан'}
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
                    {party2Label}
                  </Typography>
                  <Typography variant="body2" color="text.primary" noWrap>
                    {party2.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ИНН: {party2.juridicalDetails?.inn || 'Не указан'}
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
          {showSearchInfo && ((party1 && !party2) || (party2 && !party1)) && (
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
                  {party1 ? party1Label : party2Label}
                </Typography>
                <Typography variant="body2" color="text.primary" noWrap>
                  {party1?.name || party2?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ИНН: {party1?.juridicalDetails?.inn || party2?.juridicalDetails?.inn || 'Не указан'}
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
              const serial = option.data?.serial || option.externalId || 'Без номера'
              const date = option.data?.createDate || option.data?.date || ''
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
                  party1 && party2
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
              const clientExtId = option.data?.clientExternalId || ''
              const contractorExtId = option.data?.contractorExternalId || ''

              // Находим соответствующих контрагентов в списке parties
              const clientParty = parties.find(p => p.externalId === clientExtId)
              const contractorParty = parties.find(p => p.externalId === contractorExtId)

              const serial = option.data?.serial || option.externalId || 'Без номера'
              const date = option.data?.createDate || option.data?.date || ''
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
                <li {...props} key={option.externalId}>
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

      {/* Рендер кастомных кнопок действий */}
      {renderActions && renderActions(!!canProceed)}

      {/* Модальное окно выбора контрагента */}
      <PartyModal
        open={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        onSelect={handlePartySelect}
        title={partyModalType === 'party1' ? (party1ModalTitle || `Выберите ${party1Label.toLowerCase()}`) : (party2ModalTitle || `Выберите ${party2Label.toLowerCase()}`)}
        counterparties={parties}
        loading={isLoadingParties}
        onSearch={onSearchParties}
      />
    </Box>
  )
}
