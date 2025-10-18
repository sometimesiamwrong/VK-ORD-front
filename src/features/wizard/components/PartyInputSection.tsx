import React from 'react'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isValidInn } from '../../../utils'
import type { PartyRole } from '../../../types'

const ROLE_OPTIONS = [
  { value: 'advertiser', label: 'Рекламодатель' },
  { value: 'agency', label: 'Рекламное агентство' },
  { value: 'ors', label: 'Оператор рекламных систем' },
  { value: 'publisher', label: 'Издатель' }
]

interface PartyInputSectionProps {
  label: string
  inn: string
  role: PartyRole[0]
  info: string | null
  isLoading: boolean
  isInCounterparties: boolean
  onInnChange: (value: string) => void
  onInnBlur: () => void
  onRoleChange: (role: PartyRole[0]) => void
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

          <Select
            value={role}
            onValueChange={value => onRoleChange(value as PartyRole[0])}
          >
            <SelectTrigger hasError={!role}>
              <SelectValue placeholder={`Роль ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

      {info && (
        <div style={{ color: 'var(--vk-muted)', marginTop: 4 }}>
          {info}
        </div>
      )}
    </>
  )
}
