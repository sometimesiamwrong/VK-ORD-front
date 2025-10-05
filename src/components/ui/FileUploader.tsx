import React, { useState } from 'react'
import http from '../../api/http'

interface FileUploaderProps {
  mediaExternalIds: string[]
  onChange: (ids: string[]) => void
  maxFiles?: number
}

interface UploadedFile {
  externalId: string
  fileName: string
  url: string
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  mediaExternalIds,
  onChange,
  maxFiles = 10
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const currentCount = mediaExternalIds.length
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

      const response = await http.post<{ externalId: string; url: string }>('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data) {
        const newFile: UploadedFile = {
          externalId: response.data.externalId,
          fileName: file.name,
          url: response.data.url
        }

        setUploadedFiles(prev => [...prev, newFile])
        onChange([...mediaExternalIds, response.data.externalId])
      } else {
        setError('Ошибка загрузки файла')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла')
    } finally {
      setUploading(false)
      // Reset input
      event.target.value = ''
    }
  }

  const handleRemoveFile = (externalId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.externalId !== externalId))
    onChange(mediaExternalIds.filter(id => id !== externalId))
  }

  const canUploadMore = mediaExternalIds.length < maxFiles

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label>
        Файлы креатива ({mediaExternalIds.length}/{maxFiles})
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

      {uploadedFiles.length > 0 && (
        <div className="vk-card" style={{ padding: 8 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            {uploadedFiles.map((file) => (
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
                  <span>📄</span>
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

