import React, { useState } from 'react'
import {
  Typography,
  Paper,
  Box,
  TextField,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import { Button } from '@/components/ui/button'
import {
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import http from '../../api/http'
import type { MediaUploadResponse, MediaDetails } from '../../types'

export const MediaPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [viewFormData, setViewFormData] = useState({ externalId: '' })
  const [deleteFormData, setDeleteFormData] = useState({ externalId: '' })
  const [mediaDetails, setMediaDetails] = useState<MediaDetails | null>(null)

  // Upload media mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await http.post<MediaUploadResponse>('/api/media/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        toast.success('Файл успешно загружен')
        setMediaDetails({
          externalId: data.externalId,
          url: data.url,
          uploadedAt: new Date().toISOString(),
        })
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }
    },
  })

  // View media mutation
  const viewMutation = useMutation({
    mutationFn: async (externalId: string) => {
      const response = await http.get<MediaDetails>(`/api/media/v1/${externalId}`)
      return response.data
    },
    onSuccess: (data) => {
      if (data) {
        setMediaDetails(data)
      }
    },
  })

  // Delete media mutation
  const deleteMutation = useMutation({
    mutationFn: async (externalId: string) => {
      const response = await http.delete<null>(`/api/media/v1/${externalId}`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Медиафайл успешно удален')
      setMediaDetails(null)
    },
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile)
    }
  }

  const handleViewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (viewFormData.externalId) {
      viewMutation.mutate(viewFormData.externalId)
    }
  }

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (deleteFormData.externalId && window.confirm('Вы уверены, что хотите удалить этот медиафайл?')) {
      deleteMutation.mutate(deleteFormData.externalId)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Управление медиафайлами
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Upload Media */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Загрузка медиафайла
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <input
                accept="image/*,video/*,audio/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outline"
                  className="w-full mb-2"
                >
                  <CloudUploadIcon className="mr-2 h-4 w-4" />
                  Выбрать файл
                </Button>
              </label>

              {selectedFile && (
                <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Выбран файл: {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Размер: {formatFileSize(selectedFile.size)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Тип: {selectedFile.type}
                  </Typography>
                </Box>
              )}
            </Box>

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Загрузка...' : 'Загрузить файл'}
            </Button>

            {uploadMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadMutation.error?.message}
              </Alert>
            )}
          </Paper>
        </Box>

        {/* Media Actions */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* View Media */}
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Просмотр медиафайла
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
                    variant="outline"
                    disabled={viewMutation.isPending}
                  >
                    <SearchIcon className="mr-2 h-4 w-4" />
                    Найти
                  </Button>
                </Box>
              </Paper>
            </Box>

            {/* Delete Media */}
            <Box>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Удалить медиафайл
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
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                  >
                    <DeleteIcon className="mr-2 h-4 w-4" />
                    Удалить
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Media Details */}
        {mediaDetails && (
          <Box sx={{ width: '100%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Детали медиафайла
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Card>
                <CardContent>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        External ID
                      </Typography>
                      <Typography variant="body1">
                        {mediaDetails.externalId}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        URL
                      </Typography>
                      <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                        {mediaDetails.url}
                      </Typography>
                    </Box>
                    {mediaDetails.fileName && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Имя файла
                        </Typography>
                        <Typography variant="body1">
                          {mediaDetails.fileName}
                        </Typography>
                      </Box>
                    )}
                    {mediaDetails.fileSize && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Размер файла
                        </Typography>
                        <Typography variant="body1">
                          {formatFileSize(mediaDetails.fileSize)}
                        </Typography>
                      </Box>
                    )}
                    {mediaDetails.mimeType && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          MIME тип
                        </Typography>
                        <Typography variant="body1">
                          {mediaDetails.mimeType}
                        </Typography>
                      </Box>
                    )}
                    {mediaDetails.uploadedAt && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Дата загрузки
                        </Typography>
                        <Typography variant="body1">
                          {new Date(mediaDetails.uploadedAt).toLocaleString('ru-RU')}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Preview for images */}
                  {mediaDetails.mimeType?.startsWith('image/') && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Предварительный просмотр:
                      </Typography>
                      <img
                        src={mediaDetails.url}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '300px',
                          borderRadius: '4px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </Box>
                  )}

                  {/* Link to file */}
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button
                      variant="outline"
                      asChild
                    >
                      <a href={mediaDetails.url} target="_blank" rel="noopener noreferrer">Открыть файл</a>
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  )
}
