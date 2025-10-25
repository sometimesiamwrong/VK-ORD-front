import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import type { PartyRole } from '../../../types'

const ROLE_OPTIONS = [
  { value: 'advertiser', label: 'Рекламодатель' },
  { value: 'agency', label: 'Рекламное агентство' },
  { value: 'ors', label: 'Оператор рекламных систем' },
  { value: 'publisher', label: 'Издатель' }
]

interface MultiRoleSelectorProps {
  selectedRoles: PartyRole
  onChange: (roles: PartyRole) => void
  hasError?: boolean
}

export const MultiRoleSelector: React.FC<MultiRoleSelectorProps> = ({
  selectedRoles,
  onChange,
  hasError = false
}) => {
  const handleAddRole = (role: string) => {
    const roleValue = role as PartyRole[0]
    if (!selectedRoles.includes(roleValue)) {
      onChange([...selectedRoles, roleValue])
    }
  }

  const handleRemoveRole = (roleToRemove: PartyRole[0]) => {
    onChange(selectedRoles.filter(role => role !== roleToRemove))
  }

  const getRoleLabel = (value: PartyRole[0]) => {
    return ROLE_OPTIONS.find(opt => opt.value === value)?.label || value
  }

  return (
    <div className="vk-select-container">
      {/* Selected roles as badges */}
      {selectedRoles.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 6
        }}>
          {selectedRoles.map(role => (
            <div
              key={role}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                backgroundColor: 'var(--vk-primary, #0077ff)',
                color: 'white',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500
              }}
            >
              {getRoleLabel(role)}
              <button
                type="button"
                onClick={() => handleRemoveRole(role)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white'
                }}
                aria-label={`Удалить роль ${getRoleLabel(role)}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Selector to add more roles */}
      <Select
        value=""
        onValueChange={handleAddRole}
      >
        <SelectTrigger hasError={hasError && selectedRoles.length === 0}>
          <SelectValue placeholder="Добавить роль..." />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={selectedRoles.includes(option.value as PartyRole[0])}
            >
              {option.label}
              {selectedRoles.includes(option.value as PartyRole[0]) && ' ✓'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
