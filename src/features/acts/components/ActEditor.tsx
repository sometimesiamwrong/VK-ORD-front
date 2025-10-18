import React, { useState } from 'react'
import {
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import {
  Save as SaveIcon,
  Send as SendIcon,
  FileDownload as FileDownloadIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { ActStatus } from '../../../types'
import type { ActDetails, ContractDto, CreativeDto } from '../../../types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`act-tabpanel-${index}`}
      aria-labelledby={`act-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `act-tab-${index}`,
    'aria-controls': `act-tabpanel-${index}`,
  }
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

interface ActEditorProps {
  act: ActDetails | null
  isLoading: boolean
  isCreatingNew?: boolean
  contracts?: ContractDto[]
  creatives?: CreativeDto[]
  onSave: () => void
  onSubmit: () => void
  onExport: () => void
  onDelete: () => void
  onCancel?: () => void
  onContractSelect?: (contractId: string) => void
}

export const ActEditor: React.FC<ActEditorProps> = ({
  act,
  isLoading,
  isCreatingNew = false,
  contracts = [],
  creatives = [], // TODO: использовать для выбора креативов в разделе распределения
  onSave,
  onSubmit,
  onExport,
  onDelete,
  onCancel,
  onContractSelect,
}) => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  if (isLoading) {
    return (
      <Paper sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    )
  }

  if (!act && !isCreatingNew) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">
          Не удалось загрузить данные акта
        </Alert>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="act editor tabs">
          <Tab label="Основные данные" {...a11yProps(0)} />
          <Tab label="Распределение" {...a11yProps(1)} />
          <Tab label="Статистика" {...a11yProps(2)} />
        </Tabs>
      </Box>

      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h6">
            {isCreatingNew ? 'Создание нового акта' : `Акт ${act?.number || 'без номера'}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isCreatingNew ? 'Черновик не сохранён' : `Компания: ${act?.companyName} • Статус: ${act ? getStatusChip(act.status) : ''}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isCreatingNew ? (
            <>
              <Button variant="outline" onClick={onCancel}>
                <CancelIcon className="mr-2 h-4 w-4" />
                Отмена
              </Button>
              <Button onClick={onSave}>
                <SaveIcon className="mr-2 h-4 w-4" />
                Сохранить черновик
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onSave}>
                <SaveIcon className="mr-2 h-4 w-4" />
                Сохранить черновик
              </Button>
              <Button onClick={onSubmit}>
                <SendIcon className="mr-2 h-4 w-4" />
                Отправить в VK ORD
              </Button>
              <Button variant="outline" onClick={onExport}>
                <FileDownloadIcon className="mr-2 h-4 w-4" />
                Экспорт PDF
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                <DeleteIcon className="mr-2 h-4 w-4" />
                Удалить
              </Button>
            </>
          )}
        </Box>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Typography variant="h6" gutterBottom>Основные данные акта</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          <TextField
            fullWidth
            label="Номер акта"
            value={act?.number || ''}
            helperText="Можно оставить пустым, если номер будет присвоен автоматически"
          />
          <Autocomplete
            options={contracts}
            getOptionLabel={(option) => `${option.externalId || 'Без номера'} - ${option.amount || '0'} ₽`}
            value={act?.contractId ? contracts.find(c => c.externalId === act.contractId) || null : null}
            onChange={(_, newValue) => {
              if (newValue && onContractSelect) {
                onContractSelect(newValue.externalId || '')
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Договор"
                placeholder="Выберите договор"
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1">
                    {option.externalId || 'Без номера'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Сумма: {option.amount || '0'} ₽ • Статус: {option.syncStatus}
                  </Typography>
                </Box>
              </li>
            )}
            sx={{ width: '100%' }}
          />
          <TextField
            fullWidth
            label="Сумма, ₽"
            type="number"
            value={act?.totalAmount || ''}
          />
          <TextField
            fullWidth
            label="Ставка НДС, %"
            type="number"
            value={act?.vatRate || ''}
          />
          <TextField
            fullWidth
            label="Сумма НДС, ₽"
            type="number"
            value={act?.vatAmount || ''}
            InputProps={{ readOnly: true }}
          />
          <TextField
            fullWidth
            label="Дата начала периода"
            type="date"
            value={act?.periodStart ? new Date(act.periodStart).toISOString().split('T')[0] : ''}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Дата окончания периода"
            type="date"
            value={act?.periodEnd ? new Date(act.periodEnd).toISOString().split('T')[0] : ''}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Дата выставления"
            type="date"
            value={act?.issueDate ? new Date(act.issueDate).toISOString().split('T')[0] : ''}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Дата оплаты"
            type="date"
            value={act?.paymentDate ? new Date(act.paymentDate).toISOString().split('T')[0] : ''}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" gutterBottom>Распределение по договорам</Typography>
        {(act?.distributions || []).map((dist, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Договор: {dist.contractNumber}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="Сумма"
                  type="number"
                  value={dist.amount}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Ставка НДС, %"
                  type="number"
                  value={dist.vatRate}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Сумма НДС"
                  type="number"
                  value={dist.vatAmount}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Креативы: {dist.creativeIds.length} шт.
              </Typography>
            </CardContent>
          </Card>
        ))}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" gutterBottom>Статистика и метрики</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Метрика</TableCell>
                <TableCell>Значение</TableCell>
                <TableCell>Единица</TableCell>
                <TableCell>Платформа</TableCell>
                <TableCell>Период</TableCell>
                <TableCell>Валидировано</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(act?.statistics || []).map((stat, index) => (
                <TableRow key={index}>
                  <TableCell>{stat.metric}</TableCell>
                  <TableCell>{stat.value.toLocaleString()}</TableCell>
                  <TableCell>{stat.unit}</TableCell>
                  <TableCell>{stat.platform}</TableCell>
                  <TableCell>{stat.period}</TableCell>
                  <TableCell>
                    {stat.isValidated ? (
                      <CheckCircleIcon color="success" />
                    ) : stat.isManual ? (
                      <Chip label="Вручную" size="small" color="warning" />
                    ) : (
                      <Chip label="Не проверено" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Paper>
  )
}
