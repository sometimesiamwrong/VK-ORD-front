import React, { useState, useEffect } from 'react'
import { useCredentials } from '../../features/credentials/hooks'
import { useEnvironmentStore, useTokenStore } from '../../auth/tokenStore'
import { useUserProfile } from '../../auth/hooks'
import { saveToCookie } from '../../utils'
import { toast } from 'sonner'

interface CredentialSelectorProps {
  vkApiKey: string | null
  useSandbox: boolean
  onVkApiKeyChange: (key: string | null) => void
  onUseSandboxChange: (useSandbox: boolean) => void
}

export const CredentialSelector: React.FC<CredentialSelectorProps> = ({
  vkApiKey,
  useSandbox,
  onVkApiKeyChange,
  onUseSandboxChange,
}) => {  
  const { data: userProfile } = useUserProfile()
  const { data: credentials, isLoading, error } = useCredentials()
  const { environment, setEnvironment } = useEnvironmentStore()
  const { accessToken } = useTokenStore()



  // Filter credentials by current environment and ensure they have valid publicId
  // Defensive: ensure credentials is an array before using array methods
  const credsArray = Array.isArray(credentials) ? credentials : []

  const filteredCredentials = credsArray.filter(
    c => c.environment === (useSandbox ? 'Sandbox' : 'Production') && c.publicId
  )

  const [selectedCredentialId, setSelectedCredentialId] = useState<string>('')

  // Sync environment with useSandbox
  useEffect(() => {
    const newEnv = useSandbox ? 'sandbox' : 'prod'
    if (environment !== newEnv) {
      setEnvironment(newEnv)
    }
  }, [useSandbox, environment, setEnvironment])

  // Initialize with existing vkApiKey if present
  useEffect(() => {
    if (vkApiKey && !selectedCredentialId) {
      // Check if this is a credential-based token
      const savedCredentialId = document.cookie
        .split('; ')
        .find(row => row.startsWith('vkord-credential-id='))
        ?.split('=')[1]
      
      if (savedCredentialId) {
        setSelectedCredentialId(savedCredentialId)
      }
    }
  }, [vkApiKey, selectedCredentialId])

  const handleCredentialSelect = (credentialId: string) => {
    setSelectedCredentialId(credentialId)

    if (credentialId) {
      // Save credential ID to cookie - token will be fetched when needed
      saveToCookie('vkord-credential-id', credentialId)
      saveToCookie('vkord-use-sandbox', useSandbox.toString())

      // Update the wizard state with credential ID instead of token
      onVkApiKeyChange(credentialId)
      toast.success('Учетные данные успешно выбраны')
    } else {
      onVkApiKeyChange(null)
      saveToCookie('vkord-credential-id', '')
    }
  }


  const handleEnvironmentToggle = (sandbox: boolean) => {
    onUseSandboxChange(sandbox)
    setEnvironment(sandbox ? 'sandbox' : 'prod')
    setSelectedCredentialId('') // Reset selection when environment changes
  }

  return (
    <div className="vk-api-key-container">
      <div className="vk-card vk-api-key-card">
        <h3 style={{ marginTop: 0, color: 'var(--vk-primary)' }}>🔑 Выбор токена VK API</h3>

        {/* Environment toggle */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={useSandbox}
              onChange={(e) => handleEnvironmentToggle(e.target.checked)}
            />
            Окружение: <strong>{useSandbox ? 'Песочница (Sandbox)' : 'Продакшн (Production)'}</strong>
          </label>
          <div style={{ fontSize: 12, color: 'var(--vk-muted)', marginTop: 4, marginLeft: 24 }}>
            {useSandbox
              ? 'Тестовый режим для разработки и проверки интеграции'
              : 'Продакшн режим для реальной маркировки рекламы'
            }
          </div>
        </div>

        {isLoading && (
          <div style={{ padding: 16, textAlign: 'center', color: 'var(--vk-muted)' }}>
            Загрузка токенов...
          </div>
        )}

        {error && (
          <div style={{ 
            padding: 12, 
            backgroundColor: 'var(--vk-error-bg)', 
            color: 'var(--vk-error)',
            borderRadius: 6,
            marginBottom: 12
          }}>
            Ошибка загрузки токенов: {error.message}
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Credential selector */}
            {filteredCredentials.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Выберите сохраненный токен:
                </label>
                <select
                  className="vk-input"
                  value={selectedCredentialId}
                  onChange={(e) => handleCredentialSelect(e.target.value)}
                  style={{ marginBottom: 8 }}
                >
                  <option value="">-- Выберите токен --</option>
                  {filteredCredentials.map(cred => (
                    <option key={cred.publicId!} value={cred.publicId!}>
                      {cred.displayName || `Токен от ${cred.createdAt ? new Date(cred.createdAt).toLocaleDateString('ru-RU') : 'неизвестной даты'}`}
                    </option>
                  ))}
                </select>


                {selectedCredentialId && (
                  <div style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--vk-success-bg)',
                    color: 'var(--vk-success)',
                    borderRadius: 6,
                    fontWeight: 600,
                    marginBottom: 8
                  }}>
                    ✅ Токен выбран
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                padding: 12,
                backgroundColor: 'var(--vk-warning-bg)',
                color: 'var(--vk-warning)',
                borderRadius: 6,
                marginBottom: 8
              }}>
                ⚠️ Нет сохраненных токенов для {useSandbox ? 'Sandbox' : 'Production'}.
                Перейдите на страницу <a href="/credentials" style={{ color: 'inherit', fontWeight: 'bold' }}>Credentials</a> для добавления токена.
              </div>
            )}
          </>
        )}

        {/* Link to credentials page */}
        <div style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid var(--vk-border)',
          fontSize: 13,
          color: 'var(--vk-muted)'
        }}>
          💡 Управляйте токенами на странице{' '}
          <a href="/#/credentials" style={{ color: 'var(--vk-primary)', textDecoration: 'none' }}>
            Credentials
          </a>
        </div>
      </div>
    </div>
  )
}

