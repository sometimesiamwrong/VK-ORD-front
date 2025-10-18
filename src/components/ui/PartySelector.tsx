import React from 'react'
import type { CounterpartyItem } from '../../types'

interface PartySelectorProps {
  counterparties: CounterpartyItem[]
  onSelect: (inn: string) => void
  label: string
  disabled?: boolean
  loading?: boolean
}

const formatPartyType = (type: string | null | undefined): string => {
  if (!type) return ''
  const lowerType = type.toLowerCase()
  if (lowerType === 'ip') return 'ИП'
  if (lowerType === 'juridical') return 'ЮР лицо'
  if (lowerType === 'physical') return 'Физ. лицо'
  return type
}

export const PartySelector: React.FC<PartySelectorProps> = ({ 
  counterparties, 
  onSelect, 
  label,
  disabled = false,
  loading = false
}) => {
  if (loading) {
    return (
      <div style={{ marginBottom: 8 }}>
        <div className="vk-label" style={{ fontSize: '0.85em', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--vk-muted)', fontSize: '0.9em' }}>Загрузка...</div>
      </div>
    )
  }

  if (!counterparties || counterparties.length === 0) {
    return null
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div className="vk-label" style={{ fontSize: '0.85em', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {counterparties.map((party) => (
          <button
            key={party.juridical_details?.inn || party.external_id}
            type="button"
            className="vk-btn vk-btn--small"
            disabled={disabled}
            onClick={() => onSelect(party.juridical_details?.inn || '')}
            title={`${party.name}\nИНН: ${party.juridical_details?.inn}\nТип: ${formatPartyType(party.juridical_details?.type)}`}
            style={{
              fontSize: '0.85em',
              padding: '4px 8px',
              whiteSpace: 'nowrap',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {party.name}
            {party.juridical_details?.type && ` (${formatPartyType(party.juridical_details.type)})`}
          </button>
        ))}
      </div>
    </div>
  )
}

