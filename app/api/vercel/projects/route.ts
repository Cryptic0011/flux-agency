import { createClient } from '@/lib/supabase/server'
import { listVercelProjects } from '@/lib/vercel'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const projects = await listVercelProjects()
    return NextResponse.json({ projects })
  } catch {
    console.error('Vercel projects fetch error')
    return NextResponse.json(
      { error: 'Failed to fetch Vercel projects.' },
      { status: 500 }
    )
  }
}
