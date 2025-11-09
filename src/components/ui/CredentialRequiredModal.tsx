import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { Button } from './button'
import { useNavigate } from 'react-router-dom'
import { VpnKey as VpnKeyIcon } from '@mui/icons-material'
import { useCredentials } from '../../features/credentials/hooks'
import { useEnvironmentStore } from '../../auth/tokenStore'
import { saveToCookie } from '../../utils'
import { toast } from 'sonner'
import { queryClient } from '../../api/queryClient'

interface CredentialRequiredModalProps {
  open: boolean
  selectedCredentialId: string
  onCredentialSelect: (credentialId: string) => void
}

/**
 * Modal that blocks the screen when no API credential is selected
 * Forces user to either select a credential or go to credentials page
 */
export const CredentialRequiredModal: React.FC<CredentialRequiredModalProps> = ({
  open,
  selectedCredentialId,
  onCredentialSelect,
}) => {
  const navigate = useNavigate()
  const { data: credentials, isLoading } = useCredentials()
  const { environment } = useEnvironmentStore()
  const [tempSelectedId, setTempSelectedId] = React.useState<string>(selectedCredentialId)

  React.useEffect(() => {
    setTempSelectedId(selectedCredentialId)
  }, [selectedCredentialId])

  // Filter credentials by current environment
  const credsArray = Array.isArray(credentials) ? credentials : []
  const filteredCredentials = credsArray.filter(
    c => c.environment === (environment === 'sandbox' ? 'Sandbox' : 'Production') && c.publicId
  )

  const handleCredentialChange = (event: SelectChangeEvent<string>) => {
    setTempSelectedId(event.target.value)
  }

  const handleConfirm = () => {
    if (tempSelectedId) {
      // Save to cookie
      saveToCookie('vkord-credential-id', tempSelectedId)
      saveToCookie('vkord-use-sandbox', (environment === 'sandbox').toString())

      // Clear all caches when changing credentials
      queryClient.clear()
      
      // Restore essential data
      saveToCookie('vkord-credential-id', tempSelectedId)
      saveToCookie('vkord-use-sandbox', (environment === 'sandbox').toString())

      toast.success('API ключ выбран')
      
      // Notify parent
      onCredentialSelect(tempSelectedId)
      
      // Reload page to reset all state
      setTimeout(() => {
        window.location.reload()
      }, 300)
    }
  }

  const handleGoToCredentials = () => {
    navigate('/credentials')
  }

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <VpnKeyIcon color="primary" />
        <Typography variant="h6">Требуется выбрать API ключ</Typography>
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Внимание</AlertTitle>
          Для работы с VK ORD необходимо выбрать API ключ. Без выбранного ключа вы не сможете создавать контракты и креативы.
        </Alert>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Текущее окружение: <strong>{environment === 'sandbox' ? 'Песочница' : 'Продакшн'}</strong>
        </Typography>

        {filteredCredentials.length > 0 ? (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="modal-credential-select-label">
              Выберите API ключ
            </InputLabel>
            <Select
              labelId="modal-credential-select-label"
              value={tempSelectedId}
              label="Выберите API ключ"
              onChange={handleCredentialChange}
              disabled={isLoading}
            >
              <MenuItem value="">
                <em>-- Выберите ключ --</em>
              </MenuItem>
              {filteredCredentials.map(cred => (
                <MenuItem key={cred.publicId!} value={cred.publicId!}>
                  {cred.displayName || `Ключ от ${cred.createdAt ? new Date(cred.createdAt).toLocaleDateString('ru-RU') : 'неизв. даты'}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Ключи не найдены</AlertTitle>
            У вас нет API ключей для текущего окружения. Перейдите на страницу управления ключами, чтобы создать новый.
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary">
          Вы можете переключить окружение (Песочница/Продакшн) в верхней панели после выбора ключа.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          variant="outline"
          onClick={handleGoToCredentials}
        >
          Управление ключами
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!tempSelectedId || isLoading}
        >
          Подтвердить выбор
        </Button>
      </DialogActions>
    </Dialog>
  )
}
