import React from 'react'
import {
  Box,
  Typography,
  Button,
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
    [ActStatus.Draft]: { label: 'Черновик', color: 'default' as const, icon: <ScheduleIcon /> },
    [ActStatus.Sent]: { label: 'Отправлен', color: 'primary' as const, icon: <SendIcon /> },
    [ActStatus.Error]: { label: 'Ошибка', color: 'error' as const, icon: <ErrorIcon /> },
    [ActStatus.Approved]: { label: 'Утвержден', color: 'success' as const, icon: <CheckCircleIcon /> },
    [ActStatus.Rejected]: { label: 'Отклонен', color: 'warning' as const, icon: <ErrorIcon /> }
  }

  const config = statusConfig[status]
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
          Акты {selectedCompany ? `компании "${selectedCompany.name}"` : ''}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateAct}
          disabled={!selectedCompany}
        >
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
                      <TableCell>{new Date(act.date).toLocaleDateString('ru-RU')}</TableCell>
                      <TableCell>{act.amount.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>{getStatusChip(act.status)}</TableCell>
                      <TableCell>{act.contractNumber}</TableCell>
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
            У этой компании пока нет актов. Создайте первый акт.
          </Alert>
        )
      ) : (
        <Alert severity="info">
          Выберите компанию для просмотра актов.
        </Alert>
      )}
    </Paper>
  )
}
