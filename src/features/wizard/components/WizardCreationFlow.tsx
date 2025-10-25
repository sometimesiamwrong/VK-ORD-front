import React, { useState } from 'react'
import {
  Paper,
  Box,
  Typography,
  Alert,
} from '@mui/material'
import {
  Business as BusinessIcon,
  Add as AddIcon,
  PhotoLibrary as CreativeIcon,
} from '@mui/icons-material'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CreateContractModal } from '@/features/wizard/components/CreateContractModal'
import { PartyContractSelector } from '@/components/ui/PartyContractSelector'
import { useCounterpartiesList } from '@/hooks/usePartyLookup'
import {
  useWizardActions,
} from '@/stores/wizardStore'
import type { ContractDto } from '@/types'
import type { PartyContractSelectionResult } from '@/components/ui/PartyContractSelector'
import { generateContractExternalId } from '@/utils'

interface WizardCreationFlowProps {
  onProceedToCreative: () => void
}

export const WizardCreationFlow: React.FC<WizardCreationFlowProps> = ({ onProceedToCreative }) => {
  const {
    setAdvertiserInn,
    setAdvertiserRole,
    setAdvertiserInfo,
    setContractorInn,
    setContractorRole,
    setContractorInfo,
    updateContract,
    setConsent,
    updateCreative,
  } = useWizardActions()

  const [selection, setSelection] = useState<PartyContractSelectionResult | null>(null)
  const [showCreateContractModal, setShowCreateContractModal] = useState(false)

  // API hooks
  const {
    data: counterpartiesList = [],
    isLoading: isLoadingCounterparties,
  } = useCounterpartiesList()

  const handleSelectionChange = (newSelection: PartyContractSelectionResult) => {
    setSelection(newSelection)
  }

  const handleCreateContract = (contractData: { serial: string | null; payDateEnd: string | null }) => {
    if (!selection?.party1 || !selection?.party2) {
      toast.error('Сначала выберите рекламодателя и исполнителя')
      return
    }

    // Создаем новый договор
    const newContract: ContractDto = {
      id: 0,
      externalId: generateContractExternalId(new Date(), 1),
      clientExternalId: selection.party1.externalId,
      contractorExternalId: selection.party2.externalId,
      data: {
        serial: contractData.serial || undefined,
        dateEnd: contractData.payDateEnd || undefined,
        clientExternalId: selection.party1.externalId,
        contractorExternalId: selection.party2.externalId,
      }
    }

    // Обновляем selection с новым договором
    setSelection({
      ...selection,
      contract: newContract
    })
    setShowCreateContractModal(false)
    toast.success('Договор создан')
  }

  const handleProceedToCreative = () => {
    if (!selection) {
      toast.error('Заполните все поля')
      return
    }

    const { party1: advertiser, party2: contractor, contract } = selection

    // Сохраняем данные в store
    // Рекламодатель
    setAdvertiserInn(advertiser.juridicalDetails?.inn || '')
    setAdvertiserRole(['advertiser'])
    setAdvertiserInfo({
      external_id: advertiser.externalId || null,
      name: advertiser.name || null,
      shortWithOpf: null,
      info: advertiser.name || null
    })

    // Исполнитель
    setContractorInn(contractor.juridicalDetails?.inn || '')
    setContractorRole(['publisher'])
    setContractorInfo({
      external_id: contractor.externalId || null,
      name: contractor.name || null,
      shortWithOpf: null,
      info: contractor.name || null
    })

    // Договор
    updateContract({
      externalId: contract.externalId || '',
      serial: contract.data?.serial || null,
      paySum: contract.amount ? Number(contract.amount) : null,
      payDateEnd: contract.data?.dateEnd || null
    })

    // Привязываем договор к креативу
    updateCreative({
      contractExternalIds: [contract.externalId || '']
    })

    // Согласие на обработку данных
    setConsent(true)

    // Переходим к креативу
    onProceedToCreative()
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Создание креатива
      </Typography>

      <PartyContractSelector
        party1Label="Рекламодатель"
        party2Label="Исполнитель"
        party1Icon={<BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />}
        party2Icon={<BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />}
        onSelectionComplete={handleSelectionChange}
        parties={counterpartiesList}
        isLoadingParties={isLoadingCounterparties}
        party1ModalTitle="Выберите рекламодателя"
        party2ModalTitle="Выберите исполнителя"
        showSearchInfo={true}
        autoSelectFromContract={true}
        renderActions={(canProceed) => (
          <Box>
            {/* Информация о выбранном договоре */}
            {selection?.contract && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="600">
                  Договор выбран: {selection.contract.data?.serial || selection.contract.externalId || 'Без номера'}
                </Typography>
                {selection.contract.data?.dateEnd && (
                  <Typography variant="caption">
                    Действует до: {new Date(selection.contract.data.dateEnd).toLocaleDateString('ru-RU')}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Кнопка создания нового договора */}
            {selection?.party1 && selection?.party2 && !selection?.contract && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Button variant="outline" onClick={() => setShowCreateContractModal(true)}>
                  <AddIcon className="mr-2" />
                  Создать новый договор
                </Button>
              </Box>
            )}

            {/* Кнопка перехода к креативу */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                size="lg"
                onClick={handleProceedToCreative}
                disabled={!canProceed}
                className="px-8"
              >
                <CreativeIcon className="mr-2" />
                Перейти к креативу
              </Button>
            </Box>
          </Box>
        )}
      />

      {/* Модальное окно создания договора */}
      <CreateContractModal
        open={showCreateContractModal}
        onClose={() => setShowCreateContractModal(false)}
        onSave={handleCreateContract}
        advertiserName={selection?.party1?.name || ''}
        contractorName={selection?.party2?.name || ''}
      />
    </Paper>
  )
}
