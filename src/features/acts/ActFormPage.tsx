import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueries } from '@tanstack/react-query'
import type { ActDetails, InvoiceAmount } from '@/types'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  IconButton,
  Alert,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import {
  Save as SaveIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { toast } from 'sonner'
import {
  useContractsByParty,
  useContractCreatives,
  useCreateAct,
  useSubmitAct,
  useDeleteAct,
  useActDetails,
} from './hooks'
import { useContractDetailsQuery } from '@/hooks/useContracts'
import { ActRole } from '@/types'
import type { CreateActRequest, ContractDto } from '@/types'
import ContractsService from '@/services/contracts'
import { actFormSchema, getDefaultActFormValues, type ActFormData } from './schemas/actFormSchema'
import { mapFormDataToBackend } from './utils/formToBackendMapper'

// Helper function to map ActDetails to ActFormData
const mapActDetailsToFormData = (actDetails: ActDetails): Partial<ActFormData> => {
  return {
    externalId: actDetails.externalId || '',
    serial: actDetails.number || '',
    contractExternalId: actDetails.contractId || '',
    orderContractExternalId: null,
    date: actDetails.issueDate || new Date().toISOString().split('T')[0],
    dateStart: actDetails.periodStart || '',
    dateEnd: actDetails.periodEnd || '',
    amount: {
      includingVat: actDetails.totalAmount || 0,
      vatRate: actDetails.vatRate || 20,
      vat: actDetails.vatAmount || 0,
      excludingVat: actDetails.amountWithoutVat || 0,
    },
    clientRole: actDetails.advertiserRole || ActRole.advertiser,
    contractorRole: actDetails.contractorRole || ActRole.publisher,
    items: (actDetails.distributions || []).map(dist => ({
      contractExternalId: dist.contractExternalId || '',
      amount: {
        includingVat: parseFloat(dist.amount?.includingVat || '0'),
        vatRate: parseFloat(dist.amount?.vatRate || '20'),
        vat: parseFloat(dist.amount?.vat || '0'),
        excludingVat: parseFloat(dist.amount?.excludingVat || '0'),
      },
      creatives: dist.creatives || [],
    })),
    status: actDetails.status || 'draft',
    autoCalculate: false,  // Disable auto-calc when loading existing data
    statistics: actDetails.statistics || [],
  }
}

// Helper function to safely get amount values from V3 or legacy format
const getAmountValue = (amount: any, field: 'includingVat' | 'vatRate' | 'vat' | 'excludingVat'): number => {
  // V3 format with services object
  if (amount?.services) {
    const services = amount.services as any
    switch (field) {
      case 'includingVat':
        return Number(services.includingVat || services.including_vat || 0)
      case 'vatRate':
        return Number(services.vatRate || services.vat_rate || 20)
      case 'vat':
        return Number(services.vat || 0)
      case 'excludingVat':
        return Number(services.excludingVat || services.excluding_vat || 0)
    }
  }
  
  // Legacy format or form format with direct fields
  if (amount) {
    const value = amount[field] ?? amount[field.replace(/([A-Z])/g, '_$1').toLowerCase()] ?? 0
    return Number(value)
  }
  
  // Default values
  return field === 'vatRate' ? 20 : 0
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props
  return (
    <div role="tabpanel" hidden={value !== index} id={`act-tabpanel-${index}`}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export const ActFormPage: React.FC = () => {
  const { actId } = useParams<{ actId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isEditMode = !!actId

  // Get data from navigation state
  const locationState = location.state as {
    client?: any
    contractor?: any
    contract?: any
    party?: any  // Add party for edit mode
  } | undefined

  const clientFromState = locationState?.client
  const contractorFromState = locationState?.contractor
  const contractFromState = locationState?.contract
  const partyFromState = locationState?.party  // Party passed from ActsPage in edit mode

  const [activeTab, setActiveTab] = useState(0)

  // Determine roles from contract
  const getInitialRoles = () => {
    if (!contractFromState || !clientFromState || !contractorFromState) {
      return { clientRole: ActRole.advertiser, contractorRole: ActRole.publisher }
    }

    const contractClientId = contractFromState.data?.clientExternalId
    const isDirect = contractClientId === clientFromState.externalId

    return {
      clientRole: isDirect ? ActRole.advertiser : ActRole.publisher,
      contractorRole: isDirect ? ActRole.publisher : ActRole.advertiser
    }
  }

  const initialRoles = getInitialRoles()

  // React Hook Form setup
  const {
    control,
    watch,
    setValue,
    reset,
    trigger,
    getValues,
    formState: { errors: formErrors },
  } = useForm<ActFormData>({
    resolver: zodResolver(actFormSchema) as any,
    defaultValues: {
      ...getDefaultActFormValues(),
      contractExternalId: contractFromState?.externalId || '',
      clientRole: initialRoles.clientRole,
      contractorRole: initialRoles.contractorRole,
      amount: contractFromState?.amount ? {
        services: {
          includingVat: String(contractFromState.amount),
          vatRate: '20',
          vat: String(Number(contractFromState.amount) * 0.2),
          excludingVat: String(Number(contractFromState.amount) * 0.8),
        }
      } : getDefaultActFormValues().amount,
    },
    mode: 'onChange',
  })

  // useFieldArray for items (distributions)
  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: 'items',
  })

  // useFieldArray for statistics
  const {
    fields: statisticsFields,
    append: appendStatistic,
    remove: removeStatistic,
  } = useFieldArray({
    control,
    name: 'statistics',
  })

  // Watch form values
  const contractExternalId = watch('contractExternalId')
  const amount = watch('amount') ?? {
    includingVat: 0,
    vatRate: 20,
    vat: 0,
    excludingVat: 0,
  }
  const autoCalculate = watch('autoCalculate')
  const items = watch('items') || []

  // API hooks
  const { data: actDetails, isLoading: isLoadingActDetails } = useActDetails(actId || '')

  // Load contract details when editing (from actDetails.contractId)
  const contractIdFromAct = actDetails?.contractId || ''
  const { data: contractFromAct, isLoading: isLoadingContract } = useContractDetailsQuery(
    contractIdFromAct,
    isEditMode && !!contractIdFromAct
  )

  // Get effectivePartyId from state or from loaded party
  // In edit mode, use party passed from ActsPage
  // In create mode, use client from wizard flow
  const effectivePartyId = partyFromState?.externalId || clientFromState?.externalId || ''
  const { data: contractsData } = useContractsByParty(effectivePartyId)
  const { data: creativesData } = useContractCreatives(contractExternalId)

  // Mutations
  const createActMutation = useCreateAct()
  const submitActMutation = useSubmitAct()
  const deleteActMutation = useDeleteAct()

  const contracts = contractsData?.contracts || []
  const creatives = creativesData?.creatives || []

  // Get unique contract IDs from items for loading creatives
  const itemContractIds = useMemo(() => {
    const ids = items.map(item => item.contractExternalId).filter(Boolean)
    return [...new Set(ids)] // Remove duplicates
  }, [items])

  // Load creatives for each contract in items
  const itemCreativesQueries = useQueries({
    queries: itemContractIds.map(contractId => ({
      queryKey: ['contracts', 'details', contractId],
      queryFn: () => ContractsService.getDetails(contractId),
      enabled: !!contractId,
      staleTime: 5 * 60 * 1000,
    })),
  })

  // Create a map of creatives by contract ID
  const creativesByContract = useMemo(() => {
    const map = new Map<string, any[]>()

    // Add creatives from main contract
    if (contractExternalId && creatives) {
      map.set(contractExternalId, creatives)
    }

    // Add creatives from item contracts
    itemContractIds.forEach((contractId, index) => {
      const query = itemCreativesQueries[index]
      if (query?.data?.creatives) {
        map.set(contractId, query.data.creatives)
      }
    })

    return map
  }, [contractExternalId, creatives, itemContractIds, itemCreativesQueries])

  // Add contract from state and from act to contracts list if not already there
  const allContracts = React.useMemo(() => {
    const contractsList = [...contracts]

    // Add contract from navigation state if not in list
    if (contractFromState && !contractsList.find(c => c.externalId === contractFromState.externalId)) {
      contractsList.unshift(contractFromState)
    }

    // Add contract from loaded act if not in list
    if (contractFromAct && !contractsList.find(c => c.externalId === contractFromAct.externalId)) {
      contractsList.unshift(contractFromAct)
    }

    return contractsList
  }, [contractFromState, contractFromAct, contracts])

  // Load act data in edit mode
  useEffect(() => {
    if (isEditMode && actDetails && !isLoadingContract) {
      console.log('Loading act details:', actDetails)

      const formData = mapActDetailsToFormData(actDetails)
      console.log('Mapped form data:', formData)

      // Reset form with all values from loaded act
      reset(formData as ActFormData, {
        keepDefaultValues: false,
      })

      toast.success('Данные акта загружены')
    }
  }, [isEditMode, actDetails, isLoadingContract, reset])

  // Get selected contract object from contractExternalId
  const selectedContract = useMemo(() => {
    return allContracts.find(c => c.externalId === contractExternalId) || null
  }, [allContracts, contractExternalId])

  // Pre-select contract from state on mount (only for create mode)
  useEffect(() => {
    if (contractFromState && !isEditMode) {
      const contractId = contractFromState.externalId || ''
      if (contractId && watch('contractExternalId') !== contractId) {
        setValue('contractExternalId', contractId, { shouldValidate: true })
      }
    }
  }, [contractFromState, isEditMode, setValue, watch])

  // Auto-calculate VAT amounts
  useEffect(() => {
    const includingVat = getAmountValue(amount, 'includingVat')
    const vatRate = getAmountValue(amount, 'vatRate')
    if (autoCalculate && includingVat > 0) {
      const vat = includingVat * (vatRate / 100)
      const excludingVat = includingVat - vat
      setValue('amount.vat', Number(vat.toFixed(2)), { shouldValidate: false })
      setValue('amount.excludingVat', Number(excludingVat.toFixed(2)), { shouldValidate: false })
    }
  }, [amount, autoCalculate, setValue])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleContractChange = (contract: ContractDto | null) => {
    if (contract) {
      setValue('contractExternalId', contract.externalId || '', { shouldValidate: true })
      if (!isEditMode && contract.amount) {
        setValue('amount.includingVat', Number(contract.amount), { shouldValidate: true })
      }
      
      // Auto-set roles based on contract and client/contractor info
      if (clientFromState && contractorFromState) {
        const contractClientId = contract.data?.clientExternalId
        const isDirect = contractClientId === clientFromState.externalId

        // If client is the direct client in the contract, client is advertiser
        setValue('clientRole', isDirect ? ActRole.advertiser : ActRole.publisher, { shouldValidate: true })
        // If client is the direct client, contractor is publisher
        setValue('contractorRole', isDirect ? ActRole.publisher : ActRole.advertiser, { shouldValidate: true })
      }
    }
  }

  // Item handlers
  const handleAddItem = () => {
    appendItem({
      contractExternalId: '',
      amount: {
        excludingVat: 0,
        vatRate: getAmountValue(amount, 'vatRate'),
        vat: 0,
        includingVat: 0,
      },
      creatives: [],
    })
  }

  const handleRemoveItem = (index: number) => {
    removeItem(index)
  }

  // Auto-calculate VAT for item when amount changes
  const handleItemAmountChange = (index: number, value: number) => {
    const currentItem = items[index]
    if (currentItem) {
      const vat = Number((value * (currentItem.amount.vatRate / 100)).toFixed(2))
      const excludingVat = Number((value - vat).toFixed(2))
      setValue(`items.${index}.amount.includingVat`, value, { shouldValidate: true })
      setValue(`items.${index}.amount.vat`, vat, { shouldValidate: false })
      setValue(`items.${index}.amount.excludingVat`, excludingVat, { shouldValidate: false })
    }
  }

  // Statistics handlers
  const handleAddStatistic = () => {
    appendStatistic({
      metric: '',
      value: 0,
      unit: '',
      platform: 'VK',
      period: '',
      isValidated: false,
      isManual: true,
    })
  }

  const handleRemoveStatistic = (index: number) => {
    removeStatistic(index)
  }

  const handleSaveDraft = async () => {
    console.log('handleSaveDraft clicked!')
    
    // Validate form first
    const isValid = await trigger()
    console.log('Form validation result:', isValid)
    console.log('Form errors:', formErrors)
    
    if (!isValid) {
      toast.error('Пожалуйста, исправьте ошибки в форме')
      // Show first error
      const firstError = Object.values(formErrors)[0]
      if (firstError && 'message' in firstError) {
        toast.error(String(firstError.message))
      }
      return
    }
    
    const formData = getValues()
    console.log('Form data:', formData)
    
    try {
      toast.info('Сохранение черновика...')
      const externalId = actId || `act_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      console.log('Saving draft with formData:', formData)
      
      const payload: CreateActRequest = mapFormDataToBackend(formData as unknown as ActFormData, externalId)
      
      console.log('Mapped payload:', payload)

      const result = await createActMutation.mutateAsync(payload)

      console.log('Save result:', result)

      toast.success(isEditMode ? 'Черновик обновлен' : 'Черновик создан')

      if (!isEditMode && result?.id) {
        navigate(`/acts/${result.id}/edit`)
      } else if (!isEditMode && result?.externalId) {
        // Fallback to externalId if id is not available
        console.warn('No id returned, using externalId:', result.externalId)
        navigate(`/acts/${result.externalId}/edit`)
      }
    } catch (error: any) {
      console.error('Save draft error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Ошибка при сохранении'
      toast.error(errorMessage)
      
      // Show validation errors if available
      if (error?.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`)
        })
      }
    }
  }

  const handleSubmitToVkOrd = async () => {
    console.log('handleSubmitToVkOrd clicked!')
    
    // Validate form first
    const isValid = await trigger()
    console.log('Form validation result:', isValid)
    console.log('Form errors:', formErrors)
    
    if (!isValid) {
      toast.error('Пожалуйста, исправьте ошибки в форме')
      // Show first error
      const firstError = Object.values(formErrors)[0]
      if (firstError && 'message' in firstError) {
        toast.error(String(firstError.message))
      }
      return
    }
    
    const formData = getValues()
    console.log('Form data:', formData)
    
    try {
      toast.info('Отправка акта в VK ORD...')
      const externalId = actId || `act_${Date.now()}_${Math.random().toString(36).substring(7)}`

      console.log('Submitting to VK ORD with formData:', formData)

      const payload: CreateActRequest = {
        ...mapFormDataToBackend(formData as unknown as ActFormData, externalId),
        status: 'sent',
      }

      console.log('Submit payload:', payload)

      const result = await createActMutation.mutateAsync(payload)

      console.log('Create result before submit:', result)

      // Use externalId for submission (required by /ready endpoint)
      // Backend returns ActBackendEntity with both id (number) and externalId (string)
      // The /ready endpoint expects externalId in the URL
      const actIdForSubmit = result?.externalId || externalId
      
      if (!actIdForSubmit) {
        throw new Error('Не удалось создать/обновить акт - отсутствует externalId')
      }

      console.log('Submitting act with externalId:', actIdForSubmit)

      const submitResult = await submitActMutation.mutateAsync(actIdForSubmit)

      console.log('Submit result:', submitResult)

      // Backend returns empty object {} with 200 on success, or object with errors on failure
      // Check for errors first, if no errors - consider it success
      const errors = submitResult?.errors || []
      if (errors.length > 0) {
        errors.forEach(err => toast.error(`${err.field}: ${err.message}`))
      } else {
        // No errors means success (even if success field is undefined)
        toast.success('Акт успешно отправлен в VK ORD')
        navigate('/acts')
      }
    } catch (error: any) {
      console.error('Submit error:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Ошибка при отправке'
      toast.error(errorMessage)
      
      // Show validation errors if available
      if (error?.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`)
        })
      }
    }
  }

  const handleDelete = async () => {
    if (!actId || !confirm('Вы уверены, что хотите удалить этот акт?')) return

    try {
      toast.info('Удаление акта...')
      await deleteActMutation.mutateAsync(actId)
      toast.success('Акт удален')
      navigate('/acts')
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при удалении')
    }
  }

  const itemsTotal = items.reduce((sum, item) => sum + getAmountValue(item.amount, 'includingVat'), 0)
  const itemsMismatch = Math.abs(itemsTotal - getAmountValue(amount, 'includingVat')) > 1

  // Show loading state in edit mode
  if (isEditMode && (isLoadingActDetails || isLoadingContract)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>
          {isLoadingActDetails ? 'Загрузка данных акта...' : 'Загрузка договора...'}
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
          <IconButton onClick={() => navigate('/acts')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h5">
              {isEditMode ? `Редактирование акта ${watch('serial') || ''}` : 'Создание нового акта'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={handleSaveDraft} disabled={createActMutation.isPending}>
            <SaveIcon className="mr-2 h-4 w-4" />
            Сохранить черновик
          </Button>
          <Button onClick={handleSubmitToVkOrd} disabled={createActMutation.isPending || submitActMutation.isPending}>
            <SendIcon className="mr-2 h-4 w-4" />
            Отправить в VK ORD
          </Button>
          {isEditMode && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleteActMutation.isPending}>
              <DeleteIcon className="mr-2 h-4 w-4" />
              Удалить
            </Button>
          )}
        </Box>
      </Box>

      {/* Parties info panel */}
      {(clientFromState || contractorFromState) && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            {clientFromState && (
              <Box>
                <Typography variant="caption" color="text.secondary">Клиент (Заказчик)</Typography>
                <Typography variant="body2" fontWeight="medium">{clientFromState.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ИНН: {clientFromState.juridicalDetails?.inn || clientFromState.externalId}
                </Typography>
              </Box>
            )}
            {clientFromState && contractorFromState && (
              <Typography variant="h6" color="text.secondary">↔</Typography>
            )}
            {contractorFromState && (
              <Box>
                <Typography variant="caption" color="text.secondary">Подрядчик (Исполнитель)</Typography>
                <Typography variant="body2" fontWeight="medium">{contractorFromState.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ИНН: {contractorFromState.juridicalDetails?.inn || contractorFromState.externalId}
                </Typography>
              </Box>
            )}
            {contractFromState && (
              <Box sx={{ ml: 'auto' }}>
                <Typography variant="caption" color="text.secondary">Договор</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {contractFromState.data?.serial || contractFromState.externalId || 'Без номера'}
                </Typography>
                {contractFromState.amount && (
                  <Typography variant="caption" color="text.secondary">
                    Сумма: {Number(contractFromState.amount).toLocaleString()} ₽
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Alert>
      )}

      {/* Summary panel */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Сумма с НДС</Typography>
            <Typography variant="h6">{getAmountValue(amount, 'includingVat').toLocaleString()} ₽</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">НДС ({getAmountValue(amount, 'vatRate')}%)</Typography>
            <Typography variant="h6">{getAmountValue(amount, 'vat').toLocaleString()} ₽</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Без НДС</Typography>
            <Typography variant="h6">{getAmountValue(amount, 'excludingVat').toLocaleString()} ₽</Typography>
          </Box>
          <Box>
            <Controller
              name="autoCalculate"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} size="small" />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">Авто-расчет</Typography>
                      <Tooltip title="Автоматический расчет НДС">
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Box>
                  }
                />
              )}
            />
          </Box>
        </Box>
      </Paper>

      {/* Main form */}
      <Paper>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Основные данные" />
          <Tab label="Распределение" />
          <Tab label="Статистика" />
        </Tabs>

        <Box sx={{ px: 3 }}>
          {/* Tab 1: Main Data */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Controller
                  name="serial"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Номер акта"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message || "Можно оставить пустым"}
                    />
                  )}
                />

                <Controller
                  name="contractExternalId"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Autocomplete
                      options={allContracts}
                      value={selectedContract}
                      onChange={(_, value) => handleContractChange(value)}
                      getOptionLabel={(option) => {
                        const serial = option.data?.serial
                        const amountLabel = option.amount ? ` - ${Number(option.amount).toLocaleString()} ₽` : ''
                        return `${serial || option.externalId || 'Без номера'}${amountLabel}`
                      }}
                      isOptionEqualToValue={(option, value) => {
                        return option.externalId === value?.externalId
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Договор"
                          required
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
                <Controller
                  name="amount.includingVat"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Сумма с НДС, ₽"
                      type="number"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      value={field.value || ''}
                      placeholder="0"
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value)
                        field.onChange(value)
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                      }}
                    />
                  )}
                />

                <Controller
                  name="amount.vatRate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ставка НДС"
                      type="number"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={autoCalculate}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  )}
                />

                <Controller
                  name="amount.vat"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Сумма НДС, ₽"
                      type="number"
                      disabled={autoCalculate}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                        readOnly: autoCalculate,
                      }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Controller
                  name="dateStart"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата начала периода"
                      type="date"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />

                <Controller
                  name="dateEnd"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата окончания периода"
                      type="date"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />

                <Controller
                  name="date"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Дата выставления"
                      type="date"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Controller
                  name="clientRole"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>Роль клиента</InputLabel>
                        <Select {...field} label="Роль клиента">
                          <MenuItem value={ActRole.advertiser}>Рекламодатель</MenuItem>
                          <MenuItem value={ActRole.publisher}>Издатель</MenuItem>
                          <MenuItem value={ActRole.agency}>Агентство</MenuItem>
                          <MenuItem value={ActRole.mediator}>Посредник</MenuItem>
                        </Select>
                        {fieldState.error && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </FormControl>
                    )
                  }}
                />

                <Controller
                  name="contractorRole"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>Роль исполнителя</InputLabel>
                        <Select {...field} label="Роль исполнителя">
                          <MenuItem value={ActRole.advertiser}>Рекламодатель</MenuItem>
                          <MenuItem value={ActRole.publisher}>Издатель</MenuItem>
                          <MenuItem value={ActRole.agency}>Агентство</MenuItem>
                          <MenuItem value={ActRole.mediator}>Посредник</MenuItem>
                        </Select>
                        {fieldState.error && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </FormControl>
                    )
                  }}
                />
              </Box>
            </Box>
          </TabPanel>

          {/* Tab 2: Distribution (Items) */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Распределение по договорам</Typography>
              <Button onClick={handleAddItem}>
                <AddIcon className="mr-2 h-4 w-4" />
                Добавить договор
              </Button>
            </Box>

            {itemsMismatch && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Сумма распределения ({itemsTotal.toLocaleString()} ₽) не совпадает с общей суммой ({amount.includingVat.toLocaleString()} ₽)
              </Alert>
            )}

            {itemFields.length === 0 && (
              <Alert severity="info">
                Нет добавленных распределений. Нажмите "Добавить договор"
              </Alert>
            )}

            {itemFields.map((field, index) => (
              <Card key={field.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Распределение #{index + 1}
                    </Typography>
                    <IconButton onClick={() => handleRemoveItem(index)} color="error" size="small">
                      <RemoveIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Controller
                      name={`items.${index}.contractExternalId`}
                      control={control}
                      render={({ field: controllerField, fieldState }) => {
                        const itemContractValue = allContracts.find(c => c.externalId === controllerField.value) || null
                        return (
                          <Autocomplete
                            options={allContracts}
                            value={itemContractValue}
                            onChange={(_, value) => controllerField.onChange(value?.externalId || '')}
                            getOptionLabel={(option) => {
                              const serial = option.data?.serial
                              return serial || option.externalId || 'Без номера'
                            }}
                            isOptionEqualToValue={(option, value) => {
                              return option.externalId === value?.externalId
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Договор"
                                size="small"
                                error={!!fieldState.error}
                                helperText={fieldState.error?.message}
                              />
                            )}
                          />
                        )
                      }}
                    />

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                      <Controller
                        name={`items.${index}.amount.includingVat`}
                        control={control}
                        render={({ field: controllerField, fieldState }) => (
                          <TextField
                            fullWidth
                            label="Сумма"
                            type="number"
                            size="small"
                            value={controllerField.value || ''}
                            placeholder="0"
                            onChange={(e) => {
                              const value = e.target.value === '' ? 0 : Number(e.target.value)
                              handleItemAmountChange(index, value)
                            }}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                            }}
                          />
                        )}
                      />

                      <Controller
                        name={`items.${index}.amount.vatRate`}
                        control={control}
                        render={({ field: controllerField, fieldState }) => (
                          <TextField
                            fullWidth
                            label="Ставка НДС"
                            type="number"
                            size="small"
                            value={controllerField.value}
                            onChange={(e) => controllerField.onChange(Number(e.target.value))}
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">%</InputAdornment>,
                            }}
                          />
                        )}
                      />

                      <Controller
                        name={`items.${index}.amount.vat`}
                        control={control}
                        render={({ field: controllerField }) => (
                          <TextField
                            fullWidth
                            label="Сумма НДС"
                            type="number"
                            size="small"
                            value={controllerField.value}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                              readOnly: true,
                            }}
                          />
                        )}
                      />
                    </Box>

                    <Controller
                      name={`items.${index}.creatives`}
                      control={control}
                      render={({ field: controllerField }) => {
                        const currentItem = items[index]
                        const itemContractId = currentItem?.contractExternalId || ''
                        const itemCreatives = creativesByContract.get(itemContractId) || []

                        return (
                          <Autocomplete
                            multiple
                            options={itemCreatives}
                            value={controllerField.value || []}
                            onChange={(_, value) => {
                              controllerField.onChange(value.map(v => {
                                // If v already has creativeExternalId, it's from the form (already formatted)
                                if (v.creativeExternalId !== undefined) {
                                  return {
                                    erid: v.erid || '',
                                    creativeExternalId: v.creativeExternalId || '',
                                  }
                                }
                                // Otherwise, it's from the API (creative object)
                                return {
                                  erid: v.erid || v.data?.erid || '',
                                  creativeExternalId: v.externalId || v.data?.externalId || '',
                                }
                              }))
                            }}
                            getOptionLabel={(option) => {
                              if (typeof option === 'string') return option
                              // creatives returned from API may be wrapped in `data` or top-level
                              const erid = option.erid || option.data?.erid
                              const externalId = option.externalId || option.data?.externalId
                              const name = option.name || option.data?.name

                              // Priority: name with ERID > name with externalId > ERID > externalId > "Неизвестный креатив"
                              if (name && erid) return `${name} (${erid})`
                              if (name && externalId) return `${name} (ID: ${externalId})`
                              if (erid) return erid
                              if (externalId) return `ID: ${externalId}`
                              return 'Неизвестный креатив'
                            }}
                            isOptionEqualToValue={(option, value) => {
                              if (!option || !value) return false
                              // Compare by externalId if available, fallback to erid
                              const optionId = option.externalId || option.data?.externalId || option.erid || option.data?.erid
                              const valueId = value.creativeExternalId || value.externalId || value.data?.externalId || value.erid || value.data?.erid
                              return optionId === valueId
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Креативы"
                                size="small"
                                helperText={!itemContractId ? 'Сначала выберите договор' : undefined}
                              />
                            )}
                            renderTags={(value, getTagProps) =>
                              value.map((option, tagIndex) => {
                                const { key, ...tagProps } = getTagProps({ index: tagIndex }) as any
                                const erid = option.erid || option.data?.erid
                                const externalId = option.creativeExternalId || option.externalId || option.data?.externalId
                                const name = option.name || option.data?.name

                                let label = 'Неизвестный креатив'
                                if (erid) label = erid
                                else if (externalId) label = `ID: ${externalId}`
                                if (name) label = `${name} (${erid || externalId || '?'})`

                                return (
                                  <Chip
                                    key={key}
                                    label={label}
                                    {...tagProps}
                                    size="small"
                                  />
                                )
                              })
                            }
                            disabled={!itemContractId}
                          />
                        )
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </TabPanel>

          {/* Tab 3: Statistics */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Статистика</Typography>
              <Button onClick={handleAddStatistic}>
                <AddIcon className="mr-2 h-4 w-4" />
                Добавить метрику
              </Button>
            </Box>

            {statisticsFields.length === 0 && (
              <Alert severity="info">
                Нет добавленных метрик
              </Alert>
            )}

            {statisticsFields.map((field, index) => (
              <Card key={field.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Метрика #{index + 1}</Typography>
                    <IconButton onClick={() => handleRemoveStatistic(index)} color="error" size="small">
                      <RemoveIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Controller
                      name={`statistics.${index}.metric`}
                      control={control}
                      render={({ field: controllerField, fieldState }) => (
                        <TextField
                          {...controllerField}
                          fullWidth
                          label="Метрика"
                          size="small"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`statistics.${index}.value`}
                      control={control}
                      render={({ field: controllerField, fieldState }) => (
                        <TextField
                          {...controllerField}
                          fullWidth
                          label="Значение"
                          size="small"
                          type="number"
                          onChange={(e) => controllerField.onChange(Number(e.target.value))}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      )}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </TabPanel>
        </Box>

        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outline" onClick={() => navigate('/acts')}>
            Отмена
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={createActMutation.isPending}>
            <SaveIcon className="mr-2 h-4 w-4" />
            Сохранить черновик
          </Button>
          <Button onClick={handleSubmitToVkOrd} disabled={createActMutation.isPending || submitActMutation.isPending}>
            <SendIcon className="mr-2 h-4 w-4" />
            Отправить в VK ORD
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
