import { NextRequest, NextResponse } from 'next/server'

const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
)

const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

/** Strip protocol prefix and trailing slashes from domain values */
function normalizeDomain(raw: string): string {
  return raw
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
}

export async function GET(request: NextRequest) {
  const rawDomain = request.nextUrl.searchParams.get('domain')

  if (!rawDomain) {
    return new NextResponse(TRANSPARENT_PIXEL, {
      status: 400,
      headers: { 'Content-Type': 'image/png' },
    })
  }

  const domain = normalizeDomain(rawDomain)

  if (!DOMAIN_REGEX.test(domain)) {
    return new NextResponse(TRANSPARENT_PIXEL, {
      status: 400,
      headers: { 'Content-Type': 'image/png' },
    })
  }

  try {
    const microlinkUrl = new URL('https://api.microlink.io/')
    microlinkUrl.searchParams.set('url', `https://${domain}`)
    microlinkUrl.searchParams.set('screenshot', 'true')
    microlinkUrl.searchParams.set('meta', 'false')
    microlinkUrl.searchParams.set('embed', 'screenshot.url')

    const res = await fetch(microlinkUrl.toString(), {
      redirect: 'follow',
    })

    if (!res.ok) {
      return new NextResponse(TRANSPARENT_PIXEL, {
        status: 502,
        headers: { 'Content-Type': 'image/png' },
      })
    }

    const contentType = res.headers.get('content-type') || 'image/png'
    const imageBuffer = Buffer.from(await res.arrayBuffer())

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
      },
    })
  } catch {
    return new NextResponse(TRANSPARENT_PIXEL, {
      status: 502,
      headers: { 'Content-Type': 'image/png' },
    })
  }
}
