import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createRevision } from '../../../actions'

export const metadata = { title: 'New Revision — Client Portal' }

export default async function NewRevisionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Verify project ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .eq('client_id', user!.id)
    .single()

  if (!project) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/portal/projects/${id}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to {project.name}
        </Link>
      </div>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Request a Revision</h1>
        <p className="text-sm text-gray-400 mb-6">
          Describe the changes you&apos;d like made to <span className="text-white font-medium">{project.name}</span>.
        </p>

        <form action={createRevision} className="space-y-5">
          <input type="hidden" name="project_id" value={id} />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <input
              name="title"
              required
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple"
              placeholder="e.g. Update homepage hero section"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              name="description"
              rows={5}
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple resize-y"
              placeholder="Please describe the changes in detail..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-neon-purple px-4 py-2.5 text-sm font-medium text-white hover:bg-neon-purple/80 transition-colors"
          >
            Submit Revision Request
          </button>
        </form>
      </div>
    </div>
  )
}
