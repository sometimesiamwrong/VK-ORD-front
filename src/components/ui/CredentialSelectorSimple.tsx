import React, { useState, useEffect } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useCredentials } from '../../features/credentials/hooks'
import { useEnvironmentStore } from '../../auth/tokenStore'
import { saveToCookie, getCookie } from '../../utils'
import { toast } from 'sonner'
import { queryClient } from '../../api/queryClient'

interface CredentialSelectorSimpleProps {
  variant?: 'appbar' | 'drawer'
}

/**
 * Simplified credential selector for top bar
 * Manages VK ORD credentials and environment selection
 */
export const CredentialSelectorSimple: React.FC<CredentialSelectorSimpleProps> = ({ variant = 'appbar' }) => {
  const { data: credentials, isLoading } = useCredentials()
  const { environment, setEnvironment } = useEnvironmentStore()
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>('')

  // Filter credentials by current environment
  const credsArray = Array.isArray(credentials) ? credentials : []
  const filteredCredentials = credsArray.filter(
    c => c.environment === (environment === 'sandbox' ? 'Sandbox' : 'Production') && c.publicId
  )

  // Initialize from cookie
  useEffect(() => {
    const savedCredentialId = getCookie('vkord-credential-id')
    if (savedCredentialId) {
      setSelectedCredentialId(savedCredentialId)
    }
  }, [])

  const handleCredentialChange = (event: SelectChangeEvent<string>) => {
    const credentialId = event.target.value
    setSelectedCredentialId(credentialId)

    if (credentialId) {
      // Save to cookie
      saveToCookie('vkord-credential-id', credentialId)
      saveToCookie('vkord-use-sandbox', (environment === 'sandbox').toString())

      // Clear all caches when changing credentials
      queryClient.clear()
      localStorage.clear()
      
      // Restore essential data
      saveToCookie('vkord-credential-id', credentialId)
      saveToCookie('vkord-use-sandbox', (environment === 'sandbox').toString())

      toast.success('Ключ изменен. Кэш очищен.')
      
      // Reload page to reset all state
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } else {
      saveToCookie('vkord-credential-id', '')
      queryClient.clear()
    }
  }

  const handleEnvironmentChange = (event: SelectChangeEvent<string>) => {
    const newEnv = event.target.value as 'sandbox' | 'prod'
    setEnvironment(newEnv)
    setSelectedCredentialId('') // Reset credential selection
    saveToCookie('vkord-credential-id', '')
    
    // Clear cache on environment change
    queryClient.clear()
    toast.info(`Переключено на ${newEnv === 'sandbox' ? 'Песочницу' : 'Основной'}`)
  }

  // Styles based on variant
  const isDrawer = variant === 'drawer'
  const labelColor = isDrawer ? 'text.primary' : 'white'
  const selectStyles = isDrawer ? {
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: 'divider',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'primary.main',
    },
  } : {
    color: 'white',
    '.MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'white',
    },
    '.MuiSvgIcon-root': {
      color: 'white',
    },
  }

  if (isLoading) {
    return (
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="caption" color="text.secondary">
          Загрузка...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: isDrawer ? 'column' : 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' }, width: isDrawer ? '100%' : 'auto' }}>
      {/* Environment Selector */}
      <FormControl size="small" sx={{ minWidth: isDrawer ? 'auto' : 120, width: isDrawer ? '100%' : 'auto' }}>
        <InputLabel id="environment-select-label" sx={{ color: labelColor }}>
          Окружение
        </InputLabel>
        <Select
          labelId="environment-select-label"
          value={environment}
          label="Окружение"
          onChange={handleEnvironmentChange}
          sx={selectStyles}
        >
          <MenuItem value="sandbox">Песочница</MenuItem>
          <MenuItem value="prod">Основной</MenuItem>
        </Select>
      </FormControl>

      {/* Credential Selector */}
      <FormControl size="small" sx={{ minWidth: isDrawer ? 'auto' : 200, width: isDrawer ? '100%' : 'auto' }}>
        <InputLabel id="credential-select-label" sx={{ color: labelColor }}>
          VK ORD Ключ
        </InputLabel>
        <Select
          labelId="credential-select-label"
          value={selectedCredentialId}
          label="VK ORD Ключ"
          onChange={handleCredentialChange}
          disabled={filteredCredentials.length === 0}
          sx={selectStyles}
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

      {filteredCredentials.length === 0 && (
        <Typography variant="caption" sx={{ color: isDrawer ? 'text.secondary' : 'rgba(255, 255, 255, 0.7)' }}>
          Нет доступных ключей
        </Typography>
      )}
    </Box>
  )
}
