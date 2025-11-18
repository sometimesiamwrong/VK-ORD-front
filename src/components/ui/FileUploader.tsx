import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import http from '../../api/http'
import { type UploadedFile } from '../../types'

interface FileUploaderProps {
  mediaFiles: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  maxFiles?: number
}

const getFileType = (fileName: string): 'image' | 'video' | 'audio' | 'document' => {
  const ext = fileName.toLowerCase().split('.').pop() || ''
  if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg'].includes(ext)) return 'image'
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'gif', 'mkv', 'm4v', 'mk4'].includes(ext)) return 'video'
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(ext)) return 'audio'
  return 'document'
}

const generateImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.readAsDataURL(file)
  })
}

const generateVideoPreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    video.onloadedmetadata = () => {
      video.currentTime = 0.1 // Seek to 0.1 second to get a frame
    }

    video.onseeked = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
      URL.revokeObjectURL(video.src)
    }

    video.onerror = () => {
      reject(new Error('Failed to load video'))
      URL.revokeObjectURL(video.src)
    }

    video.src = URL.createObjectURL(file)
  })
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const FilePreview: React.FC<{ file: UploadedFile }> = ({ file }) => {
  const fileType = getFileType(file.fileName)

  if (file.preview && (fileType === 'image' || fileType === 'video')) {
    return (
      <div className="relative h-20 w-20 flex-shrink-0">
        <img
          src={file.preview}
          alt={file.fileName}
          className="h-20 w-20 rounded-md border object-cover"
        />
        {fileType === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
            <span className="text-2xl">▶️</span>
          </div>
        )}
      </div>
    )
  }

  const getFileIcon = () => {
    switch (fileType) {
      case 'image': return '🖼️'
      case 'video': return '🎥'
      case 'audio': return '🎵'
      default: return '📄'
    }
  }

  return (
    <div className="h-20 w-20 flex-shrink-0 flex items-center justify-center">
      <span className="text-4xl">
        {getFileIcon()}
      </span>
    </div>
  )
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  mediaFiles = [],
  onChange,
  maxFiles = 10
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (mediaFiles.length >= maxFiles) {
      setError(`Максимальное количество файлов: ${maxFiles}`)
      return
    }

    if (acceptedFiles.length === 0) return

    // Limit files to not exceed maxFiles
    const filesToUpload = acceptedFiles.slice(0, maxFiles - mediaFiles.length)

    setUploading(true)
    setError(null)

    const uploadedFiles: UploadedFile[] = []

    try {
      // Upload files sequentially
      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await http.post<string>('/api/media/v1/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        const externalId = response.data
        const fileType = getFileType(file.name)

        let preview: string | undefined
        if (fileType === 'image') {
          try {
            preview = await generateImagePreview(file)
          } catch (error) {
            console.warn('Failed to generate image preview:', error)
          }
        } else if (fileType === 'video') {
          try {
            preview = await generateVideoPreview(file)
          } catch (error) {
            console.warn('Failed to generate video preview:', error)
          }
        }

        const newFile: UploadedFile = {
          externalId: externalId,
          fileName: file.name,
          url: '',
          preview: preview,
          fileSize: file.size
        }

        uploadedFiles.push(newFile)
      }

      onChange([...mediaFiles, ...uploadedFiles])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке файла')
    } finally {
      setUploading(false)
    }
  }, [mediaFiles, maxFiles, onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
    },
    disabled: mediaFiles.length >= maxFiles || uploading,
  })

  const handleRemoveFile = (externalId: string) => {
    onChange(mediaFiles.filter(f => f.externalId !== externalId))
  }

  const canUploadMore = mediaFiles.length < maxFiles

  return (
    <div className="grid gap-2">
      <Label>Файлы креатива ({mediaFiles.length}/{maxFiles})</Label>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-4 text-center ${
          isDragActive ? 'border-primary' : ''
        } ${(!canUploadMore || uploading) ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <Input {...getInputProps()} />
        {uploading ? (
          <>
            <p className="text-sm text-muted-foreground">⏳ Загрузка...</p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Перетащите файл сюда или нажмите, чтобы выбрать
            </p>
            <p className="text-xs text-muted-foreground">
              Максимальный размер файла: 10MB. Лимит: {maxFiles} файлов.
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {mediaFiles.length > 0 && (
        <div className="mt-2 grid gap-2">
          {mediaFiles.map((file) => (
            <div
              key={file.externalId}
              className="flex items-center justify-between rounded-md bg-secondary/10 p-2 overflow-hidden"
            >
              <div className="flex min-w-0 items-center gap-2 flex-1 overflow-hidden">
                <div className="flex-shrink-0">
                  <FilePreview file={file} />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium break-all">{file.fileName}</p>
                  {file.fileSize && (
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(file.externalId)}
                title="Удалить файл"
                className="h-auto w-auto p-1 text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}