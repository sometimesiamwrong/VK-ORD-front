import React, { useState } from 'react'
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import http from '../../api/http'
import type { CreateContractRequest, ContractDetails } from '../../types'

export const ContractsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    externalId: '',
    clientExternalId: '',
    contractorExternalId: '',
    paySum: '',
    payDateEnd: '',
  })

  const [viewFormData, setViewFormData] = useState({
    externalId: '',
  })

  const [contractDetails, setContractDetails] = useState<ContractDetails | null>(null)

  // Create/Update contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (data: CreateContractRequest) => {
      const response = await http.put<ContractDetails>(`/api/contracts/${data.externalId}`, data)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        toast.success('Контракт успешно создан/обновлен')
        // Clear form
        setFormData({
          externalId: '',
          clientExternalId: '',
          contractorExternalId: '',
          paySum: '',
          payDateEnd: '',
        })
      }
    },
  })

  // View contract mutation
  const viewContractMutation = useMutation({
    mutationFn: async (externalId: string) => {
      const response = await http.get<ContractDetails>(`/api/contracts/${externalId}`)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setContractDetails(data)
      }
    },
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const contractData: CreateContractRequest = {
      externalId: formData.externalId,
      clientExternalId: formData.clientExternalId,
      contractorExternalId: formData.contractorExternalId,
      paySum: parseFloat(formData.paySum),
      payDateEnd: formData.payDateEnd || undefined,
    }

    createContractMutation.mutate(contractData)
  }

  const handleViewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (viewFormData.externalId) {
      viewContractMutation.mutate(viewFormData.externalId)
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  const handleViewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setViewFormData({ externalId: e.target.value })
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление контрактами
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Create/Update Contract */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Создать/Обновить контракт
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleCreateSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <TextField
                fullWidth
                label="External ID контракта"
                value={formData.externalId}
                onChange={handleChange('externalId')}
                required
                helperText="Уникальный идентификатор контракта"
              />
              <TextField
                fullWidth
                label="Client External ID"
                value={formData.clientExternalId}
                onChange={handleChange('clientExternalId')}
                required
                helperText="ID клиента"
              />
              <TextField
                fullWidth
                label="Contractor External ID"
                value={formData.contractorExternalId}
                onChange={handleChange('contractorExternalId')}
                required
                helperText="ID подрядчика"
              />
              <TextField
                fullWidth
                label="Сумма оплаты"
                type="number"
                value={formData.paySum}
                onChange={handleChange('paySum')}
                required
                helperText="Сумма в рублях"
              />
              <TextField
                fullWidth
                label="Дата окончания оплаты"
                type="date"
                value={formData.payDateEnd}
                onChange={handleChange('payDateEnd')}
                InputLabelProps={{ shrink: true }}
                helperText="Опционально"
              />
            </Box>

              {createContractMutation.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {createContractMutation.error?.message}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                disabled={createContractMutation.isPending}
              >
                {createContractMutation.isPending ? 'Создание...' : 'Создать/Обновить контракт'}
              </Button>
            </Box>
          </Paper>
          </Box>

        {/* View Contract */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Просмотр контракта
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleViewSubmit} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="External ID контракта"
                value={viewFormData.externalId}
                onChange={handleViewChange}
                required
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="outlined"
                fullWidth
                disabled={viewContractMutation.isPending}
              >
                {viewContractMutation.isPending ? 'Загрузка...' : 'Найти контракт'}
              </Button>
            </Box>

            {viewContractMutation.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {viewContractMutation.error?.message}
              </Alert>
            )}

            {contractDetails && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Детали контракта
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        External ID
                      </Typography>
                      <Typography variant="body1">
                        {contractDetails.externalId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Client ID
                      </Typography>
                      <Typography variant="body1">
                        {contractDetails.clientExternalId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Contractor ID
                      </Typography>
                      <Typography variant="body1">
                        {contractDetails.contractorExternalId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Сумма оплаты
                      </Typography>
                      <Typography variant="body1">
                        {contractDetails.paySum} ₽
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Дата окончания
                      </Typography>
                      <Typography variant="body1">
                        {contractDetails.payDateEnd || 'Не указана'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
