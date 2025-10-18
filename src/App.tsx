// Disable console clearing functions
if (typeof console !== 'undefined') {
    console.clear = function() {};
}
if (typeof window !== 'undefined') {
    (window as any).clear = function() {};
}

import React from 'react'
import { Wizard } from './components/wizard/Wizard'

export const App: React.FC = () => {
  return <Wizard />
}


