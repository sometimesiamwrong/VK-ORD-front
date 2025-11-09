import React from 'react'
import { Button } from '../../../components/ui/button'
import { isValidInn } from '../../../utils'
import type { PartyRole } from '../../../types'
import { MultiRoleSelector } from './MultiRoleSelector'

interface PartyInputSectionProps {
  label: string
  inn: string
  role: PartyRole
  info: string | null
  isLoading: boolean
  isInCounterparties: boolean
  onInnChange: (value: string) => void
  onInnBlur: () => void
  onRoleChange: (roles: PartyRole) => void
  onSelectClick: () => void
  onLookupClick: () => void
  onCreateClick: () => void
  isCreating: boolean
}

export const PartyInputSection: React.FC<PartyInputSectionProps> = ({
  label,
  inn,
  role,
  info,
  isLoading,
  isInCounterparties,
  onInnChange,
  onInnBlur,
  onRoleChange,
  onSelectClick,
  onLookupClick,
  onCreateClick,
  isCreating
}) => {
  return (
    <>
      <div className="vk-label">{label}</div>

      {/* Show counterparty name above INN input on mobile */}
      {info && (
        <div style={{
          color: 'var(--vk-text)',
          marginTop: 4,
          marginBottom: 8,
          fontSize: '15px',
          fontWeight: 600,
          padding: '8px 12px',
          backgroundColor: 'var(--vk-success-bg)',
          borderRadius: '8px',
          border: '1px solid var(--vk-border)'
        }}>
          {info}
        </div>
      )}

      <div className="vk-mobile-stack">
        <div className="vk-inline-controls">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              className="vk-input vk-input-inn"
              value={inn}
              list="innHistory"
              onChange={e => onInnChange(e.target.value)}
              onBlur={onInnBlur}
              autoComplete="on"
              placeholder="10 или 12 цифр"
              maxLength={12}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onSelectClick}
              aria-label={`Выбрать ${label.toLowerCase()} из списка`}
            >
              Выбрать
            </Button>
          </div>

          <MultiRoleSelector
            selectedRoles={role}
            onChange={onRoleChange}
            hasError={!role || role.length === 0}
          />

          <Button
            disabled={!isValidInn(inn) || isLoading}
            onClick={onLookupClick}
          >
            {isLoading ? 'Поиск…' : 'Проверить'}
          </Button>

          <Button
            variant="outline"
            disabled={!isValidInn(inn) || !role || isCreating}
            onClick={onCreateClick}
          >
            {isCreating
              ? (isInCounterparties ? 'Обновление…' : 'Создание…')
              : (isInCounterparties ? 'Обновить в VK ОРД' : 'Создать в VK ОРД')
            }
          </Button>
        </div>
      </div>
    </>
  )
}
