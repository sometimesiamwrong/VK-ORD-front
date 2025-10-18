import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
} from './hooks'
import { ActRole } from '@/types'
import type { CreateActRequest, ContractDto } from '@/types'
import { actFormSchema, getDefaultActFormValues, type ActFormData } from './schemas/actFormSchema'
import { mapFormDataToBackend } from './utils/formToBackendMapper'

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
  } | undefined

  const clientFromState = locationState?.client
  const contractorFromState = locationState?.contractor
  const contractFromState = locationState?.contract

  const [activeTab, setActiveTab] = useState(0)

  // Determine roles from contract
  const getInitialRoles = () => {
    if (!contractFromState || !clientFromState || !contractorFromState) {
      return { clientRole: ActRole.Advertiser, contractorRole: ActRole.Publisher }
    }

    const contractClientId = contractFromState.data?.clientExternalId || contractFromState.data?.client_external_id
    const isDirect = contractClientId === clientFromState.external_id

    return {
      clientRole: isDirect ? ActRole.Advertiser : ActRole.Publisher,
      contractorRole: isDirect ? ActRole.Publisher : ActRole.Advertiser
    }
  }

  const initialRoles = getInitialRoles()

  // React Hook Form setup
  const {
    control,
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
  } = useForm<ActFormData>({
    resolver: zodResolver(actFormSchema) as any,
    defaultValues: {
      ...getDefaultActFormValues(),
      contractExternalId: contractFromState?.externalId || contractFromState?.external_id || '',
      clientRole: initialRoles.clientRole,
      contractorRole: initialRoles.contractorRole,
      amount: contractFromState?.amount ? {
        includingVat: Number(contractFromState.amount),
        vatRate: 20,
        vat: Number(contractFromState.amount) * 0.2,
        excludingVat: Number(contractFromState.amount) * 0.8,
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
  const amount = watch('amount')
  const autoCalculate = watch('autoCalculate')
  const items = watch('items') || []

  // API hooks
  const effectivePartyId = clientFromState?.external_id || ''
  const { data: contractsData } = useContractsByParty(effectivePartyId)
  const { data: creativesData } = useContractCreatives(contractExternalId)

  // Mutations
  const createActMutation = useCreateAct()
  const submitActMutation = useSubmitAct()
  const deleteActMutation = useDeleteAct()

  const contracts = contractsData?.contracts || []
  const creatives = creativesData?.creatives || []

  // Add contract from state to contracts list if not already there
  const allContracts = React.useMemo(() => {
    if (contractFromState && !contracts.find(c =>
      (c.externalId || c.external_id) === (contractFromState.externalId || contractFromState.external_id)
    )) {
      return [contractFromState, ...contracts]
    }
    return contracts
  }, [contractFromState, contracts])

  // Pre-select contract from state on mount
  useEffect(() => {
    if (contractFromState && !isEditMode) {
      const contractId = contractFromState.externalId || contractFromState.external_id || ''
      if (contractId && watch('contractExternalId') !== contractId) {
        setValue('contractExternalId', contractId, { shouldValidate: true })
      }
    }
  }, [contractFromState, isEditMode, setValue, watch])

  // Auto-calculate VAT amounts
  useEffect(() => {
    if (autoCalculate && amount.includingVat > 0) {
      const vat = amount.includingVat * (amount.vatRate / 100)
      const excludingVat = amount.includingVat - vat
      setValue('amount.vat', Number(vat.toFixed(2)), { shouldValidate: false })
      setValue('amount.excludingVat', Number(excludingVat.toFixed(2)), { shouldValidate: false })
    }
  }, [amount.includingVat, amount.vatRate, autoCalculate, setValue])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleContractChange = (contract: ContractDto | null) => {
    if (contract) {
      setValue('contractExternalId', contract.externalId || contract.external_id || '', { shouldValidate: true })
      if (!isEditMode && contract.amount) {
        setValue('amount.includingVat', Number(contract.amount), { shouldValidate: true })
      }
    }
  }

  // Item handlers
  const handleAddItem = () => {
    appendItem({
      contractExternalId: '',
      amount: {
        excludingVat: 0,
        vatRate: amount.vatRate,
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

  const handleSaveDraft = handleFormSubmit(async (formData) => {
    try {
      toast.info('Сохранение черновика...')
      const externalId = actId || `act_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const payload: CreateActRequest = mapFormDataToBackend(formData as unknown as ActFormData, externalId)

      const result = await createActMutation.mutateAsync(payload)

      toast.success(isEditMode ? 'Черновик обновлен' : 'Черновик создан')

      if (!isEditMode && result?.id) {
        navigate(`/acts/${result.id}/edit`)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при сохранении')
      console.error('Save draft error:', error)
    }
  })

  const handleSubmitToVkOrd = handleFormSubmit(async (formData) => {
    try {
      toast.info('Отправка акта в VK ORD...')
      const externalId = actId || `act_${Date.now()}_${Math.random().toString(36).substring(7)}`

      const payload: CreateActRequest = {
        ...mapFormDataToBackend(formData as unknown as ActFormData, externalId),
        status: 'sent',
      }

      const result = await createActMutation.mutateAsync(payload)

      if (!result?.id) {
        throw new Error('Не удалось создать/обновить акт')
      }

      const submitResult = await submitActMutation.mutateAsync(result.id)

      if (submitResult?.success) {
        toast.success('Акт успешно отправлен в VK ORD')
        navigate('/acts')
      } else {
        const errors = submitResult?.errors || []
        errors.forEach(err => toast.error(`${err.field}: ${err.message}`))
      }
    } catch (error: any) {
      toast.error(error?.message || 'Ошибка при отправке')
      console.error('Submit error:', error)
    }
  })

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

  const itemsTotal = items.reduce((sum, item) => sum + item.amount.includingVat, 0)
  const itemsMismatch = Math.abs(itemsTotal - amount.includingVat) > 1

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
                  ИНН: {clientFromState.juridical_details?.inn || clientFromState.external_id}
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
                  ИНН: {contractorFromState.juridical_details?.inn || contractorFromState.external_id}
                </Typography>
              </Box>
            )}
            {contractFromState && (
              <Box sx={{ ml: 'auto' }}>
                <Typography variant="caption" color="text.secondary">Договор</Typography>
                <Typography variant="body2" fontWeight="medium">
                  {contractFromState.data?.serial || contractFromState.externalId || contractFromState.external_id}
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
            <Typography variant="h6">{amount.includingVat.toLocaleString()} ₽</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">НДС ({amount.vatRate}%)</Typography>
            <Typography variant="h6">{amount.vat.toLocaleString()} ₽</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Без НДС</Typography>
            <Typography variant="h6">{amount.excludingVat.toLocaleString()} ₽</Typography>
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
                      value={allContracts.find(c => (c.externalId || c.external_id) === field.value) || null}
                      onChange={(_, value) => handleContractChange(value)}
                      getOptionLabel={(option) => `${option.externalId || option.external_id || 'Без номера'} - ${(option.amount || 0).toLocaleString()} ₽`}
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
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Роль клиента</InputLabel>
                      <Select {...field} label="Роль клиента">
                        <MenuItem value={ActRole.Advertiser}>Рекламодатель</MenuItem>
                        <MenuItem value={ActRole.Agency}>Агентство</MenuItem>
                        <MenuItem value={ActRole.Publisher}>Издатель</MenuItem>
                        <MenuItem value={ActRole.Mediator}>Посредник</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="contractorRole"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Роль подрядчика</InputLabel>
                      <Select {...field} label="Роль подрядчика">
                        <MenuItem value={ActRole.Advertiser}>Рекламодатель</MenuItem>
                        <MenuItem value={ActRole.Mediator}>Посредник</MenuItem>
                      </Select>
                    </FormControl>
                  )}
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
                      render={({ field: controllerField, fieldState }) => (
                        <Autocomplete
                          options={allContracts}
                          value={allContracts.find(c => (c.externalId || c.external_id) === controllerField.value) || null}
                          onChange={(_, value) => controllerField.onChange(value?.externalId || value?.external_id || '')}
                          getOptionLabel={(option) => option.externalId || option.external_id || 'Без номера'}
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
                      )}
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
                      render={({ field: controllerField }) => (
                        <Autocomplete
                          multiple
                          options={creatives}
                          value={creatives.filter(c =>
                            controllerField.value?.some((creative: any) => creative.erid === c.erid)
                          )}
                          onChange={(_, value) => controllerField.onChange(value.map(v => ({
                            erid: v.erid || '',
                            externalId: v.externalId,
                          })))}
                          getOptionLabel={(option) => option.erid || option.externalId || String(option.id)}
                          renderInput={(params) => (
                            <TextField {...params} label="Креативы" size="small" />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, tagIndex) => {
                              const { key, ...tagProps } = getTagProps({ index: tagIndex }) as any
                              return (
                                <Chip
                                  key={key}
                                  label={option.erid || option.externalId || String(option.id)}
                                  {...tagProps}
                                  size="small"
                                />
                              )
                            })
                          }
                        />
                      )}
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
