'use client'

import { useState, useRef } from 'react'
import { MarkdownRenderer } from './markdown-renderer'
import { FileUpload, type UploadedFile } from './file-upload'

export function NoteComposer({
  action,
  projectId,
  revisionId,
  placeholder = 'Write a note...',
}: {
  action: (formData: FormData) => Promise<void>
  projectId: string
  revisionId?: string
  placeholder?: string
}) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.slice(start, end)
    const newContent = content.slice(0, start) + before + selected + after + content.slice(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return
    setSubmitting(true)

    const formData = new FormData()
    formData.set('content', content)
    formData.set('project_id', projectId)
    if (revisionId) formData.set('revision_id', revisionId)
    files.forEach((f) => formData.append('files', f.file))

    try {
      await action(formData)
      setContent('')
      setFiles([])
      setShowPreview(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-4">
      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-2">
        <button type="button" onClick={() => insertMarkdown('**', '**')} className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors font-bold" title="Bold">B</button>
        <button type="button" onClick={() => insertMarkdown('*', '*')} className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors italic" title="Italic">I</button>
        <button type="button" onClick={() => insertMarkdown('\n- ')} className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors" title="List">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        </button>
        <button type="button" onClick={() => insertMarkdown('[', '](url)')} className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors" title="Link">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.813a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.188" /></svg>
        </button>
        <button type="button" onClick={() => insertMarkdown('`', '`')} className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors font-mono" title="Code">{'</>'}</button>
        <div className="flex-1" />
        <button type="button" onClick={() => setShowPreview(!showPreview)} className={`rounded px-2.5 py-1 text-xs transition-colors ${showPreview ? 'bg-neon-purple/20 text-neon-purple' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}>
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Content area */}
      {showPreview ? (
        <div className="min-h-[80px] rounded-lg border border-dark-600 bg-dark-700 p-3">
          {content.trim() ? <MarkdownRenderer content={content} /> : <p className="text-sm text-gray-500">Nothing to preview</p>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple resize-y"
          placeholder={placeholder}
        />
      )}

      {/* File upload */}
      <div className="mt-3">
        <FileUpload files={files} onChange={setFiles} />
      </div>

      {/* Submit */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || (!content.trim() && files.length === 0)}
          className="rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Sending...' : 'Send Note'}
        </button>
      </div>
    </div>
  )
}
