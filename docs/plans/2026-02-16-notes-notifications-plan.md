# Notes, Notifications & Premium Revision System — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the one-way revision system with threaded conversations (notes) on both revisions and projects, add file attachments, priority levels, read receipts, and a unified notification system with email alerts.

**Architecture:** Unified `notes` table powers both revision-thread and project-level conversations. A `notifications` table replaces `admin_alerts` and extends to both admin and client portals. File attachments stored in Supabase Storage. Email notifications via Supabase Edge Function. All new UI components follow existing dark theme + neon-purple accent patterns.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (PostgreSQL + Storage + Edge Functions), Tailwind CSS, react-markdown + remark-gfm for rich text.

**Design doc:** `docs/plans/2026-02-16-notes-notifications-design.md`

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install react-markdown and remark-gfm**

```bash
npm install react-markdown remark-gfm
```

**Step 2: Verify installation**

```bash
npm ls react-markdown remark-gfm
```

Expected: Both packages listed without errors.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add react-markdown and remark-gfm dependencies"
```

---

## Task 2: Database Migration — New Tables & Schema Changes

Apply all schema changes via Supabase MCP `apply_migration`. This is one atomic migration.

**Step 1: Apply the migration**

Use `mcp__plugin_supabase_supabase__apply_migration` with project_id `mkqlbnxavpckqpnmryis`:

```sql
-- Add priority column to revisions
ALTER TABLE revisions
  ADD COLUMN priority text NOT NULL DEFAULT 'normal'
  CHECK (priority IN ('urgent', 'normal', 'low'));

-- Notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id),
  revision_id uuid REFERENCES revisions(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES profiles(id),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notes_project_id ON notes(project_id);
CREATE INDEX idx_notes_revision_id ON notes(revision_id);
CREATE INDEX idx_notes_author_id ON notes(author_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);

-- Note attachments table
CREATE TABLE note_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_note_attachments_note_id ON note_attachments(note_id);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id),
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  link text NOT NULL,
  project_id uuid REFERENCES projects(id),
  revision_id uuid REFERENCES revisions(id) ON DELETE SET NULL,
  note_id uuid REFERENCES notes(id) ON DELETE SET NULL,
  is_read boolean NOT NULL DEFAULT false,
  email_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Note read receipts table
CREATE TABLE note_read_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(note_id, user_id)
);

CREATE INDEX idx_note_read_receipts_note_id ON note_read_receipts(note_id);

-- Enable RLS on all new tables
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notes
-- Admins can see all notes; clients can see notes on their own projects
CREATE POLICY "Admins can view all notes"
  ON notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Clients can view notes on their projects"
  ON notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = notes.project_id
      AND projects.client_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can insert notes on their projects"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      OR EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_id
        AND projects.client_id = auth.uid()
      )
    )
  );

