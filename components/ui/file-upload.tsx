'use client'

import { useState, useRef, useCallback } from 'react'

export interface UploadedFile {
  file: File
  preview?: string // data URL for image preview
}

const MAX_FILES = 5
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageType(type: string): boolean {
  return type.startsWith('image/')
}

export function FileUpload({
  files,
  onChange,
}: {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null)
      const incoming = Array.from(newFiles)
      const remaining = MAX_FILES - files.length

      if (remaining <= 0) {
        setError(`Maximum ${MAX_FILES} files per note`)
        return
      }

      const valid: UploadedFile[] = []

      for (const file of incoming.slice(0, remaining)) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(`${file.name}: file type not supported`)
          continue
        }
        if (file.size > MAX_SIZE) {
          setError(`${file.name}: exceeds 10MB limit`)
          continue
        }

        const entry: UploadedFile = { file }
        if (isImageType(file.type)) {
          entry.preview = URL.createObjectURL(file)
        }
        valid.push(entry)
      }

      if (valid.length > 0) {
        onChange([...files, ...valid])
      }
    },
    [files, onChange]
  )

  const removeFile = useCallback(
    (index: number) => {
      const removed = files[index]
      if (removed.preview) URL.revokeObjectURL(removed.preview)
      onChange(files.filter((_, i) => i !== index))
    },
    [files, onChange]
  )

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-lg border-2 border-dashed px-4 py-3 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-neon-purple bg-neon-purple/5'
            : 'border-dark-600 hover:border-dark-500'
        }`}
      >
        <p className="text-xs text-gray-500">
          Drop files here or <span className="text-neon-purple">browse</span>
          <span className="block mt-0.5">Max 5 files, 10MB each</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-400">{error}</p>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-dark-600 bg-dark-700 px-3 py-1.5"
            >
              {f.preview ? (
                <img src={f.preview} alt="" className="h-6 w-6 rounded object-cover" />
              ) : (
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              )}
              <span className="text-xs text-gray-300 max-w-[120px] truncate">{f.file.name}</span>
              <span className="text-xs text-gray-500">{formatFileSize(f.file.size)}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                className="text-gray-500 hover:text-red-400 transition-colors"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
