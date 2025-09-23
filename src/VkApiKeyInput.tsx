import React, { useState } from 'react'
import { saveToCookie } from './utils'

interface VkApiKeyInputProps {
    vkApiKey: string | null
    useSandbox: boolean
    onVkApiKeyChange: (key: string | null) => void
    onUseSandboxChange: (useSandbox: boolean) => void
}

export const VkApiKeyInput: React.FC<VkApiKeyInputProps> = ({
    vkApiKey,
    useSandbox,
    onVkApiKeyChange,
    onUseSandboxChange
}) => {
    const [inputKey, setInputKey] = useState('')
    const [isEditing, setIsEditing] = useState(!vkApiKey)

    const handleSave = () => {
        if (inputKey.trim()) {
            saveToCookie('vkord-api-key', inputKey.trim())
            saveToCookie('vkord-use-sandbox', useSandbox.toString())
            onVkApiKeyChange(inputKey.trim())
            setIsEditing(false)
        }
    }

    const handleEdit = () => {
        setInputKey(vkApiKey || '')
        setIsEditing(true)
    }

    const handleCancel = () => {
        setInputKey('')
        setIsEditing(false)
    }

    return (
        <div className="vk-api-key-container">
            <div className="vk-card vk-api-key-card">
                <h3 style={{ marginTop: 0, color: 'var(--vk-primary)' }}>🔑 Настройки VK API</h3>

                {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                                API ключ VK ОРД
                            </label>
                            <input
                                type="password"
                                className="vk-input"
                                placeholder="Введите API ключ..."
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={useSandbox}
                                    onChange={(e) => onUseSandboxChange(e.target.checked)}
                                />
                                Использовать: <strong>{useSandbox ? 'Песочница ОРД' : 'ОРД'}</strong>
                            </label>
                            <div style={{ fontSize: 12, color: 'var(--vk-muted)', marginTop: 4 }}>
                                {useSandbox
                                    ? 'Тестовый режим для разработки и проверки интеграции'
                                    : 'Продакшн режим для реальной маркировки рекламы'
                                }
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                className="vk-btn vk-btn--primary"
                                onClick={handleSave}
                                disabled={!inputKey.trim()}
                            >
                                Сохранить
                            </button>
                            <button
                                className="vk-btn"
                                onClick={handleCancel}
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{
                                padding: '8px 16px',
                                backgroundColor: 'var(--vk-success-bg)',
                                color: 'var(--vk-success)',
                                borderRadius: 6,
                                fontWeight: 600
                            }}>
                                ✅ Принято
                            </div>
                            <button
                                className="vk-btn vk-btn--secondary"
                                onClick={handleEdit}
                            >
                                Изменить
                            </button>
                        </div>

                        <div style={{ fontSize: 14, color: 'var(--vk-muted)' }}>
                            Режим: <strong style={{ color: 'var(--vk-text)' }}>
                                {useSandbox ? 'Песочница ОРД' : 'ОРД'}
                            </strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
