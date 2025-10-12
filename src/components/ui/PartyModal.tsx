import React from 'react'
import type { CounterpartyItem } from '../../types'

interface PartyModalProps {
  open: boolean
  title: string
  counterparties: CounterpartyItem[]
  loading?: boolean
  onSelect: (party: CounterpartyItem | null) => void
  onClose: () => void
  onSearch?: (query: string) => Promise<CounterpartyItem[]>
  onEnterManually?: (value: string) => void
}

const formatPartyType = (type: string | number | null | undefined): string => {
  // 1 => ИП
  // 2 => ЮР лицо
  // 3 => Физ. лицо
  if (!type) return ''
  const typeStr = String(type).toLowerCase()
  if (typeStr === 'ip' || type === 1) return 'ИП'
  if (typeStr === 'juridical' || type === 2) return 'ЮР лицо'
  if (typeStr === 'physical' || type === 3) return 'Физ. лицо'
  return String(type)
}

export const PartyModal: React.FC<PartyModalProps> = ({
  open,
  title,
  counterparties,
  loading = false,
  onSelect,
  onClose,
  onSearch,
  onEnterManually
}) => {
  const [query, setQuery] = React.useState('')
  const [page, setPage] = React.useState(1)
  const ITEMS_PER_PAGE = 10

  React.useEffect(() => {
    if (!open) {
      setQuery('')
      setPage(1)
    } else {
      setPage(1)
    }
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

  const [searchResults, setSearchResults] = React.useState<CounterpartyItem[]>(counterparties)

  React.useEffect(() => {
    if (query.trim().length >= 3 && onSearch) {
      onSearch(query).then(setSearchResults).catch(() => setSearchResults(counterparties))
    } else {
      setSearchResults(counterparties)
    }
  }, [query, counterparties, onSearch])

  const filtered = searchResults.filter((c) => {
    if (!query.trim()) return true
    const inn = c.juridicalDetails?.inn || ''
    const name = c.name || ''
    return inn.includes(query.trim()) || name.toLowerCase().includes(query.trim().toLowerCase())
  })

  React.useEffect(() => {
    // Reset to first page on search query change
    setPage(1)
  }, [query])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))
  React.useEffect(() => {
    // Clamp page when filtered results shrink/expand
    setPage((p) => Math.min(Math.max(1, p), totalPages))
  }, [totalPages])

  const start = (page - 1) * ITEMS_PER_PAGE
  const end = start + ITEMS_PER_PAGE
  const pageItems = filtered.slice(start, end)

  if (!open) return null

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
            <button
              className="vk-btn"
              onClick={() => onEnterManually?.(query.replace(/\D/g, ''))}
            >
              Ввести ИНН вручную
            </button>
          )}
        </div>
        <div className="vk-modal__content">
          {loading ? (
            <div className="vk-modal__empty">Загрузка…</div>
          ) : filtered.length === 0 ? (
            <div className="vk-modal__empty">Ничего не найдено</div>
          ) : (
            <div className="vk-modal__list">
              {pageItems.map((party) => (
                <button
                  key={`${party.juridicalDetails?.inn || 'unknown'}-${party.name || 'unknown'}`}
                  className="vk-modal__item"
                  onClick={() => onSelect(party)}
                  title={`${party.name || 'Неизвестно'}\nИНН: ${party.juridicalDetails?.inn || 'Не указан'}\nТип: ${formatPartyType(party.juridicalDetails?.type)}`}
                >
                  <div className="vk-modal__item-name">{party.name || 'Неизвестно'}</div>
                  <div className="vk-modal__item-meta">
                    <span>ИНН: {party.juridicalDetails?.inn || 'Не указан'}</span>
                    <span>•</span>
                    <span>{formatPartyType(party.juridicalDetails?.type)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="vk-modal__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--vk-muted)' }}>
              Показано {total > 0 ? `${start + 1}–${Math.min(end, total)}` : '0'} из {total}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="vk-btn" onClick={() => setPage(1)} disabled={page <= 1}>«</button>
              <button className="vk-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Назад</button>
              <span style={{ fontSize: 12, color: 'var(--vk-muted)' }}>Стр. {page}/{totalPages}</span>
              <button className="vk-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Вперед</button>
              <button className="vk-btn" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


