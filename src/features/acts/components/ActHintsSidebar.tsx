import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  FileCopy as FileCopyIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import type { ActDetails } from '../../../types'

interface ActHintsSidebarProps {
  act: ActDetails | null
  onCreateRelatedAct: () => void
  onCopyClientDetails: () => void
}

export const ActHintsSidebar: React.FC<ActHintsSidebarProps> = ({
  act,
  onCreateRelatedAct,
  onCopyClientDetails,
}) => {
  // Mock checklist items
  const checklistItems = [
    { id: 'amounts-filled', label: 'Заполнены суммы', checked: !!act?.totalAmount },
    { id: 'dates-checked', label: 'Проверены даты', checked: !!(act?.periodStart && act?.periodEnd) },
    { id: 'documents-attached', label: 'Приложены документы', checked: false },
    { id: 'contract-valid', label: 'Договор действующий', checked: true },
    { id: 'statistics-loaded', label: 'Загружены статистики', checked: act?.statistics && act.statistics.length > 0 },
  ]

  // Mock timeline items
  const timelineItems = [
    {
      id: '1',
      date: '2024-10-08 14:30',
      action: 'Акт создан',
      user: 'Иванов И.И.',
      icon: <ScheduleIcon />,
      color: 'primary' as const,
    },
    {
      id: '2',
      date: '2024-10-08 15:45',
      action: 'Заполнены основные данные',
      user: 'Иванов И.И.',
      icon: <CheckCircleIcon />,
      color: 'success' as const,
    },
    {
      id: '3',
      date: '2024-10-08 16:20',
      action: 'Добавлено распределение',
      user: 'Иванов И.И.',
      icon: <CheckCircleIcon />,
      color: 'success' as const,
    },
  ]

  const vkRequirements = [
    'НДС должен быть указан в рублях',
    'Период оказания услуг не может превышать 1 месяц',
    'Сумма акта должна соответствовать распределению по договорам',
    'Все креативы должны быть зарегистрированы в VK ORD',
    'Даты должны быть в формате YYYY-MM-DD',
  ]

  return (
    <Box sx={{ width: 300, flexShrink: 0 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Проверочный лист
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {checklistItems.map((item) => (
            <FormControlLabel
              key={item.id}
              control={
                <Checkbox
                  checked={item.checked}
                  disabled
                  size="small"
                />
              }
              label={
                <Typography variant="body2" color={item.checked ? 'text.primary' : 'text.secondary'}>
                  {item.label}
                </Typography>
              }
            />
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          История изменений
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {timelineItems.map((item) => (
            <Box key={item.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box sx={{ color: `${item.color}.main`, mt: 0.5 }}>
                {item.icon}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  {item.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.date} • {item.user}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Требования VK ORD</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {vkRequirements.map((requirement, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <ErrorIcon color="warning" sx={{ fontSize: 16, mt: 0.3 }} />
                <Typography variant="body2">{requirement}</Typography>
              </Box>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Быстрые действия
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onCreateRelatedAct}
            >
              <AddIcon className="mr-2 h-4 w-4" />
              Создать связанный акт
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onCopyClientDetails}
            >
              <FileCopyIcon className="mr-2 h-4 w-4" />
              Копировать реквизиты клиента
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