-- RLS Policies for note_attachments
CREATE POLICY "Users can view attachments on visible notes"
  ON note_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_attachments.note_id
      AND (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        OR EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = notes.project_id
          AND projects.client_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Note authors can insert attachments"
  ON note_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_attachments.note_id
      AND notes.author_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Admins and server actions need insert (use service role for inserts in server actions)
-- But also allow authenticated insert for the notification creator pattern
CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for note_read_receipts
CREATE POLICY "Users can view read receipts on visible notes"
  ON note_read_receipts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_read_receipts.note_id
      AND (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
        OR EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = notes.project_id
          AND projects.client_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert their own read receipts"
  ON note_read_receipts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

Migration name: `add_notes_notifications_system`

**Step 2: Verify tables exist**

Use `mcp__plugin_supabase_supabase__list_tables` with schemas `["public"]` and confirm `notes`, `note_attachments`, `notifications`, `note_read_receipts` are all present with correct columns.

**Step 3: Verify revisions has priority column**

Use `mcp__plugin_supabase_supabase__execute_sql`:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'revisions' AND column_name = 'priority';
```

Expected: One row with `priority`, `text`, `'normal'::text`.

**Step 4: Run security advisors**

Use `mcp__plugin_supabase_supabase__get_advisors` with type `security` to check for any RLS issues on the new tables.

**Step 5: Commit (no code files changed, migration is in Supabase)**

No git commit needed — migrations are tracked in Supabase.

---

## Task 3: Supabase Storage Bucket

**Step 1: Create the note-attachments bucket**

Use `mcp__plugin_supabase_supabase__execute_sql`:
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'note-attachments',
  'note-attachments',
  false,
  10485760,
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip'
  ]
);
```

**Step 2: Add storage RLS policies**

Use `mcp__plugin_supabase_supabase__execute_sql`:
```sql
-- Allow authenticated users to upload to note-attachments
CREATE POLICY "Authenticated users can upload note attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'note-attachments');

-- Allow users to read attachments (access control handled at note_attachments table level)
CREATE POLICY "Authenticated users can read note attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'note-attachments');
```

**Step 3: Verify bucket exists**

Use `mcp__plugin_supabase_supabase__execute_sql`:
```sql
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'note-attachments';
```

Expected: One row with `public = false`, `file_size_limit = 10485760`.

---

## Task 4: Data Migration — admin_notes → notes, admin_alerts → notifications

**Step 1: Migrate existing admin_notes into the notes table**

Use `mcp__plugin_supabase_supabase__execute_sql`:
```sql
-- Migrate existing revisions with admin_notes into notes
-- These become notes authored by the first admin user found
INSERT INTO notes (project_id, revision_id, author_id, content, created_at, updated_at)
SELECT
  r.project_id,
  r.id,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
  r.admin_notes,
  r.updated_at,
  r.updated_at
FROM revisions r
WHERE r.admin_notes IS NOT NULL AND r.admin_notes != '';
```

**Step 2: Migrate admin_alerts → notifications**

Use `mcp__plugin_supabase_supabase__execute_sql`:
```sql
-- Migrate admin_alerts to notifications
-- All admin_alerts go to all admin users
INSERT INTO notifications (recipient_id, type, title, body, link, project_id, is_read, created_at)
SELECT
  p.id,
  a.type,
  a.type,
  a.message,
  COALESCE(
    CASE
      WHEN a.project_id IS NOT NULL THEN '/admin/projects/' || a.project_id
      WHEN a.client_id IS NOT NULL THEN '/admin/clients/' || a.client_id
      ELSE '/admin'
    END,
    '/admin'
  ),
  a.project_id,
  a.is_read,
  a.created_at
FROM admin_alerts a
CROSS JOIN profiles p
WHERE p.role = 'admin';
```

**Step 3: Verify migration counts**

Use `mcp__plugin_supabase_supabase__execute_sql`:
```sql
SELECT
  (SELECT count(*) FROM notes) as notes_count,
  (SELECT count(*) FROM notifications) as notifications_count,
  (SELECT count(*) FROM revisions WHERE admin_notes IS NOT NULL AND admin_notes != '') as migrated_admin_notes,
  (SELECT count(*) FROM admin_alerts) as original_alerts;
```

Verify notes_count >= migrated_admin_notes and notifications_count >= original_alerts.

---

## Task 5: Priority Badge Component

**Files:**
- Create: `components/ui/priority-badge.tsx`

**Step 1: Create the component**

```tsx
// components/ui/priority-badge.tsx
const priorityConfig: Record<string, { label: string; classes: string; dot?: string }> = {
  urgent: {
    label: 'Urgent',
    classes: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-500 animate-pulse',
  },
  normal: {
    label: 'Normal',
    classes: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
  low: {
    label: 'Low',
    classes: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  },
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || priorityConfig.normal

  // Don't render badge for normal priority
  if (priority === 'normal') return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}
    >
      {config.dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </span>
  )
}
```

**Step 2: Commit**

```bash
git add components/ui/priority-badge.tsx
git commit -m "feat: add PriorityBadge component for revision priority levels"
```

---

## Task 6: Markdown Renderer Component

**Files:**
- Create: `components/ui/markdown-renderer.tsx`

**Step 1: Create the component**

```tsx
// components/ui/markdown-renderer.tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-neon-purple prose-strong:text-white prose-code:text-purple-300 prose-code:bg-dark-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-dark-700 prose-pre:border prose-pre:border-dark-600 prose-ul:text-gray-300 prose-ol:text-gray-300 prose-li:text-gray-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
```

**Step 2: Verify Tailwind typography plugin**

Check if `@tailwindcss/typography` is installed. If not:
```bash
npm install @tailwindcss/typography
```

Then add to `tailwind.config.ts` plugins array:
```ts
plugins: [require('@tailwindcss/typography')],
```

**Step 3: Commit**

```bash
git add components/ui/markdown-renderer.tsx
# If typography plugin was added:
git add package.json package-lock.json tailwind.config.ts
git commit -m "feat: add MarkdownRenderer component with GFM support"
```

---

## Task 7: File Upload Component

**Files:**
- Create: `components/ui/file-upload.tsx`

**Step 1: Create the component**

This is a client component with drag-and-drop support. It manages file state and previews.

```tsx
// components/ui/file-upload.tsx
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
```

**Step 2: Commit**

```bash
git add components/ui/file-upload.tsx
git commit -m "feat: add FileUpload component with drag-and-drop support"
```

---

## Task 8: Note Composer Component

**Files:**
- Create: `components/ui/note-composer.tsx`

**Step 1: Create the component**

A client component combining markdown textarea with toolbar, preview toggle, file upload, and submit.

```tsx
// components/ui/note-composer.tsx
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
    // Restore cursor position after the insertion
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
        <button
          type="button"
          onClick={() => insertMarkdown('**', '**')}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('*', '*')}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors italic"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('\n- ')}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
          title="List"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('[', '](url)')}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors"
          title="Link"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.813a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.188" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown('`', '`')}
          className="rounded px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-dark-700 transition-colors font-mono"
          title="Code"
        >
          {'</>'}
        </button>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`rounded px-2.5 py-1 text-xs transition-colors ${
            showPreview
              ? 'bg-neon-purple/20 text-neon-purple'
              : 'text-gray-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Content area */}
      {showPreview ? (
        <div className="min-h-[80px] rounded-lg border border-dark-600 bg-dark-700 p-3">
          {content.trim() ? (
            <MarkdownRenderer content={content} />
          ) : (
            <p className="text-sm text-gray-500">Nothing to preview</p>
          )}
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
```

**Step 2: Commit**

```bash
git add components/ui/note-composer.tsx
git commit -m "feat: add NoteComposer with markdown toolbar, preview, and file upload"
```

---

## Task 9: Notes Feed Component

**Files:**
- Create: `components/ui/notes-feed.tsx`

**Step 1: Create the component**

A server-compatible component that renders a list of notes with author info, timestamps, markdown content, attachments, and read receipts.

```tsx
// components/ui/notes-feed.tsx
import { MarkdownRenderer } from './markdown-renderer'
import { relativeTime } from '@/lib/utils'

interface NoteAttachment {
  id: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
}

interface ReadReceipt {
  user_id: string
  read_at: string
  profiles: { full_name: string | null }
}

interface Note {
  id: string
  content: string
  created_at: string
  author_id: string
  profiles: { full_name: string | null; role: string }
  note_attachments: NoteAttachment[]
  note_read_receipts: ReadReceipt[]
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function NotesFeed({
  notes,
  currentUserId,
  storageUrl,
}: {
  notes: Note[]
  currentUserId: string
  storageUrl: string
}) {
  if (notes.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-500">No notes yet — start the conversation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => {
        const isAdmin = note.profiles?.role === 'admin'
        const isOwn = note.author_id === currentUserId
        const otherReadReceipts = note.note_read_receipts?.filter(
          (r) => r.user_id !== note.author_id
        ) || []

        return (
          <div
            key={note.id}
            className="animate-in fade-in rounded-xl border border-dark-600/50 bg-dark-800/40 p-4"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                isAdmin
                  ? 'bg-gradient-to-br from-neon-purple to-neon-blue text-white'
                  : 'bg-dark-600 text-gray-300'
              }`}>
                {(note.profiles?.full_name || '?')[0].toUpperCase()}
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-white truncate">
                  {note.profiles?.full_name || 'Unknown'}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                    Admin
                  </span>
                )}
              </div>
              <span
                className="ml-auto text-xs text-gray-500 shrink-0"
                title={new Date(note.created_at).toLocaleString()}
              >
                {relativeTime(note.created_at)}
              </span>
            </div>

            {/* Content */}
            <div className="ml-9">
              <MarkdownRenderer content={note.content} />

              {/* Attachments */}
              {note.note_attachments?.length > 0 && (
                <div className="mt-3 space-y-2">
                  {/* Image attachments */}
                  {note.note_attachments.filter(a => isImage(a.mime_type)).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.note_attachments
                        .filter(a => isImage(a.mime_type))
                        .map((att) => (
                          <a
                            key={att.id}
                            href={`${storageUrl}/storage/v1/object/authenticated/note-attachments/${att.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg overflow-hidden border border-dark-600 hover:border-neon-purple transition-colors"
                          >
                            <img
                              src={`${storageUrl}/storage/v1/object/authenticated/note-attachments/${att.file_path}`}
                              alt={att.file_name}
                              className="max-h-48 max-w-xs object-cover"
                            />
                          </a>
                        ))}
                    </div>
                  )}
                  {/* Non-image attachments */}
                  {note.note_attachments
                    .filter(a => !isImage(a.mime_type))
                    .map((att) => (
                      <a
                        key={att.id}
                        href={`${storageUrl}/storage/v1/object/authenticated/note-attachments/${att.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-dark-600 bg-dark-700 px-3 py-1.5 hover:border-neon-purple transition-colors"
                      >
                        <svg className="h-4 w-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="text-xs text-gray-300 truncate max-w-[160px]">{att.file_name}</span>
                        <span className="text-xs text-gray-500">{formatFileSize(att.file_size)}</span>
                      </a>
                    ))}
                </div>
              )}

              {/* Read receipts */}
              {otherReadReceipts.length > 0 && (
                <p className="mt-2 text-[11px] text-gray-600">
                  Seen by {otherReadReceipts.map(r => r.profiles?.full_name || 'Unknown').join(', ')}
                  {' · '}
                  {relativeTime(otherReadReceipts[otherReadReceipts.length - 1].read_at)}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/ui/notes-feed.tsx
git commit -m "feat: add NotesFeed component with attachments and read receipts"
```

---

## Task 10: Notes Server Actions

**Files:**
- Create: `lib/actions/notes.ts`

**Step 1: Create the shared notes server actions file**

This file contains actions used by both admin and client portals.

```tsx
// lib/actions/notes.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNote(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const content = formData.get('content') as string
  const project_id = formData.get('project_id') as string
  const revision_id = formData.get('revision_id') as string | null

  if (!content?.trim()) throw new Error('Content is required')

  // Verify access: admin can access any project, client can only access their own
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    const { data: project } = await supabase
      .from('projects')
      .select('id, client_id')
      .eq('id', project_id)
      .eq('client_id', user.id)
      .single()

    if (!project) throw new Error('Access denied')
  }

  // Insert the note
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .insert({
      project_id,
      revision_id: revision_id || null,
      author_id: user.id,
      content,
    })
    .select('id')
    .single()

  if (noteError || !note) throw new Error('Failed to create note')

  // Handle file attachments
  const files = formData.getAll('files') as File[]
  if (files.length > 0) {
    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue

      const filePath = `${project_id}/${note.id}/${crypto.randomUUID()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('note-attachments')
        .upload(filePath, file)

      if (uploadError) {
        console.error('File upload error:', uploadError)
        continue
      }

      await supabase.from('note_attachments').insert({
        note_id: note.id,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
      })
    }
  }

  // Create notification for the other party
  // Find who should be notified
  const { data: project } = await supabase
    .from('projects')
    .select('id, name, client_id')
    .eq('id', project_id)
    .single()

  if (project) {
    const isAdmin = profile?.role === 'admin'

    if (isAdmin) {
      // Notify the client
      await createNotification(supabase, {
        recipient_id: project.client_id,
        type: 'new_note',
        title: revision_id
          ? `New note on revision`
          : `New note on ${project.name}`,
        body: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
        link: revision_id
          ? `/portal/projects/${project_id}/revisions/${revision_id}`
          : `/portal/projects/${project_id}`,
        project_id,
        revision_id: revision_id || undefined,
        note_id: note.id,
      })
    } else {
      // Notify all admins
      const { data: admins } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')

      if (admins) {
        for (const admin of admins) {
          await createNotification(supabase, {
            recipient_id: admin.id,
            type: 'new_note',
            title: revision_id
              ? `New note from ${profile?.full_name || 'client'}`
              : `New note on ${project.name}`,
            body: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
            link: revision_id
              ? `/admin/revisions/${revision_id}`
              : `/admin/projects/${project_id}`,
            project_id,
            revision_id: revision_id || undefined,
            note_id: note.id,
          })
        }
      }
    }
  }

  // Revalidate relevant paths
  revalidatePath(`/portal/projects/${project_id}`)
  revalidatePath(`/admin/projects/${project_id}`)
  if (revision_id) {
    revalidatePath(`/portal/projects/${project_id}/revisions/${revision_id}`)
    revalidatePath(`/admin/revisions/${revision_id}`)
    revalidatePath('/admin/revisions')
  }
}

export async function markNoteRead(noteId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('note_read_receipts')
    .upsert(
      { note_id: noteId, user_id: user.id, read_at: new Date().toISOString() },
      { onConflict: 'note_id,user_id' }
    )
}

export async function markNotesRead(noteIds: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const records = noteIds.map((noteId) => ({
    note_id: noteId,
    user_id: user.id,
    read_at: new Date().toISOString(),
  }))

  await supabase
    .from('note_read_receipts')
    .upsert(records, { onConflict: 'note_id,user_id' })
}

// Helper to create a notification record
async function createNotification(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    recipient_id: string
    type: string
    title: string
    body: string
    link: string
    project_id?: string
    revision_id?: string
    note_id?: string
  }
) {
  await supabase.from('notifications').insert({
    recipient_id: params.recipient_id,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link,
    project_id: params.project_id || null,
    revision_id: params.revision_id || null,
    note_id: params.note_id || null,
  })
}
```

**Step 2: Commit**

```bash
git add lib/actions/notes.ts
git commit -m "feat: add createNote, markNoteRead server actions with notifications"
```

---

## Task 11: Notification Server Actions

**Files:**
- Create: `lib/actions/notifications.ts`

**Step 1: Create the notification server actions**

```tsx
// lib/actions/notifications.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  return count ?? 0
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .eq('recipient_id', user.id)
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  revalidatePath('/portal/notifications')
  revalidatePath('/admin/notifications')
  revalidatePath('/portal')
  revalidatePath('/admin')
}
```

**Step 2: Commit**

```bash
git add lib/actions/notifications.ts
git commit -m "feat: add notification server actions (read, mark all read, count)"
```

---

## Task 12: Notification Bell Component

**Files:**
- Create: `components/ui/notification-bell.tsx`

**Step 1: Create the client component**

```tsx
// components/ui/notification-bell.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions/notifications'
import { relativeTime } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link: string
  is_read: boolean
  created_at: string
}

export function NotificationBell({
  notifications,
  unreadCount,
  viewAllHref,
}: {
  notifications: Notification[]
  unreadCount: number
  viewAllHref: string // '/portal/notifications' or '/admin/notifications'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Update browser tab title with unread count
  useEffect(() => {
    const baseTitle = document.title.replace(/^\(\d+\)\s*/, '')
    document.title = unreadCount > 0 ? `(${unreadCount}) ${baseTitle}` : baseTitle
    return () => {
      document.title = baseTitle
    }
  }, [unreadCount])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      await markNotificationRead(notif.id)
    }
    setOpen(false)
    router.push(notif.link)
    router.refresh()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    router.refresh()
  }

  const notificationIcon = (type: string) => {
    if (type === 'new_note') return '💬'
    if (type === 'new_revision') return '✏️'
    if (type === 'status_change') return '🔄'
    if (type.includes('payment') || type.includes('invoice')) return '💰'
    return '🔔'
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-dark-600/50 bg-dark-800 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-dark-600/50 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-neon-purple hover:text-neon-purple/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-dark-600/30 hover:bg-dark-700/50 transition-colors ${
                    !notif.is_read ? 'bg-neon-purple/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-sm mt-0.5">{notificationIcon(notif.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${notif.is_read ? 'text-gray-400' : 'text-white font-medium'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="h-2 w-2 rounded-full bg-neon-purple shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{notif.body}</p>
                      <p className="text-xs text-gray-600 mt-1">{relativeTime(notif.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No notifications</p>
              </div>
            )}
          </div>

          <div className="border-t border-dark-600/50 px-4 py-2.5">
            <Link
              href={viewAllHref}
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-neon-purple hover:text-neon-purple/80 transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/ui/notification-bell.tsx
git commit -m "feat: add NotificationBell dropdown component with mark-read support"
```

---

## Task 13: Read Receipt Tracker Component

**Files:**
- Create: `components/ui/read-receipt-tracker.tsx`

**Step 1: Create a client component that marks notes as read when they come into view**

```tsx
// components/ui/read-receipt-tracker.tsx
'use client'

import { useEffect, useRef } from 'react'
import { markNotesRead } from '@/lib/actions/notes'

export function ReadReceiptTracker({
  noteIds,
}: {
  noteIds: string[]
}) {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current || noteIds.length === 0) return
    tracked.current = true

    // Mark all visible unread notes as read after a short delay
    const timer = setTimeout(() => {
      markNotesRead(noteIds)
    }, 1500) // 1.5s delay so it's not instant

    return () => clearTimeout(timer)
  }, [noteIds])

  return null
}
```

**Step 2: Commit**

```bash
git add components/ui/read-receipt-tracker.tsx
git commit -m "feat: add ReadReceiptTracker component for auto-marking notes as read"
```

---

## Task 14: Add Notification Bell to Portal Layout

**Files:**
- Modify: `app/(portal)/portal/layout.tsx`

**Step 1: Update the portal layout to include the notification bell**

Add notification data fetching and the bell component to the top nav bar. The layout already has `supabase` and `user` available.

After the profile query, add:
```tsx
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('recipient_id', user.id)
  .order('created_at', { ascending: false })
  .limit(10)

const { count: unreadCount } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('recipient_id', user.id)
  .eq('is_read', false)
```

Add `import { NotificationBell } from '@/components/ui/notification-bell'` at top.

In the nav bar, before the user name `span`, add:
```tsx
<NotificationBell
  notifications={notifications || []}
  unreadCount={unreadCount ?? 0}
  viewAllHref="/portal/notifications"
/>
```

**Step 2: Verify the layout renders without errors**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/\(portal\)/portal/layout.tsx
git commit -m "feat: add notification bell to client portal nav"
```

---

## Task 15: Add Notification Bell to Admin Layout

**Files:**
- Modify: `app/(admin)/admin/layout.tsx`

**Step 1: Update the admin layout**

Same pattern as the portal layout. Add notification queries after the profile check, and add the `NotificationBell` component to the header bar (before the user name span in the `flex items-center gap-4` div).

Import: `import { NotificationBell } from '@/components/ui/notification-bell'`

Query notifications for the admin user. Add the bell before the username.

**Step 2: Build and verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/\(admin\)/admin/layout.tsx
git commit -m "feat: add notification bell to admin portal nav"
```

---

## Task 16: Client Notifications Page

**Files:**
- Create: `app/(portal)/portal/notifications/page.tsx`

**Step 1: Create the notifications page**

A full-page version of the notification list with all notifications (paginated or full list).

```tsx
// app/(portal)/portal/notifications/page.tsx
import { createClient } from '@/lib/supabase/server'
import { relativeTime } from '@/lib/utils'
import Link from 'next/link'
import { markAllNotificationsRead } from '@/lib/actions/notifications'

export const metadata = { title: 'Notifications — Client Portal' }

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-sm text-gray-400">All your recent notifications.</p>
        </div>
        <form action={markAllNotificationsRead}>
          <button
            type="submit"
            className="rounded-lg border border-dark-600 bg-dark-700 px-4 py-2 text-sm text-gray-300 hover:text-white hover:border-dark-500 transition-colors"
          >
            Mark all as read
          </button>
        </form>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 divide-y divide-dark-600/30">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.link}
              className={`flex items-start gap-4 px-5 py-4 hover:bg-dark-700/50 transition-colors ${
                !notif.is_read ? 'bg-neon-purple/5' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-sm ${notif.is_read ? 'text-gray-400' : 'text-white font-medium'}`}>
                    {notif.title}
                  </p>
                  {!notif.is_read && (
                    <span className="h-2 w-2 rounded-full bg-neon-purple shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{notif.body}</p>
              </div>
              <span className="text-xs text-gray-500 shrink-0 mt-0.5">
                {relativeTime(notif.created_at)}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 py-12 text-center">
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(portal\)/portal/notifications/page.tsx
git commit -m "feat: add client notifications page"
```

---

## Task 17: Admin Notifications Page

**Files:**
- Create: `app/(admin)/admin/notifications/page.tsx`

**Step 1: Create the admin notifications page**

Same structure as the client notifications page, but at the admin route. Update the `viewAllHref` and metadata accordingly.

```tsx
// app/(admin)/admin/notifications/page.tsx
// Same structure as portal notifications page but with admin-specific metadata
// and links pointing to /admin/* routes
```

Follow the exact same pattern as Task 16 but with:
- Metadata: `title: 'Notifications — Admin'`
- No changes to the query (it already filters by `recipient_id = user.id`)

**Step 2: Add Notifications link to AdminNav**

Modify `app/(admin)/admin/admin-nav.tsx` — add a new nav item for Notifications after Revisions in the `navItems` array:
```tsx
{
  label: 'Notifications',
  href: '/admin/notifications',
  icon: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
},
```

**Step 3: Commit**

```bash
git add app/\(admin\)/admin/notifications/page.tsx app/\(admin\)/admin/admin-nav.tsx
git commit -m "feat: add admin notifications page and nav link"
```

---

## Task 18: Client Revision Detail Page

**Files:**
- Create: `app/(portal)/portal/projects/[id]/revisions/[revisionId]/page.tsx`

**Step 1: Create the revision detail page for clients**

This page shows the revision header (title, status, priority, date) and a threaded notes feed with composer.

```tsx
// app/(portal)/portal/projects/[id]/revisions/[revisionId]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { NotesFeed } from '@/components/ui/notes-feed'
import { NoteComposer } from '@/components/ui/note-composer'
import { ReadReceiptTracker } from '@/components/ui/read-receipt-tracker'
import { createNote } from '@/lib/actions/notes'
import { relativeTime } from '@/lib/utils'

export const metadata = { title: 'Revision Detail — Client Portal' }

export default async function ClientRevisionDetailPage({
  params,
}: {
  params: Promise<{ id: string; revisionId: string }>
}) {
  const { id, revisionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch revision with ownership check
  const { data: revision } = await supabase
    .from('revisions')
    .select('*, projects(name)')
    .eq('id', revisionId)
    .eq('project_id', id)
    .eq('client_id', user!.id)
    .single()

  if (!revision) notFound()

  // Fetch notes for this revision
  const { data: notes } = await supabase
    .from('notes')
    .select('*, profiles(full_name, role), note_attachments(*), note_read_receipts(user_id, read_at, profiles(full_name))')
    .eq('revision_id', revisionId)
    .order('created_at', { ascending: true })

  // Find unread note IDs (notes not authored by current user, without a read receipt from current user)
  const unreadNoteIds = (notes || [])
    .filter(n =>
      n.author_id !== user!.id &&
      !n.note_read_receipts?.some((r: { user_id: string }) => r.user_id === user!.id)
    )
    .map(n => n.id)

  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/portal/projects/${id}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to {(revision.projects as { name: string })?.name}
        </Link>
      </div>

      {/* Revision Header */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{revision.title}</h1>
            {revision.description && (
              <p className="mt-2 text-sm text-gray-400">{revision.description}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Submitted {relativeTime(revision.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={revision.priority} />
            <StatusBadge status={revision.status} />
          </div>
        </div>
      </div>

      {/* Notes Thread */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Discussion</h2>
        <NotesFeed
          notes={notes || []}
          currentUserId={user!.id}
          storageUrl={storageUrl}
        />
      </div>

      {/* Read receipt tracker */}
      {unreadNoteIds.length > 0 && (
        <ReadReceiptTracker noteIds={unreadNoteIds} />
      )}

      {/* Composer */}
      <NoteComposer
        action={createNote}
        projectId={id}
        revisionId={revisionId}
        placeholder="Add a note to this revision..."
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(portal\)/portal/projects/\[id\]/revisions/\[revisionId\]/page.tsx
git commit -m "feat: add client revision detail page with threaded notes"
```

---

## Task 19: Admin Revision Detail Page

**Files:**
- Create: `app/(admin)/admin/revisions/[id]/page.tsx`

**Step 1: Create the admin revision detail page**

Similar to client version but with status-change capability.

```tsx
// app/(admin)/admin/revisions/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/ui/status-badge'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { NotesFeed } from '@/components/ui/notes-feed'
import { NoteComposer } from '@/components/ui/note-composer'
import { ReadReceiptTracker } from '@/components/ui/read-receipt-tracker'
import { createNote } from '@/lib/actions/notes'
import { updateRevisionStatus } from '../actions'
import { relativeTime } from '@/lib/utils'

export const metadata = { title: 'Revision Detail — Admin' }

export default async function AdminRevisionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: revision } = await supabase
    .from('revisions')
    .select('*, profiles!revisions_client_id_fkey(full_name), projects(id, name)')
    .eq('id', id)
    .single()

  if (!revision) notFound()

  const { data: notes } = await supabase
    .from('notes')
    .select('*, profiles(full_name, role), note_attachments(*), note_read_receipts(user_id, read_at, profiles(full_name))')
    .eq('revision_id', id)
    .order('created_at', { ascending: true })

  const unreadNoteIds = (notes || [])
    .filter(n =>
      n.author_id !== user!.id &&
      !n.note_read_receipts?.some((r: { user_id: string }) => r.user_id === user!.id)
    )
    .map(n => n.id)

  const projectId = (revision.projects as { id: string; name: string })?.id
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const updateWithId = updateRevisionStatus.bind(null, revision.id)

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/revisions"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to Revisions
        </Link>
      </div>

      {/* Revision Header with status control */}
      <div className="rounded-xl border border-dark-600/50 bg-dark-800/40 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">{revision.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              by {(revision.profiles as { full_name: string | null })?.full_name || 'Unknown'}
              {' · '}
              {(revision.projects as { id: string; name: string })?.name}
              {' · '}
              {relativeTime(revision.created_at)}
            </p>
            {revision.description && (
              <p className="mt-3 text-sm text-gray-400">{revision.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={revision.priority} />
          </div>
        </div>

        {/* Status control */}
        <form action={updateWithId} className="mt-4 pt-4 border-t border-dark-600/50 flex items-center gap-3">
          <input type="hidden" name="admin_notes" value="" />
          <select
            name="status"
            defaultValue={revision.status}
            className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-neon-purple focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-neon-purple px-4 py-2 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
          >
            Update Status
          </button>
        </form>
      </div>

      {/* Notes Thread */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Discussion</h2>
        <NotesFeed
          notes={notes || []}
          currentUserId={user!.id}
          storageUrl={storageUrl}
        />
      </div>

      {unreadNoteIds.length > 0 && (
        <ReadReceiptTracker noteIds={unreadNoteIds} />
      )}

      <NoteComposer
        action={createNote}
        projectId={projectId}
        revisionId={id}
        placeholder="Add a note to this revision..."
      />
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/\(admin\)/admin/revisions/\[id\]/page.tsx
git commit -m "feat: add admin revision detail page with status control and notes"
```

---

## Task 20: Update Admin Revisions List to Link to Detail Pages

**Files:**
- Modify: `app/(admin)/admin/revisions/page.tsx`

**Step 1: Make revision rows link to the detail page**

Change the `<details>` expandable rows to `<Link>` rows that navigate to `/admin/revisions/[id]`. Add priority badge display. Remove the inline form (status/notes editing now happens on the detail page).

Each row becomes a clickable link:
```tsx
<Link
  href={`/admin/revisions/${rev.id}`}
  className="flex items-center justify-between px-5 py-4 hover:bg-dark-700/50 transition-colors"
>
  <div className="flex items-center gap-4 min-w-0">
    <div className="min-w-0">
      <p className="text-sm font-medium text-white truncate">{rev.title}</p>
      <p className="text-xs text-gray-500">
        {client name} · {project name} · {date}
      </p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <PriorityBadge priority={rev.priority} />
    <StatusBadge status={rev.status} />
  </div>
</Link>
```

Also add sorting: urgent first, then by `created_at desc`. Update the Supabase query:
```tsx
.order('created_at', { ascending: false })
```

And sort client-side or add priority ordering.

**Step 2: Commit**

```bash
git add app/\(admin\)/admin/revisions/page.tsx
git commit -m "feat: update admin revisions list with links to detail pages and priority badges"
```

---

## Task 21: Update Client Revision Creation Form

**Files:**
- Modify: `app/(portal)/portal/projects/[id]/revisions/new/page.tsx`
- Modify: `app/(portal)/portal/projects/actions.ts`

**Step 1: Add priority selector to the form**

Add a priority radio group or select to the form:
```tsx
<div>
  <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
  <div className="flex gap-3">
    {['low', 'normal', 'urgent'].map((p) => (
      <label key={p} className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="priority" value={p} defaultChecked={p === 'normal'}
          className="text-neon-purple focus:ring-neon-purple" />
        <span className="text-sm text-gray-300 capitalize">{p}</span>
      </label>
    ))}
  </div>
</div>
```

**Step 2: Update the createRevision server action**

In `app/(portal)/portal/projects/actions.ts`, update `createRevision`:
- Read `priority` from formData
- Insert revision with priority
- After inserting, create the initial note from the description
- Create notification for admins

```tsx
const priority = (formData.get('priority') as string) || 'normal'

const { data: revision } = await supabase
  .from('revisions')
  .insert({ project_id, client_id: user.id, title, description, priority })
  .select('id')
  .single()

// Create the initial note from the description if provided
if (description && revision) {
  await supabase.from('notes').insert({
    project_id,
    revision_id: revision.id,
    author_id: user.id,
    content: description,
  })
}

// Notify admins
if (revision) {
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  if (admins) {
    for (const admin of admins) {
      await supabase.from('notifications').insert({
        recipient_id: admin.id,
        type: 'new_revision',
        title: `New revision request: ${title}`,
        body: description?.slice(0, 100) || title,
        link: `/admin/revisions/${revision.id}`,
        project_id,
        revision_id: revision.id,
      })
    }
  }
}

// Redirect to the new revision detail page instead of the project page
redirect(`/portal/projects/${project_id}/revisions/${revision!.id}`)
```

**Step 3: Commit**

```bash
git add app/\(portal\)/portal/projects/\[id\]/revisions/new/page.tsx app/\(portal\)/portal/projects/actions.ts
git commit -m "feat: add priority selector to revision form and create initial note + notification"
```

---

## Task 22: Update Admin Revision Status Action to Create Notifications

**Files:**
- Modify: `app/(admin)/admin/revisions/actions.ts`

**Step 1: Update updateRevisionStatus to notify the client**

After updating the status, create a notification for the client:

```tsx
// After the status update:
const { data: revision } = await supabase
  .from('revisions')
  .select('client_id, title, project_id')
  .eq('id', id)
  .single()

if (revision) {
  await supabase.from('notifications').insert({
    recipient_id: revision.client_id,
    type: 'status_change',
    title: `Revision "${revision.title}" marked as ${status.replace('_', ' ')}`,
    body: admin_notes || `Status changed to ${status.replace('_', ' ')}`,
    link: `/portal/projects/${revision.project_id}/revisions/${id}`,
    project_id: revision.project_id,
    revision_id: id,
  })
}
```

Also add revalidation for the new revision detail paths.

**Step 2: Commit**

```bash
git add app/\(admin\)/admin/revisions/actions.ts
git commit -m "feat: add client notification on revision status change"
```

---

## Task 23: Add Project Notes to Client Project Detail Page

**Files:**
- Modify: `app/(portal)/portal/projects/[id]/page.tsx`

**Step 1: Add notes section**

Between the project info card and the revisions section, add a project-level notes section.

Add to the data fetching `Promise.all`:
```tsx
supabase
  .from('notes')
  .select('*, profiles(full_name, role), note_attachments(*), note_read_receipts(user_id, read_at, profiles(full_name))')
  .eq('project_id', id)
  .is('revision_id', null)
  .order('created_at', { ascending: true }),
```

Add imports: `NotesFeed`, `NoteComposer`, `ReadReceiptTracker`, `createNote`.

Add the notes section JSX after the billing card grid and before the revisions section:
```tsx
{/* Project Notes */}
<div className="rounded-xl border border-dark-600/50 bg-dark-800/40 mb-6">
  <div className="border-b border-dark-600/50 px-5 py-4">
    <h2 className="text-lg font-semibold text-white">Notes</h2>
  </div>
  <div className="p-5">
    <NotesFeed notes={projectNotes || []} currentUserId={user!.id} storageUrl={storageUrl} />
    <div className="mt-4">
      <NoteComposer action={createNote} projectId={id} placeholder="Add a note about this project..." />
    </div>
  </div>
</div>
```

Also update revision rows to link to the detail page:
```tsx
<Link href={`/portal/projects/${id}/revisions/${rev.id}`} className="...">
```

**Step 2: Commit**

```bash
git add app/\(portal\)/portal/projects/\[id\]/page.tsx
git commit -m "feat: add project notes section and revision detail links to client project page"
```

---

## Task 24: Add Project Notes to Admin Project Detail Page

**Files:**
- Modify: `app/(admin)/admin/projects/[id]/page.tsx`

**Step 1: Add notes section**

Same pattern as the client side. Add notes query to the `Promise.all`, import `NotesFeed`, `NoteComposer`, `ReadReceiptTracker`, `createNote`.

Add a "Notes" section between the edit form and the revisions section. Also update revision rows to link to `/admin/revisions/[id]`.

**Step 2: Commit**

```bash
git add app/\(admin\)/admin/projects/\[id\]/page.tsx
git commit -m "feat: add project notes section and revision detail links to admin project page"
```

---

## Task 25: Update Admin Dashboard to Use Notifications

**Files:**
- Modify: `app/(admin)/admin/page.tsx`

**Step 1: Replace admin_alerts with notifications**

Change the query from `admin_alerts` to `notifications`:
```tsx
// Replace:
supabase.from('admin_alerts').select('*').eq('is_read', false)...
// With:
supabase.from('notifications').select('*').eq('recipient_id', user.id).eq('is_read', false)...
```

Update the "Needs Attention" section to use notification data instead of alert data. Update the `DismissAlertButton` to use `markNotificationRead` from `@/lib/actions/notifications`.

Or simpler: replace the alert-based "Needs Attention" with a notification-based one. Each notification links to its target page.

**Step 2: Get the user in the dashboard**

The admin dashboard page currently doesn't fetch the user. Add:
```tsx
const { data: { user } } = await supabase.auth.getUser()
```

Then filter notifications by `recipient_id = user.id`.

**Step 3: Commit**

```bash
git add app/\(admin\)/admin/page.tsx
git commit -m "feat: replace admin_alerts with notifications on admin dashboard"
```

---

## Task 26: Email Notification Edge Function

**Files:**
- Deploy via `mcp__plugin_supabase_supabase__deploy_edge_function`

**Step 1: Create and deploy the edge function**

Deploy an edge function named `send-notification-email` that:
1. Receives a webhook payload with the new notification record
2. Looks up the recipient's email from profiles
3. Sends a branded email via Resend (or Supabase email)
4. Updates `email_sent = true` on the notification

The function will be triggered by a database webhook on `notifications` INSERT.

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const notification = payload.record;

    if (!notification || notification.email_sent) {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get recipient email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", notification.recipient_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "No email found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Determine portal URL
    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", notification.recipient_id)
      .single();

    const baseUrl = Deno.env.get("APP_URL") || "https://app.builtbyflux.com";
    const fullLink = `${baseUrl}${notification.link}`;

    // Send email via Resend
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Flux Agency <notifications@builtbyflux.com>",
          to: [profile.email],
          subject: notification.title,
          html: `
            <div style="background-color: #0a0a0f; padding: 40px 20px; font-family: -apple-system, system-ui, sans-serif;">
              <div style="max-width: 480px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="color: #a855f7; font-size: 20px; margin: 0;">FLUX</h1>
                </div>
                <div style="background-color: #111118; border: 1px solid #1e1e2e; border-radius: 12px; padding: 24px;">
                  <h2 style="color: #ffffff; font-size: 16px; margin: 0 0 8px 0;">${notification.title}</h2>
                  <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">${notification.body}</p>
                  <a href="${fullLink}" style="display: inline-block; background-color: #a855f7; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">View in Portal</a>
                </div>
                <p style="color: #4b5563; font-size: 12px; text-align: center; margin-top: 24px;">Flux Agency &middot; Built by Flux</p>
              </div>
            </div>
          `,
        }),
      });
    }

    // Mark email as sent
    await supabase
      .from("notifications")
      .update({ email_sent: true })
      .eq("id", notification.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

Deploy with `verify_jwt: false` since this is triggered by a database webhook (not a user request).

**Step 2: Create database webhook**

Use `mcp__plugin_supabase_supabase__execute_sql` to create a webhook trigger:
```sql
-- Note: Database webhooks are configured via the Supabase dashboard
-- or via pg_net extension. The edge function URL will be:
-- https://mkqlbnxavpckqpnmryis.supabase.co/functions/v1/send-notification-email
```

This step may need to be configured via the Supabase dashboard under Database > Webhooks. Create a webhook that triggers on INSERT to the `notifications` table and calls the edge function.

**Step 3: Set environment variables**

Via Supabase dashboard or CLI, set `RESEND_API_KEY` and `APP_URL` as edge function secrets.

---

## Task 27: Build Verification & Cleanup

**Step 1: Run the build**

```bash
npm run build
```

Fix any TypeScript errors or build issues.

**Step 2: Run lint**

```bash
npm run lint
```

Fix any lint issues.

**Step 3: Run Supabase security advisors**

Use `mcp__plugin_supabase_supabase__get_advisors` with type `security` to verify all new tables have proper RLS.

**Step 4: Verify the app works**

```bash
npm run dev
```

Test manually:
- Client portal: create a revision with priority, add notes, upload files
- Admin portal: view revision detail, change status, add notes
- Project notes: add notes on both sides
- Notifications: bell shows unread count, clicking marks as read
- Read receipts: viewing notes creates receipts

**Step 5: Final commit**

```bash
git add -A
git commit -m "fix: address build issues and finalize notes/notifications system"
```

---

## Task 28: Drop Deprecated Tables (After Verification)

**ONLY do this after confirming everything works.**

**Step 1: Drop admin_alerts references**

Remove any remaining imports of `DismissAlertButton` and references to `admin_alerts` table.

**Step 2: Apply cleanup migration**

```sql
-- Drop the deprecated admin_notes column from revisions
ALTER TABLE revisions DROP COLUMN IF EXISTS admin_notes;

-- Drop the admin_alerts table
DROP TABLE IF EXISTS admin_alerts;
```

Migration name: `drop_deprecated_admin_alerts_and_admin_notes`

**Step 3: Remove DismissAlertButton component**

Delete `app/(admin)/admin/dismiss-alert-button.tsx` if it exists.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: drop deprecated admin_alerts table and admin_notes column"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | Install npm packages | None |
| 2 | Database migration (4 tables + priority column + RLS) | None |
| 3 | Supabase Storage bucket | Task 2 |
| 4 | Data migration (admin_notes → notes, admin_alerts → notifications) | Task 2 |
| 5 | PriorityBadge component | None |
| 6 | MarkdownRenderer component | Task 1 |
| 7 | FileUpload component | None |
| 8 | NoteComposer component | Tasks 6, 7 |
| 9 | NotesFeed component | Task 6 |
| 10 | Notes server actions | Task 2 |
| 11 | Notification server actions | Task 2 |
| 12 | NotificationBell component | Task 11 |
| 13 | ReadReceiptTracker component | Task 10 |
| 14 | Portal layout — notification bell | Task 12 |
| 15 | Admin layout — notification bell | Task 12 |
| 16 | Client notifications page | Task 11 |
| 17 | Admin notifications page + nav link | Task 11 |
| 18 | Client revision detail page | Tasks 5, 8, 9, 10, 13 |
| 19 | Admin revision detail page | Tasks 5, 8, 9, 10, 13 |
| 20 | Update admin revisions list | Task 5 |
| 21 | Update client revision form + action | Tasks 2, 10 |
| 22 | Update admin revision status action | Tasks 2, 11 |
| 23 | Client project notes section | Tasks 8, 9, 10, 13 |
| 24 | Admin project notes section | Tasks 8, 9, 10, 13 |
| 25 | Admin dashboard — replace admin_alerts | Task 11 |
| 26 | Email notification edge function | Task 2 |
| 27 | Build verification & cleanup | All above |
| 28 | Drop deprecated tables | Task 27 |
