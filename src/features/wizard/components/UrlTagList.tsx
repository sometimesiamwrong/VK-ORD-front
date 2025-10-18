import React from 'react'
import { Button } from '../../../components/ui/button'

interface UrlTagListProps {
  urls: string[]
  onRemove: (index: number) => void
}

export const UrlTagList: React.FC<UrlTagListProps> = ({ urls, onRemove }) => {
  if (!urls || urls.length === 0) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {urls.map((url, idx) => (
        <span
          key={url + idx}
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
          title={url}
        >
          {url}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(idx)}
            aria-label="Удалить ссылку"
            className="text-white hover:text-white hover:bg-white/10 h-auto w-auto p-1"
          >
            ×
          </Button>
        </span>
      ))}
    </div>
  )
}
