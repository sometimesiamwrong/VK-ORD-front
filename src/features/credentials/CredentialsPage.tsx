import React, { useState } from 'react'
import {
  Typography,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material'
import { ResponsiveDataView } from '@/components/data-display'
import type { Column } from '@/components/data-display'
import { useCredentials, useCreateCredential, useUpdateCredential, useDeleteCredential } from './hooks'
import type { Credential, CreateCredentialRequest, UpdateCredentialRequest } from '../../types'

export const CredentialsPage: React.FC = () => {
  const { data: credentials, isLoading, error } = useCredentials()
  const createMutation = useCreateCredential()
  const updateMutation = useUpdateCredential()
  const deleteMutation = useDeleteCredential()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null)
  const [formData, setFormData] = useState<{
    environment: 'Sandbox' | 'Production'
    tokenPlain: string
    displayName: string
  }>({
    environment: 'Sandbox',
    tokenPlain: '',
    displayName: '',
  })

  const handleOpenCreateDialog = () => {
    setEditingCredential(null)
    setFormData({
      environment: 'Sandbox',
      tokenPlain: '',
      displayName: '',
    })
    setDialogOpen(true)
  }

  const handleOpenEditDialog = (credential: Credential) => {
    setEditingCredential(credential)
    setFormData({
      environment: (credential.environment === 'Production' ? 'Production' : 'Sandbox') as 'Sandbox' | 'Production',
      tokenPlain: '',
      displayName: credential.displayName || '',
    })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCredential(null)
  }

  const handleSubmit = () => {
    if (editingCredential) {
      // Update
      const updateData: UpdateCredentialRequest = {
        environment: formData.environment !== editingCredential.environment ? formData.environment : undefined,
        tokenPlain: formData.tokenPlain || undefined,
        displayName: formData.displayName !== editingCredential.displayName ? formData.displayName : undefined,
      }

      // Only update if something changed
      if (Object.values(updateData).some(v => v !== undefined) && editingCredential.id) {
        updateMutation.mutate({ id: editingCredential.id, data: updateData }, {
          onSuccess: () => handleCloseDialog(),
        })
      } else {
        handleCloseDialog()
      }
    } else {
      // Create
      const createData: CreateCredentialRequest = {
        environment: formData.environment,
        tokenPlain: formData.tokenPlain,
        displayName: formData.displayName || undefined,
      }

      createMutation.mutate(createData, {
        onSuccess: () => handleCloseDialog(),
      })
    }
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот токен?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }))
  }

  const maskToken = (token: string) => {
    if (token.length <= 8) return '*'.repeat(token.length)
    return token.substring(0, 4) + '*'.repeat(token.length - 8) + token.substring(token.length - 4)
  }

  const columns: Column<Credential>[] = [
    {
      key: 'displayName',
      header: 'Название',
      render: (value) => value || 'Без названия',
    },
    {
      key: 'environment',
      header: 'Окружение',
      render: (value) => (
        <Chip
          label={value}
          color={value === 'Production' ? 'error' : 'default'}
          size="small"
        />
      ),
    },
    {
      key: 'id',
      header: 'Токен',
      mobileLabel: 'Токен',
      render: () => (
        <Tooltip title="Токен скрыт для безопасности">
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {maskToken('placeholder-token-text')}
          </Typography>
        </Tooltip>
      ),
    },
    {
      key: 'createdAt',
      header: 'Создан',
      hideOnMobile: true,
      render: (value) => value ? new Date(value).toLocaleDateString('ru-RU') : 'Неизвестно',
    },
    {
      key: 'updatedAt',
      header: 'Обновлен',
      hideOnMobile: true,
      render: (value) => value ? new Date(value).toLocaleDateString('ru-RU') : 'Неизвестно',
    },
  ];

  if (isLoading) {
    return <Typography>Загрузка credentials...</Typography>
  }

  if (error) {
    return (
      <Alert severity="error">
        Ошибка загрузки credentials: {error.message}
      </Alert>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          VK ORD Credentials
        </Typography>
        <Button onClick={handleOpenCreateDialog}>
          <AddIcon className="mr-2 h-4 w-4" />
          Добавить токен
        </Button>
      </Box>

      <ResponsiveDataView
        data={credentials || []}
        columns={columns}
        keyExtractor={(cred) => cred.id || String(Math.random())}
        loading={isLoading}
        emptyState={
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <VpnKeyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Нет сохраненных токенов
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Добавьте токен VK ORD для работы с API
            </Typography>
            <Button onClick={handleOpenCreateDialog}>
              <AddIcon className="mr-2 h-4 w-4" />
              Добавить первый токен
            </Button>
          </Paper>
        }
        cardActions={(credential) => (
          <>
            <IconButton
              size="small"
              onClick={() => handleOpenEditDialog(credential)}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => credential.id && handleDelete(credential.id)}
              disabled={!credential.id}
              color="error"
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCredential ? 'Редактировать токен' : 'Добавить токен'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Окружение</InputLabel>
              <Select
                value={formData.environment}
                label="Окружение"
                onChange={handleSelectChange('environment')}
              >
                <MenuItem value="Sandbox">Sandbox</MenuItem>
                <MenuItem value="Production">Production</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Токен VK ORD"
              type="password"
              value={formData.tokenPlain}
              onChange={handleChange('tokenPlain')}
              required={!editingCredential}
              helperText={editingCredential ? "Оставьте пустым, если не хотите менять токен" : ""}
            />

            <TextField
              fullWidth
              label="Отображаемое название"
              value={formData.displayName}
              onChange={handleChange('displayName')}
              placeholder="Например: Основной токен, Тестовый токен"
            />
          </Box>

          {(createMutation.isError || updateMutation.isError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {createMutation.error?.message || updateMutation.error?.message}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={handleCloseDialog}>Отмена</Button>
          <Button
            onClick={handleSubmit}
            disabled={
              createMutation.isPending ||
              updateMutation.isPending ||
              (!editingCredential && !formData.tokenPlain)
            }
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <CircularProgress size={16} className="mr-2" sx={{ color: 'inherit' }} />
                {editingCredential
                  ? 'Обновление...'
                  : 'Синхронизация (до 5 минут, выполняется один раз)...'
                }
              </>
            ) : editingCredential ? (
              'Обновить'
            ) : (
              'Создать'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
