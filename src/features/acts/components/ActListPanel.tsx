import React from 'react'
import {
  Box,
  Typography,
  TablePagination,
  Alert,
  Chip,
  IconButton,
  Paper,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'
import { ActStatus } from '../../../types'
import type { ActSummary, CounterpartyItem } from '../../../types'
import { ResponsiveDataView, type Column } from '@/components/data-display/ResponsiveDataView'

interface ActListPanelProps {
  selectedCompany: CounterpartyItem | null
  acts: ActSummary[]
  totalActs: number
  isLoading: boolean
  error: Error | null
  page: number
  rowsPerPage: number
  selectedActId: string | null
  onActSelect: (act: ActSummary) => void
  onCreateAct: () => void
  onPageChange: (newPage: number) => void
  onRowsPerPageChange: (newRowsPerPage: number) => void
}

const getStatusChip = (status: ActStatus) => {
  const statusConfig = {
    'draft': { label: 'Черновик', color: 'default' as const, icon: <ScheduleIcon /> },
    'sent': { label: 'Отправлен', color: 'primary' as const, icon: <SendIcon /> },
    'error': { label: 'Ошибка', color: 'error' as const, icon: <ErrorIcon /> },
    'approved': { label: 'Утвержден', color: 'success' as const, icon: <CheckCircleIcon /> },
    'rejected': { label: 'Отклонен', color: 'warning' as const, icon: <ErrorIcon /> }
  }

  const config = statusConfig[status] || statusConfig['draft']
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size="small"
      variant="outlined"
    />
  )
}

export const ActListPanel: React.FC<ActListPanelProps> = ({
  selectedCompany,
  acts,
  totalActs,
  isLoading,
  error,
  page,
  rowsPerPage,
  selectedActId,
  onActSelect,
  onCreateAct,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10))
  }

  // Define columns for ResponsiveDataView
  const columns: Column<ActSummary>[] = [
    {
      key: 'number',
      header: 'Номер',
      mobileLabel: '№',
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon color="action" fontSize="small" />
          {value || '—'}
        </Box>
      ),
    },
    {
      key: 'date',
      header: 'Дата',
      render: (value) => value ? new Date(value as string).toLocaleDateString('ru-RU') : '—',
    },
    {
      key: 'amount',
      header: 'Сумма',
      render: (value) => `${(value as number ?? 0).toLocaleString('ru-RU')} ₽`,
    },
    {
      key: 'status',
      header: 'Статус',
      render: (value) => getStatusChip(value as ActStatus),
    },
    {
      key: 'contractNumber',
      header: 'Договор',
      hideOnMobile: true,
      render: (value) => value || '—',
    },
  ]

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 3
      }}>
        <Typography variant="h6">
          Акты {selectedCompany ? `контрагентов "${selectedCompany.name}"` : ''}
        </Typography>
        <Button
          onClick={onCreateAct}
          disabled={!selectedCompany}
          className="w-full sm:w-auto"
        >
          <AddIcon className="mr-2 h-4 w-4" />
          Создать акт
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка при загрузке актов: {error.message}
        </Alert>
      )}

      {selectedCompany ? (
        acts.length > 0 || isLoading ? (
          <>
            <ResponsiveDataView
              data={acts}
              columns={columns}
              keyExtractor={(act) => act.id}
              onRowClick={onActSelect}
              loading={isLoading}
              mobileRenderer={(act) => (
                <Card
                  onClick={() => onActSelect(act)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: 2,
                    },
                    '&:active': {
                      boxShadow: 1,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ReceiptIcon color="action" fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {act.number || '—'}
                        </Typography>
                      </Box>
                      {getStatusChip(act.status)}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Дата
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          {act.date ? new Date(act.date).toLocaleDateString('ru-RU') : '—'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          Сумма
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.875rem' }}>
                          {(act.amount ?? 0).toLocaleString('ru-RU')} ₽
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          onActSelect(act)
                        }}
                        sx={{
                          minWidth: 44,
                          minHeight: 44
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              )}
            />
            {!isLoading && (
              <TablePagination
                component="div"
                count={totalActs}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage={isMobile ? 'Строк:' : 'Строк на странице:'}
                sx={{ mt: 2 }}
              />
            )}
          </>
        ) : (
          <Alert severity="info">
            У этого контрагента пока нет актов. Создайте первый акт.
          </Alert>
        )
      ) : (
        <Alert severity="info">
          Выберите контрагента для просмотра актов.
        </Alert>
      )}
    </Paper>
  )
}
