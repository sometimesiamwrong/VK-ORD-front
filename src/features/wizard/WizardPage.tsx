import React from 'react'
import { AppProvider } from '../../context/AppContext'
import { Wizard } from '../../components/wizard/Wizard'

export const WizardPage: React.FC = () => {
  return (
    <AppProvider>
      <Wizard />
    </AppProvider>
  )
}


