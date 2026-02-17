const VERCEL_API_BASE = 'https://api.vercel.com'

interface VercelProject {
  id: string
  name: string
  framework: string | null
  latestDeployments?: { url: string }[]
}

export async function listVercelProjects(): Promise<VercelProject[]> {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) {
    throw new Error('VERCEL_API_TOKEN is not set')
  }

  const res = await fetch(`${VERCEL_API_BASE}/v9/projects?limit=100`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 60 }, // cache for 60 seconds
  })

  if (!res.ok) {
    throw new Error(`Vercel API error: ${res.status}`)
  }

  const data = await res.json()
  return data.projects.map((p: any) => ({
    id: p.id,
    name: p.name,
    framework: p.framework,
  }))
}

export async function getVercelProjectDomains(projectId: string): Promise<{ name: string }[]> {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) {
    throw new Error('VERCEL_API_TOKEN is not set')
  }

  const res = await fetch(`${VERCEL_API_BASE}/v9/projects/${projectId}/domains`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Vercel API error: ${res.status}`)
  }

  const data = await res.json()
  return data.domains || []
}

export async function pauseVercelProject(projectId: string): Promise<void> {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) {
    throw new Error('VERCEL_API_TOKEN is not set')
  }

  const res = await fetch(`${VERCEL_API_BASE}/v1/projects/${projectId}/pause`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Vercel pause failed (${res.status}): ${body}`)
  }
}

export async function unpauseVercelProject(projectId: string): Promise<void> {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) {
    throw new Error('VERCEL_API_TOKEN is not set')
  }

  const res = await fetch(`${VERCEL_API_BASE}/v1/projects/${projectId}/unpause`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Vercel unpause failed (${res.status}): ${body}`)
  }
}
