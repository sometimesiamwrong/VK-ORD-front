import React, { useState } from 'react'
import {
  Typography,
  Paper,
  Box,
  TextField,
  Alert,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import type { SelectChangeEvent } from '@mui/material'
import { toast } from 'sonner'
import type { DaDataPartyShortResponse } from '../../types'
import { usePartyLookup, useSetCounterparty } from './hooks'
import { getErrorMessage } from '../../api/errorHandler'

const ROLE_OPTIONS = [
  { value: 'advertiser', label: 'Рекламодатель' },
  { value: 'agency', label: 'Рекламное агентство' },
  { value: 'publisher', label: 'Издатель' },
]

export const PartiesPage: React.FC = () => {
  const [lookupInn, setLookupInn] = useState('')
  const [createFormData, setCreateFormData] = useState({
    inn: '',
    roles: [] as string[],
  })
  const [partyInfo, setPartyInfo] = useState<DaDataPartyShortResponse | null>(null)

  // Lookup party mutation
  const lookupMutation = usePartyLookup()

  // Create counterparty mutation
  const createMutation = useSetCounterparty()

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (lookupInn.length === 10 || lookupInn.length === 12) {
      lookupMutation.mutate(lookupInn, {
        onSuccess: (data) => {
          if (data) {
            setPartyInfo(data)
            toast.success('Контрагент найден')
          } else {
            toast.error('Контрагент не найден')
            setPartyInfo(null)
          }
        },
        onError: (error: unknown) => {
          toast.error(getErrorMessage(error, 'Ошибка при поиске контрагента'))
          setPartyInfo(null)
        },
      })
    } else {
      toast.error('ИНН должен содержать 10 или 12 цифр')
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (createFormData.inn.length !== 10 && createFormData.inn.length !== 12) {
      toast.error('ИНН должен содержать 10 или 12 цифр')
      return
    }
    if (createFormData.roles.length === 0) {
      toast.error('Необходимо выбрать хотя бы одну роль')
      return
    }
    createMutation.mutate({ inn: createFormData.inn, types: createFormData.roles }, {
      onSuccess: () => {
        toast.success('Контрагент успешно создан')
        setCreateFormData({ inn: '', roles: [] })
      },
      onError: (error: unknown) => {
        toast.error(getErrorMessage(error, 'Ошибка создания контрагента'))
      },
    })
  }

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setCreateFormData(prev => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value,
    }))
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление контрагентами
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Lookup Party */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Поиск контрагента
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleLookupSubmit}>
              <TextField
                fullWidth
                label="ИНН"
                value={lookupInn}
                onChange={(e) => setLookupInn(e.target.value.replace(/\D/g, ''))}
                required
                helperText="10 или 12 цифр"
                inputProps={{ maxLength: 12 }}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={lookupMutation.isPending}
              >
                {lookupMutation.isPending ? 'Поиск...' : 'Найти контрагента'}
              </Button>
            </Box>

            {partyInfo && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Информация о контрагенте
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: 'grid', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ИНН
                      </Typography>
                      <Typography variant="body1">
                        {partyInfo.inn}
                      </Typography>
                    </Box>
                    {partyInfo.name && typeof partyInfo.name === 'object' && partyInfo.name.full && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Полное наименование
                        </Typography>
                        <Typography variant="body1">
                          {partyInfo.name.full}
                        </Typography>
                      </Box>
                    )}
                    {partyInfo.name && typeof partyInfo.name === 'object' && partyInfo.name.shortWithOpf && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Краткое наименование
                        </Typography>
                        <Typography variant="body1">
                          {partyInfo.name.shortWithOpf}
                        </Typography>
                      </Box>
                    )}
                    {partyInfo.name && typeof partyInfo.name === 'string' && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Наименование
                        </Typography>
                        <Typography variant="body1">
                          {partyInfo.name}
                        </Typography>
                      </Box>
                    )}
                    {partyInfo.kpp && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          КПП
                        </Typography>
                        <Typography variant="body1">
                          {partyInfo.kpp}
                        </Typography>
                      </Box>
                    )}
                    {partyInfo.type && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Тип
                        </Typography>
                        <Typography variant="body1">
                          {partyInfo.type}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Box>

        {/* Create Counterparty */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Создать контрагента в VK ОРД
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleCreateSubmit}>
              <TextField
                fullWidth
                label="ИНН"
                value={createFormData.inn}
                onChange={(e) => setCreateFormData(prev => ({
                  ...prev,
                  inn: e.target.value.replace(/\D/g, '')
                }))}
                required
                helperText="10 или 12 цифр"
                inputProps={{ maxLength: 12 }}
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Роли</InputLabel>
                <Select
                  multiple
                  value={createFormData.roles}
                  onChange={handleRoleChange}
                  input={<OutlinedInput label="Роли" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={ROLE_OPTIONS.find(r => r.value === value)?.label || value}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {createMutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {createMutation.error?.message}
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Создание...' : 'Создать контрагента'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

