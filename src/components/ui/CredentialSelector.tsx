import React, { useState, useEffect } from 'react'
import { useCredentials, useGetCredentialToken } from '../../features/credentials/hooks'
import { useEnvironmentStore } from '../../auth/tokenStore'
import { saveToCookie } from '../../utils'
import { toast } from 'react-toastify'

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
  const { data: credentials, isLoading, error } = useCredentials()
  const getTokenMutation = useGetCredentialToken()
  const { environment, setEnvironment } = useEnvironmentStore()
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>('')
  const [useManualInput, setUseManualInput] = useState(false)
  const [manualKey, setManualKey] = useState('')

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

  // Filter credentials by current environment
  const filteredCredentials = credentials?.filter(
    c => c.environment === (useSandbox ? 'Sandbox' : 'Production')
  ) || []

  const handleCredentialSelect = (credentialId: string) => {
    setSelectedCredentialId(credentialId)
    
    if (credentialId) {
      // Fetch the actual token from the API
      getTokenMutation.mutate(credentialId, {
        onSuccess: (token) => {
          // Save the token to cookie for the old API client
          saveToCookie('vkord-api-key', token)
          saveToCookie('vkord-credential-id', credentialId)
          saveToCookie('vkord-use-sandbox', useSandbox.toString())
          
          // Update the wizard state
          onVkApiKeyChange(token)
          toast.success('Токен успешно выбран')
        },
        onError: (error: any) => {
          toast.error(`Ошибка получения токена: ${error?.message || 'Неизвестная ошибка'}`)
          setSelectedCredentialId('')
          onVkApiKeyChange(null)
        },
      })
    } else {
      onVkApiKeyChange(null)
      saveToCookie('vkord-api-key', '')
      saveToCookie('vkord-credential-id', '')
    }
  }

  const handleManualSave = () => {
    if (manualKey.trim()) {
      saveToCookie('vkord-api-key', manualKey.trim())
      saveToCookie('vkord-use-sandbox', useSandbox.toString())
      onVkApiKeyChange(manualKey.trim())
      setUseManualInput(false)
      toast.success('Токен сохранён и будет использован в запросах')
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
            {filteredCredentials.length > 0 && !useManualInput && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Выберите сохраненный токен:
                </label>
                <select
                  className="vk-input"
                  value={selectedCredentialId}
                  onChange={(e) => handleCredentialSelect(e.target.value)}
                  style={{ marginBottom: 8 }}
                  disabled={getTokenMutation.isPending}
                >
                  <option value="">-- Выберите токен --</option>
                  {filteredCredentials.map(cred => (
                    <option key={cred.id} value={cred.id}>
                      {cred.displayName || `Токен от ${new Date(cred.createdAt).toLocaleDateString('ru-RU')}`}
                    </option>
                  ))}
                </select>

                {getTokenMutation.isPending && (
                  <div style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--vk-info-bg)',
                    color: 'var(--vk-info)',
                    borderRadius: 6,
                    marginBottom: 8
                  }}>
                    ⏳ Загрузка токена...
                  </div>
                )}

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

                <button
                  className="vk-btn vk-btn--secondary"
                  onClick={() => setUseManualInput(true)}
                  style={{ marginTop: 8 }}
                >
                  Или ввести токен вручную
                </button>
              </div>
            )}

            {/* Manual input */}
            {(filteredCredentials.length === 0 || useManualInput) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredCredentials.length === 0 && (
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

                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                    API ключ VK ОРД (ручной ввод)
                  </label>
                  <input
                    type="password"
                    className="vk-input"
                    placeholder="Введите API ключ..."
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="vk-btn vk-btn--primary"
                    onClick={handleManualSave}
                    disabled={!manualKey.trim()}
                  >
                    Сохранить
                  </button>
                  {filteredCredentials.length > 0 && (
                    <button
                      className="vk-btn"
                      onClick={() => {
                        setUseManualInput(false)
                        setManualKey('')
                      }}
                    >
                      Назад к списку
                    </button>
                  )}
                </div>
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
          <a href="/credentials" style={{ color: 'var(--vk-primary)', textDecoration: 'none' }}>
            Credentials
          </a>
        </div>
      </div>
    </div>
  )
}

