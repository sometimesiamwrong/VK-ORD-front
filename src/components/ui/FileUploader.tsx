import React, { useState } from 'react'
import http from '../../api/http'
import { type UploadedFile } from '../../types'

interface FileUploaderProps {
  mediaFiles: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  maxFiles?: number
}

// Helper function to determine file type
const getFileType = (fileName: string): 'image' | 'video' | 'audio' | 'document' => {
  const ext = fileName.toLowerCase().split('.').pop() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext)) return 'audio'
  return 'document'
}

// Helper function to generate preview for images
const generateImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}


// Component for file preview
const FilePreview: React.FC<{ file: UploadedFile }> = ({ file }) => {
  const fileType = getFileType(file.fileName)

  if (file.preview && (fileType === 'image' || fileType === 'video')) {
    return (
      <img
        src={file.preview}
        alt={file.fileName}
        style={{
          width: 32,
          height: 32,
          objectFit: 'cover',
          borderRadius: 4,
          border: '1px solid var(--vk-border, #ddd)'
        }}
      />
    )
  }

  // Default icons for different file types
  const getFileIcon = () => {
    switch (fileType) {
      case 'image': return '🖼️'
      case 'video': return '🎥'
      case 'audio': return '🎵'
      default: return '📄'
    }
  }

  return (
    <span style={{ fontSize: '1.2em' }}>
      {getFileIcon()}
    </span>
  )
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  mediaFiles,
  onChange,
  maxFiles = 10
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (!files || files.length === 0) {
      return
    }

    const currentCount = mediaFiles.length
    if (currentCount >= maxFiles) {
      setError(`Максимальное количество файлов: ${maxFiles}`)
      return
    }

    const file = files[0]
    const remainingSlots = maxFiles - currentCount

    if (files.length > remainingSlots) {
      setError(`Можно загрузить еще ${remainingSlots} файл(ов)`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await http.post<string>('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const externalId = response.data
      const fileType = getFileType(file.name)

      // Generate preview for images and videos
      let preview: string | undefined
      if (fileType === 'image') {
        try {
          preview = await generateImagePreview(file)
        } catch (error) {
          console.warn('Failed to generate image preview:', error)
        }
      }

      const newFile: UploadedFile = {
        externalId: externalId,
        fileName: file.name,
        url: '',
        preview: preview
      }

      onChange([...mediaFiles, newFile])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при выборе файла')
    } finally {
      setUploading(false)
      // Reset input
      event.target.value = ''
    }
  }

  const handleRemoveFile = (externalId: string) => {
    onChange(mediaFiles.filter(f => f.externalId !== externalId))
  }

  const canUploadMore = mediaFiles.length < maxFiles

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label>
        Файлы креатива ({mediaFiles.length}/{maxFiles})
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
          <input
            type="file"
            id="file-upload-creative"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            disabled={!canUploadMore || uploading}
            accept="image/*,video/*,audio/*,.pdf"
          />
          <label htmlFor="file-upload-creative">
            <button
              type="button"
              className="vk-btn"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('file-upload-creative')?.click()
              }}
              disabled={!canUploadMore || uploading}
              style={{
                cursor: (!canUploadMore || uploading) ? 'not-allowed' : 'pointer',
                opacity: (!canUploadMore || uploading) ? 0.6 : 1
              }}
            >
              {uploading ? '⏳ Загрузка...' : '📎 Выбрать файл'}
            </button>
          </label>
          {!canUploadMore && (
            <span style={{ color: 'var(--vk-muted)', fontSize: '0.9em' }}>
              Достигнут лимит файлов
            </span>
          )}
        </div>
      </label>

      {error && (
        <div
          className="vk-card"
          style={{
            backgroundColor: 'var(--vk-error-bg, #fee)',
            color: 'var(--vk-error, #c00)',
            padding: '8px 12px',
            borderRadius: 4
          }}
        >
          {error}
        </div>
      )}

      {mediaFiles.length > 0 && (
        <div className="vk-card" style={{ padding: 8 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            {mediaFiles.map((file) => (
              <div
                key={file.externalId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  backgroundColor: 'var(--vk-bg-secondary, #f5f5f5)',
                  borderRadius: 4,
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <FilePreview file={file} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.9em',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      {file.fileName}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75em',
                        color: 'var(--vk-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      ID: {file.externalId}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="vk-btn"
                  onClick={() => handleRemoveFile(file.externalId)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.85em',
                    backgroundColor: 'var(--vk-error-bg, #fee)',
                    color: 'var(--vk-error, #c00)'
                  }}
                  title="Удалить файл"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

