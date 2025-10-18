import React from 'react'
import type { AiKktyItem } from '../../../types'

interface KktyHintsPanelProps {
  hints: AiKktyItem[]
}

export const KktyHintsPanel: React.FC<KktyHintsPanelProps> = ({ hints }) => {
  if (hints.length === 0) return null

  const sortedHints = hints
    .slice()
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))

  return (
    <div className="vk-card" style={{ marginTop: 6 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        {sortedHints.map((h, idx) => {
          const score = typeof h.relevanceScore === 'number' ? h.relevanceScore : 0
          const isHigh = score >= 0.9
          const isMedium = !isHigh && score >= 0.6
          const badgeClass = isHigh
            ? 'vk-badge vk-badge--score-high'
            : isMedium
              ? 'vk-badge vk-badge--score-medium'
              : ''
          const badgeLabel = isHigh ? 'Главная тема' : isMedium ? 'Важная деталь' : ''

          return (
            <div key={idx} style={{ display: 'grid', gap: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ fontWeight: 700 }}>
                  {h.code}: {h.fullName}
                </div>
                {badgeClass && (
                  <span className={badgeClass} title={`relevanceScore: ${score.toFixed(2)}`}>
                    {badgeLabel}
                  </span>
                )}
              </div>
              <div style={{ color: 'var(--vk-muted)' }}>{h.reason}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
