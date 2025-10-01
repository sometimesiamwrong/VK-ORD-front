import React from 'react'
import type { CounterpartyItem } from '../../types'

interface PartyModalProps {
  open: boolean
  title: string
  counterparties: CounterpartyItem[]
  loading?: boolean
  onSelect: (inn: string) => void
  onClose: () => void
  onEnterManually?: () => void
}

const formatPartyType = (type: string | null | undefined): string => {
  if (!type) return ''
  const lower = type.toLowerCase()
  if (lower === 'ip') return 'ИП'
  if (lower === 'juridical') return 'ЮР лицо'
  if (lower === 'physical') return 'Физ. лицо'
  return type
}

export const PartyModal: React.FC<PartyModalProps> = ({
  open,
  title,
  counterparties,
  loading = false,
  onSelect,
  onClose,
  onEnterManually
}) => {
  const [query, setQuery] = React.useState('')

  React.useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const filtered = (counterparties || []).filter((c) => {
    if (!query.trim()) return true
    const inn = c.juridicalDetails?.inn || ''
    const name = c.name || ''
    return inn.includes(query.trim()) || name.toLowerCase().includes(query.trim().toLowerCase())
  })

  return (
    <div className="vk-modal-backdrop" onClick={onClose}>
      <div className="vk-modal" onClick={(e) => e.stopPropagation()}>
        <div className="vk-modal__header">
          <div className="vk-modal__title">{title}</div>
          <button className="vk-btn" onClick={onClose}>Закрыть</button>
        </div>
        <div className="vk-modal__tools">
          <input
            className="vk-input"
            placeholder="Поиск по названию или ИНН"
            value={query}
            onChange={(e) => setQuery(e.target.value.replace(/[^0-9a-zA-ZА-Яа-яёЁ\s\-"']/g, ''))}
          />
          {onEnterManually && (
            <button className="vk-btn" onClick={onEnterManually}>Ввести ИНН вручную</button>
          )}
        </div>
        <div className="vk-modal__content">
          {loading ? (
            <div className="vk-modal__empty">Загрузка…</div>
          ) : filtered.length === 0 ? (
            <div className="vk-modal__empty">Ничего не найдено</div>
          ) : (
            <div className="vk-modal__list">
              {filtered.map((party) => (
                <button
                  key={`${party.juridicalDetails.inn}-${party.name}`}
                  className="vk-modal__item"
                  onClick={() => onSelect(party.juridicalDetails.inn)}
                  title={`${party.name}\nИНН: ${party.juridicalDetails.inn}\nТип: ${formatPartyType(party.juridicalDetails.type)}`}
                >
                  <div className="vk-modal__item-name">{party.name}</div>
                  <div className="vk-modal__item-meta">
                    <span>ИНН: {party.juridicalDetails.inn}</span>
                    <span>•</span>
                    <span>{formatPartyType(party.juridicalDetails.type)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


