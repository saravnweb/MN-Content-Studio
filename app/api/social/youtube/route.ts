import { NextResponse } from 'next/server'

function parseYoutubeUrl(url: string): { type: 'handle' | 'id' | 'username'; value: string } | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    const path = u.pathname.replace(/\/$/, '')

    // /@handle
    const handleMatch = path.match(/^\/@(.+)$/)
    if (handleMatch) return { type: 'handle', value: `@${handleMatch[1]}` }

    // /channel/UCxxxxx
    const channelMatch = path.match(/^\/channel\/(UC[\w-]{22})$/)
    if (channelMatch) return { type: 'id', value: channelMatch[1] }

    // /c/name or /user/name
    const nameMatch = path.match(/^\/(?:c|user)\/(.+)$/)
    if (nameMatch) return { type: 'username', value: nameMatch[1] }
  } catch {
    // invalid URL
  }
  return null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')?.trim()

  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'YouTube API not configured' }, { status: 503 })

  const parsed = parseYoutubeUrl(url)
  if (!parsed) return NextResponse.json({ error: 'Could not parse YouTube URL' }, { status: 422 })

  const base = 'https://www.googleapis.com/youtube/v3/channels'
  const paramKey = parsed.type === 'handle' ? 'forHandle' : parsed.type === 'id' ? 'id' : 'forUsername'
  const apiUrl = `${base}?part=statistics,snippet&${paramKey}=${encodeURIComponent(parsed.value)}&key=${apiKey}`

  const res = await fetch(apiUrl)
  if (!res.ok) return NextResponse.json({ error: 'YouTube API error' }, { status: 502 })

  const data = await res.json()
  const item = data.items?.[0]
  if (!item) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })

  return NextResponse.json({
    name: item.snippet?.title,
    subscribers: parseInt(item.statistics?.subscriberCount ?? '0'),
    thumbnail: item.snippet?.thumbnails?.default?.url,
  })
}
