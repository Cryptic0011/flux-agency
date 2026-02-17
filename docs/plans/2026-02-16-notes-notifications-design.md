# Notes, Notifications & Premium Revision System

## Problem

The revision system is one-directional: clients submit a request (title + description), admin responds with a single `admin_notes` text field and a status change. There is no back-and-forth conversation, no timestamps on responses, no file sharing, no priority levels, and no notification system for clients. The admin side has basic `admin_alerts` but nothing unified.

## Approach

Unified Notes System — a single `notes` table powers both revision-level threads and project-level notes. A new `notifications` table replaces `admin_alerts` and extends to both admin and client. Email notifications sent via Supabase Edge Function. File attachments stored in Supabase Storage.

## Data Model

### New Tables

**`notes`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | gen_random_uuid() |
| project_id | uuid FK → projects | Always set |
| revision_id | uuid FK → revisions, nullable | Set for revision-thread notes |
| author_id | uuid FK → profiles | Who wrote it |
| content | text | Markdown-formatted body |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

**`note_attachments`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | gen_random_uuid() |
| note_id | uuid FK → notes (cascade delete) | |
| file_name | text | Original filename |
| file_path | text | Supabase Storage path |
| file_size | integer | Bytes |
| mime_type | text | e.g. image/png |
| created_at | timestamptz | now() |

**`notifications`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | gen_random_uuid() |
| recipient_id | uuid FK → profiles | Who should see this |
| type | text | new_note, status_change, new_revision, payment_failed, invoice_overdue, etc. |
| title | text | Short headline |
| body | text | Preview text |
| link | text | URL to navigate to |
| project_id | uuid FK → projects, nullable | Context |
| revision_id | uuid FK → revisions, nullable | Context |
| note_id | uuid FK → notes, nullable | Context |
| is_read | boolean default false | |
| email_sent | boolean default false | |
| created_at | timestamptz | now() |

**`note_read_receipts`**

| Column | Type | Description |
|--------|------|-------------|
| id | uuid PK | gen_random_uuid() |
| note_id | uuid FK → notes (cascade delete) | |
| user_id | uuid FK → profiles | Who read it |
| read_at | timestamptz | now() |
| UNIQUE(note_id, user_id) | | One receipt per user per note |

### Modified Tables

**`revisions`** — add column:
- `priority text default 'normal' check (priority in ('urgent','normal','low'))`

### Deprecated

- `revisions.admin_notes` — existing data migrated into notes, column dropped later
- `admin_alerts` — data migrated into notifications, table dropped

### Storage

- Supabase Storage bucket: `note-attachments` (private)
- RLS: users can access attachments on notes within their projects
- Max file size: 10MB
- Allowed types: jpg, png, gif, webp, pdf, doc/docx, xls/xlsx, zip

## Revision System Upgrade

### Enhanced Revision Creation (Client)

- Title (required)
- Description (markdown with toolbar + preview)
- Priority selector: Urgent / Normal / Low
- File attachments (drag & drop or file picker, max 5 files)
- On submit: creates revision + first note + attachments + notification to admin

### Revision Detail Page (New)

- Client route: `/portal/projects/[id]/revisions/[revisionId]`
- Admin route: `/admin/revisions/[id]`
- Header: title, status badge, priority tag, created date, client name
- Threaded notes feed (chronological, newest at bottom)
  - Author avatar/name, timestamp, markdown content, attachments, read receipt
- Compose area: markdown input, file upload, submit
- Admin header includes: status dropdown + save

### Priority Visual Indicators

- Urgent: red pulse dot + red badge, sorted to top in admin list
- Normal: no special indicator
- Low: gray badge

## Project-Level Notes

New section on both admin and client project detail pages, between project info and revisions.

- Chronological feed of notes where `revision_id IS NULL`
- Compose area with markdown + attachments
- Admin notes display with "Admin" badge
- Unread notes have purple left-border highlight
- New note creates notification for other party

## Notifications

### In-App — Notification Bell

- Bell icon in top nav with unread count badge
- Dropdown panel: recent notifications with icon, title, body preview, relative time, unread dot
- "Mark all as read" and "View all" links
- Click marks as read and navigates to linked page
- Dedicated page: `/portal/notifications` and `/admin/notifications`
- Unread count shown in browser tab title: "(3) Flux Agency Portal"

### Notification Triggers

| Event | Recipient | Title Example |
|-------|-----------|---------------|
| New revision created | Admin | "New revision request: Homepage redesign" |
| Revision status changed | Client | "Revision marked as In Progress" |
| New note on revision | Other party | "New note on: Homepage redesign" |
| New project note | Other party | "New note on Project X" |
| Payment received | Admin | "Payment received: $500" |
| Invoice overdue | Both | "Invoice #INV-001 is past due" |

### Email Notifications

- Supabase Edge Function triggered by DB webhook on `notifications` insert
- Branded HTML email (dark theme, purple accent)
- Subject = notification title, body = preview + "View in Portal" CTA button
- Only sends if `email_sent = false`, updates to `true` after send

### Migration from admin_alerts

- Migrate existing admin_alerts rows to notifications table
- Drop admin_alerts table
- Update all code referencing admin_alerts

## Read Receipts

- Server action creates receipt when note scrolls into viewport
- Display: "Seen by [Name] · 2h ago" below each note
- Unread notes have faint purple left-border that fades after receipt

## Rich Text

- Textarea with markdown toolbar (bold, italic, list, link, code)
- Preview toggle
- Rendered via `react-markdown` + `remark-gfm`
- Safe sanitization

## File Attachments

- Drag & drop zone below note textarea, or click to browse
- Images: inline preview in notes, lightbox on click
- Non-image: download chips with icon + filename + size
- Max 5 files per note, 10MB each

## Premium Polish

- Smooth fade-in transitions on note appearance
- Optimistic UI on note submission
- Empty states with helpful copy
- Relative timestamps with full date on hover
- Notification count in browser tab title

## Files to Create

- `app/(portal)/portal/projects/[id]/revisions/[revisionId]/page.tsx` — Client revision detail
- `app/(admin)/admin/revisions/[id]/page.tsx` — Admin revision detail
- `app/(portal)/portal/notifications/page.tsx` — Client notifications page
- `app/(admin)/admin/notifications/page.tsx` — Admin notifications page
- `components/ui/notes-feed.tsx` — Reusable notes feed component
- `components/ui/note-composer.tsx` — Markdown composer with file upload
- `components/ui/notification-bell.tsx` — Nav notification bell (client component)
- `components/ui/markdown-renderer.tsx` — Markdown rendering component
- `components/ui/file-upload.tsx` — Drag & drop file upload component
- `components/ui/priority-badge.tsx` — Priority tag component

## Files to Modify

- `app/(portal)/portal/projects/[id]/page.tsx` — Add project notes section
- `app/(portal)/portal/projects/[id]/revisions/new/page.tsx` — Add priority + attachments
- `app/(admin)/admin/revisions/page.tsx` — Link rows to detail page
- `app/(admin)/admin/projects/[id]/page.tsx` — Add project notes section
- `app/(admin)/admin/page.tsx` — Replace admin_alerts with notifications
- `app/(admin)/admin/layout.tsx` — Add notification bell to nav
- `app/(portal)/portal/layout.tsx` — Add notification bell to nav
- `app/(portal)/portal/projects/actions.ts` — Update createRevision to create note + notification
- `app/(admin)/admin/revisions/actions.ts` — Update status change to create notification

## New Dependencies

- `react-markdown` — Markdown rendering
- `remark-gfm` — GitHub-flavored markdown support
