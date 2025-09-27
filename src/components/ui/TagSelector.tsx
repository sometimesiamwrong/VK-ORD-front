import React, { useState, useMemo } from 'react'
import { kktyData } from '../../constants/kkty-data'

interface TagSelectorProps {
  selectedCodes?: string
  onChange: (code: string) => void
  hasError?: boolean
}

export const TagSelector: React.FC<TagSelectorProps> = ({ selectedCodes = '', onChange, hasError = false }) => {
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  // Flatten all items with their codes
  const allItems = useMemo(() => {
    const items: Array<{ code: string; name: string; category: string; subcategory: string }> = []
    try {
      if (!kktyData || !kktyData.categories) return items
      Object.values(kktyData.categories).forEach(category => {
        if (!category || category.name === 'ИТОГО: 30 категорий' || !category.subcategories || typeof category.subcategories !== 'object') return
        Object.entries(category.subcategories).forEach(([subId, sub]) => {
          if (!sub || !sub.items || !Array.isArray(sub.items)) return
          sub.items.forEach(item => {
            items.push({
              code: subId + '.' + (sub.items.indexOf(item) + 1), // Generate code like 9.1.2
              name: item,
              category: category.name,
              subcategory: sub.name
            })
          })
        })
      })
    } catch (e) {
      console.error('Error processing KKTY data:', e)
    }
    console.log('All KKTY items loaded:', items.length)
    return items
  }, [])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return []
    const lower = search.toLowerCase()
    return allItems.filter(item =>
      item.name.toLowerCase().includes(lower) ||
      item.category.toLowerCase().includes(lower) ||
      item.subcategory.toLowerCase().includes(lower) ||
      item.code.includes(lower)
    ).slice(0, 20) // Limit results
  }, [search, allItems])

  const addCode = (code: string) => {
    onChange(code)
    setSearch('')
    setShowDropdown(false)
  }

  const removeCode = () => {
    onChange('')
  }

  const getItemName = (code: string) => {
    return allItems.find(item => item.code === code)?.name || code
  }

  return (
    <div style={{ position: 'relative' }}>
      <label>ККТУ коды</label>
      {/* Selected tag */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 40, padding: '8px 12px', border: `1px solid ${hasError ? 'var(--vk-danger)' : 'var(--vk-border)'}`, borderRadius: 10, background: '#fff', marginTop: 8, boxShadow: hasError ? '0 0 0 3px rgba(230, 70, 70, 0.15)' : undefined }}>
        {selectedCodes && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              background: 'var(--vk-primary)',
              color: '#fff',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500
            }}
          >
            {selectedCodes}: {getItemName(selectedCodes)}
            <button
              onClick={removeCode}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                lineHeight: 1,
                padding: 0
              }}
            >
              ×
            </button>
          </span>
        )}
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder="Поиск и добавление кодов..."
          style={{
            flex: 1,
            minWidth: 200,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 14
          }}
        />
      </div>
      {/* Dropdown */}
      {showDropdown && search.trim() && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid var(--vk-border)',
            borderRadius: 10,
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {filteredItems.map(item => (
            <div
              key={item.code}
              onMouseDown={() => addCode(item.code)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
                fontSize: 14
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f7f8fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
            >
              <div style={{ fontWeight: 600 }}>{item.code}: {item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--vk-muted)' }}>{item.category} → {item.subcategory}</div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div style={{ padding: '8px 12px', color: 'var(--vk-muted)', fontSize: 14 }}>
              Ничего не найдено
            </div>
          )}
        </div>
      )}
    </div>
  )
}
