import React, { useState } from 'react'
import {
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import http from '../../api/http'
import type {
  CreateCreativeRequest,
  CreativeDetails,
  CreativeStatus,
  VkOrdCreativeForm,
} from '../../types'
import { useCreativesList, useCreativeByErid } from './hooks'

export const CreativesPage: React.FC = () => {
  const [formData, setFormData] = useState<CreateCreativeRequest>({
    externalId: '',
    contractExternalIds: [],
    kktus: [],
    type: VkOrdCreativeForm.Banner,
    payType: 0, // VkOrdPayType.Cpm
    targetUrls: [],
    targetAudience: '',
    texts: [],
    name: '',
  })

  const [newContractId, setNewContractId] = useState('')
  const [newKktyCode, setNewKktyCode] = useState('')
  const [newContentUrl, setNewContentUrl] = useState('')

  const [viewFormData, setViewFormData] = useState({ externalId: '' })
  const [statusFormData, setStatusFormData] = useState({ externalId: '' })
  const [deleteFormData, setDeleteFormData] = useState({ externalId: '' })

  const [creativeDetails, setCreativeDetails] = useState<CreativeDetails | null>(null)
  const [creativeStatus, setCreativeStatus] = useState<CreativeStatus | null>(null)

  // Listing and ERID lookup state
  const [listOffset, setListOffset] = useState(0)
  const listLimit = 10
  const [eridQuery, setEridQuery] = useState('')

  const creativesQuery = useCreativesList(listOffset, listLimit)
  const creativeByErid = useCreativeByErid()

  // Create creative mutation
  const createCreativeMutation = useMutation({
    mutationFn: async (data: CreateCreativeRequest) => {
      const response = await http.post<CreativeDetails>('/api/creatives', data)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        toast.success('Креатив успешно создан')
        setCreativeDetails(data)
      }
    },
  })

  // View creative mutation
  const viewCreativeMutation = useMutation({
    mutationFn: async (externalId: string) => {
      const response = await http.get<CreativeDetails>(`/api/creatives/${externalId}`)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setCreativeDetails(data)
      }
    },
  })

  // Get creative status mutation
  const getStatusMutation = useMutation({
    mutationFn: async (externalId: string) => {
      const response = await http.get<CreativeStatus>(`/api/creatives/${externalId}/status`)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setCreativeStatus(data)
      }
    },
  })

  // Delete creative mutation
  const deleteCreativeMutation = useMutation({
    mutationFn: async (externalId: string) => {
      const response = await http.delete<null>(`/api/creatives/${externalId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Креатив успешно удален')
      setCreativeDetails(null)
    },
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCreativeMutation.mutate(formData)
  }

  const handleViewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (viewFormData.externalId) {
      viewCreativeMutation.mutate(viewFormData.externalId)
    }
  }

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (statusFormData.externalId) {
      getStatusMutation.mutate(statusFormData.externalId)
    }
  }

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (deleteFormData.externalId && window.confirm('Вы уверены, что хотите удалить этот креатив?')) {
      deleteCreativeMutation.mutate(deleteFormData.externalId)
    }
  }

  const totalItemsCount = creativesQuery.data?.totalItemsCount ?? 0
  const creatives = creativesQuery.data?.creatives ?? []
  const totalPages = Math.max(1, Math.ceil(totalItemsCount / listLimit))
  const currentPage = Math.floor(listOffset / listLimit) + 1

  const handlePrev = () => setListOffset((o) => Math.max(0, o - listLimit))
  const handleNext = () => setListOffset((o) => Math.min(Math.max(0, (totalPages - 1) * listLimit), o + listLimit))

  const handleFindByErid = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eridQuery.trim()) return
    creativeByErid.mutate(eridQuery.trim(), {
      onSuccess: (resp) => {
        if (resp) {
          setCreativeDetails(resp)
          toast.success('Креатив найден по ERID')
        } else {
          toast.error('Креатив не найден')
        }
      }
    })
  }

  const addContractId = () => {
    if (newContractId && !formData.contractExternalIds.includes(newContractId)) {
      setFormData(prev => ({
        ...prev,
        contractExternalIds: [...prev.contractExternalIds, newContractId]
      }))
      setNewContractId('')
    }
  }

  const removeContractId = (id: string) => {
    setFormData(prev => ({
      ...prev,
      contractExternalIds: prev.contractExternalIds.filter(cid => cid !== id)
    }))
  }

  const addKktyCode = () => {
    if (newKktyCode && !formData.kktus.includes(newKktyCode)) {
      setFormData(prev => ({
        ...prev,
        kktus: [...prev.kktus, newKktyCode]
      }))
      setNewKktyCode('')
    }
  }

  const removeKktyCode = (code: string) => {
    setFormData(prev => ({
      ...prev,
      kktus: prev.kktus.filter(c => c !== code)
    }))
  }

  const addContentUrl = () => {
    if (newContentUrl && !formData.targetUrls?.includes(newContentUrl)) {
      setFormData(prev => ({
        ...prev,
        targetUrls: [...(prev.targetUrls || []), newContentUrl]
      }))
      setNewContentUrl('')
    }
  }

  const removeContentUrl = (url: string) => {
    setFormData(prev => ({
      ...prev,
      targetUrls: prev.targetUrls?.filter(u => u !== url) || []
    }))
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'text') {
      // Handle text field specially - split by newlines
      setFormData(prev => ({
        ...prev,
        texts: e.target.value.split('\n').filter(t => t.trim())
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value
      }))
    }
  }

  const handleSelectChange = (field: string) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление креативами
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* Create Creative */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Создать креатив
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={handleCreateSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              <TextField
                fullWidth
                label="External ID"
                value={formData.externalId}
                onChange={handleChange('externalId')}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Формат</InputLabel>
                <Select
                  value={formData.type}
                  label="Формат"
                  onChange={handleSelectChange('type')}
                >
                  <MenuItem value="banner">Banner</MenuItem>
                  <MenuItem value="text_block">Text Block</MenuItem>
                  <MenuItem value="video">Video</MenuItem>
                  <MenuItem value="text_graphic_block">Text Graphic Block</MenuItem>
                </Select>
              </FormControl>

              {/* Contract IDs */}
              <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contract External IDs
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Добавить Contract ID"
                      value={newContractId}
                      onChange={(e) => setNewContractId(e.target.value)}
                    />
                    <IconButton onClick={addContractId} disabled={!newContractId}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.contractExternalIds.map((id) => (
                      <Chip
                        key={id}
                        label={id}
                        onDelete={() => removeContractId(id)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>

                {/* KKTY Codes */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    KKTY Codes
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Добавить KKTY код"
                      value={newKktyCode}
                      onChange={(e) => setNewKktyCode(e.target.value)}
                    />
                    <IconButton onClick={addKktyCode} disabled={!newKktyCode}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.kktus.map((code) => (
                      <Chip
                        key={code}
                        label={code}
                        onDelete={() => removeKktyCode(code)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>

                {/* Content URLs */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Content URLs
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Добавить URL контента"
                      value={newContentUrl}
                      onChange={(e) => setNewContentUrl(e.target.value)}
                    />
                    <IconButton onClick={addContentUrl} disabled={!newContentUrl}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <List dense>
                    {formData.targetUrls?.map((url, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={url} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => removeContentUrl(url)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Target Audience"
                    value={formData.targetAudience}
                    onChange={handleChange('targetAudience')}
                    multiline
                    rows={2}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Text"
                    value={formData.texts?.join('\n') || ''}
                    onChange={handleChange('text')}
                    multiline
                    rows={3}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.name}
                    onChange={handleChange('name')}
                  />
                </Box>
              </Box>

              {createCreativeMutation.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {createCreativeMutation.error?.message}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 3 }}
                disabled={createCreativeMutation.isPending}
              >
                {createCreativeMutation.isPending ? 'Создание...' : 'Создать креатив'}
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Actions Panel */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* List creatives */}
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Список креативов
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Показано {totalItemsCount > 0 ? `${listOffset + 1}–${Math.min(listOffset + listLimit, totalItemsCount)}` : 0} из {totalItemsCount}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={() => setListOffset(0)} disabled={currentPage <= 1}>«</Button>
                    <Button variant="outlined" onClick={handlePrev} disabled={currentPage <= 1}>Назад</Button>
                    <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>Стр. {currentPage}/{totalPages}</Typography>
                    <Button variant="outlined" onClick={handleNext} disabled={currentPage >= totalPages}>Вперед</Button>
                    <Button variant="outlined" onClick={() => setListOffset((totalPages - 1) * listLimit)} disabled={currentPage >= totalPages}>»</Button>
                  </Box>
                </Box>
                <List dense>
                  {creativesQuery.isLoading && (
                    <ListItem><ListItemText primary="Загрузка..." /></ListItem>
                  )}
                  {!creativesQuery.isLoading && creatives.length === 0 && (
                    <ListItem><ListItemText primary="Нет креативов" /></ListItem>
                  )}
                  {creatives.map((c: CreativeDetails) => (
                    <ListItem key={c.externalId} secondaryAction={
                      <Button size="small" variant="text" onClick={() => viewCreativeMutation.mutate(c.externalId)}>Открыть</Button>
                    }>
                      <ListItemText
                        primary={c.name || c.externalId}
                        secondary={`External ID: ${c.externalId}${c.erid ? ` • ERID: ${c.erid}` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>

            {/* View Creative */}
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Просмотр креатива
                </Typography>
                <Box component="form" onSubmit={handleViewSubmit} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="External ID"
                    value={viewFormData.externalId}
                    onChange={(e) => setViewFormData({ externalId: e.target.value })}
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    startIcon={<SearchIcon />}
                    disabled={viewCreativeMutation.isPending}
                  >
                    Найти
                  </Button>
                </Box>
              </Paper>
            </Box>

            {/* Get Status */}
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Статус креатива
                </Typography>
                <Box component="form" onSubmit={handleStatusSubmit} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="External ID"
                    value={statusFormData.externalId}
                    onChange={(e) => setStatusFormData({ externalId: e.target.value })}
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    startIcon={<InfoIcon />}
                    disabled={getStatusMutation.isPending}
                  >
                    Статус
                  </Button>
                </Box>
              </Paper>
            </Box>

            {/* Find by ERID */}
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Найти по ERID
                </Typography>
                <Box component="form" onSubmit={handleFindByErid} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ERID"
                    value={eridQuery}
                    onChange={(e) => setEridQuery(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="outlined"
                    startIcon={<SearchIcon />}
                    disabled={creativeByErid.isPending}
                  >
                    Найти
                  </Button>
                </Box>
              </Paper>
            </Box>

            {/* Delete Creative */}
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Удалить креатив
                </Typography>
                <Box component="form" onSubmit={handleDeleteSubmit} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="External ID"
                    value={deleteFormData.externalId}
                    onChange={(e) => setDeleteFormData({ externalId: e.target.value })}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    disabled={deleteCreativeMutation.isPending}
                  >
                    Удалить
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Results */}
        {(creativeDetails || creativeStatus) && (
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Результат
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {creativeDetails && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Детали креатива: {creativeDetails.externalId}
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Формат</Typography>
                        <Typography>{creativeDetails.format}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">ERID</Typography>
                        <Typography>{creativeDetails.erid || 'Не присвоен'}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Contract IDs</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {creativeDetails.contractExternalIds.map((id) => (
                            <Chip key={id} label={id} size="small" />
                          ))}
                        </Box>
                      </Box>
                      {creativeDetails.contentUrls && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Content URLs</Typography>
                          <List dense>
                            {creativeDetails.contentUrls.map((url, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={url} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {creativeStatus && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Статус креатива: {creativeStatus.externalId}
                    </Typography>
                    <Chip
                      label={creativeStatus.status}
                      color={creativeStatus.status === 'success' ? 'success' : 'warning'}
                      sx={{ mb: 2 }}
                    />
                    {creativeStatus.erid && (
                      <Typography>ERID: {creativeStatus.erid}</Typography>
                    )}
                    {creativeStatus.message && (
                      <Typography variant="body2" color="text.secondary">
                        {creativeStatus.message}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  )
}
