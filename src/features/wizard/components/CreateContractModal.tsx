import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateContractModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { serial: string | null; payDateEnd: string | null }) => void
  advertiserName: string
  contractorName: string
}

export const CreateContractModal: React.FC<CreateContractModalProps> = ({
  open,
  onClose,
  onSave,
  advertiserName,
  contractorName
}) => {
  const [serial, setSerial] = useState('')
  const [payDateEnd, setPayDateEnd] = useState('')

  const handleSave = () => {
    onSave({
      serial: serial.trim() || null,
      payDateEnd: payDateEnd || null
    })
    
    // Очищаем поля после сохранения
    setSerial('')
    setPayDateEnd('')
  }

  const handleClose = () => {
    setSerial('')
    setPayDateEnd('')
    onClose()
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Создание нового договора</DialogTitle>
          <div className="text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-2 justify-center">
              <span className="font-medium">{advertiserName}</span>
              <span>↔</span>
              <span className="font-medium">{contractorName}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="serial">
              Номер договора
              <span className="text-muted-foreground ml-1">(необязательно)</span>
            </Label>
            <Input
              id="serial"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Например: Д-2024-001"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="payDateEnd">
              Дата окончания оплаты
              <span className="text-muted-foreground ml-1">(необязательно)</span>
            </Label>
            <Input
              id="payDateEnd"
              type="date"
              value={payDateEnd}
              onChange={(e) => setPayDateEnd(e.target.value)}
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            💡 <strong>Примечание:</strong> Договор будет создан с автоматически сгенерированным идентификатором.
            Вы сможете указать дополнительные параметры (сумму, детали) на следующем шаге.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Создать договор
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
