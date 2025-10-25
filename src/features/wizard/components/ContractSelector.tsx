import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ContractDto } from '@/types'

interface ContractSelectorProps {
  open: boolean
  onClose: () => void
  onSelect: (contract: ContractDto) => void
  contracts: ContractDto[]
  loading?: boolean
  advertiserName?: string
  contractorName?: string
}

export const ContractSelector: React.FC<ContractSelectorProps> = ({
  open,
  onClose,
  onSelect,
  contracts,
  loading = false,
  advertiserName,
  contractorName
}) => {
  const handleSelect = (contract: ContractDto) => {
    onSelect(contract)
    onClose()
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Выбор договора</DialogTitle>
          {advertiserName && contractorName && (
            <div className="text-sm text-muted-foreground mt-2">
              <div className="flex items-center gap-2 justify-center">
                <span className="font-medium">{advertiserName}</span>
                <span>↔</span>
                <span className="font-medium">{contractorName}</span>
              </div>
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Загрузка договоров...</div>
            </div>
          ) : contracts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">
                Договоры между контрагентами не найдены
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {contracts.map((contract) => {
                const serial = contract.data?.serial || contract.externalId || 'Без номера'
                const date = contract.data?.createDate || contract.data?.date || ''
                const formattedDate = date 
                  ? new Date(date).toLocaleDateString('ru-RU', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })
                  : ''
                const amount = contract.amount || contract.data?.amount
                
                return (
                  <button
                    key={contract.externalId || contract.id}
                    onClick={() => handleSelect(contract)}
                    className="w-full p-4 text-left border rounded-lg hover:bg-accent hover:border-primary transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base truncate">
                          {serial}
                        </div>
                        {formattedDate && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Дата: {formattedDate}
                          </div>
                        )}
                        {contract.data?.dateEnd && (
                          <div className="text-sm text-muted-foreground">
                            Действует до: {new Date(contract.data.dateEnd).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                      </div>
                      {amount && (
                        <div className="text-right">
                          <div className="font-semibold text-primary">
                            {Number(amount).toLocaleString('ru-RU')} ₽
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
