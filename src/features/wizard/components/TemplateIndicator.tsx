/**
 * Template Indicator Component
 *
 * Badge that shows "From Template" indicator in step headers.
 * Displayed when wizard is populated from a template.
 */

import React from 'react'
import { Badge } from '@/components/ui/badge'

export const TemplateIndicator: React.FC = () => {
  return (
    <Badge variant="secondary" className="ml-2 text-xs">
      Из шаблона
    </Badge>
  )
}
