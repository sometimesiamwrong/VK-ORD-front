import React from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Paper,
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
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10))
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Акты {selectedCompany ? `контрагентов "${selectedCompany.name}"` : ''}
        </Typography>
        <Button
          onClick={onCreateAct}
          disabled={!selectedCompany}
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
        isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : acts.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Номер</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Статус</TableCell>
                    <TableCell>Договор</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {acts.map((act) => (
                    <TableRow
                      key={act.id}
                      hover
                      onClick={() => onActSelect(act)}
                      selected={selectedActId === act.id}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ReceiptIcon color="action" />
                          {act.number || '—'}
                        </Box>
                      </TableCell>
                      <TableCell>{act.date ? new Date(act.date).toLocaleDateString('ru-RU') : '—'}</TableCell>
                      <TableCell>{(act.amount ?? 0).toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>{getStatusChip(act.status)}</TableCell>
                      <TableCell>{act.contractNumber || '—'}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onActSelect(act) }}>
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalActs}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице:"
            />
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
