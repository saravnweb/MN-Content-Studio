import { NextResponse } from 'next/server'

function parseYoutubeUrl(url: string): { type: 'handle' | 'id' | 'username'; value: string } | null {
  try {
    const cleanedUrl = url.trim()
    const u = new URL(cleanedUrl.startsWith('http') ? cleanedUrl : `https://${cleanedUrl}`)
    const path = u.pathname.replace(/\/$/, '')

    // Handle @handle or just /handle (if it doesn't match other patterns)
    const handleMatch = path.match(/^\/@?([\w.-]+)$/)
    if (handleMatch) return { type: 'handle', value: `@${handleMatch[1]}` }

    // /channel/UCxxxxx
    const channelMatch = path.match(/^\/channel\/(UC[\w-]{22})$/)
    if (channelMatch) return { type: 'id', value: channelMatch[1] }

    // /c/name or /user/name
    const nameMatch = path.match(/^\/(?:c|user)\/(.+)$/)
    if (nameMatch) return { type: 'username', value: nameMatch[1] }
    
    // If it's just a handle-like string as path
    if (path.length > 2 && !path.includes('/')) {
      return { type: 'handle', value: `@${path.replace(/^@/, '')}` }
    }
  } catch {
    // maybe it's just the handle?
    if (url.startsWith('@')) return { type: 'handle', value: url }
    if (!url.includes('/') && url.length > 0) return { type: 'handle', value: `@${url}` }
  }
  return null
}

export async function GET(request: Request) {
  try {
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

    console.log(`Fetching YouTube stats for: ${parsed.value} (${parsed.type})`)
    const res = await fetch(apiUrl)
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const message = errorData.error?.message || 'YouTube API error'
      console.error('YouTube API response error:', errorData)
      return NextResponse.json({ error: message }, { status: res.status })
    }

    const data = await res.json()
    const item = data.items?.[0]
    
    if (!item) {
      console.log('YouTube channel not found in API response')
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: item.snippet?.title,
      subscribers: parseInt(item.statistics?.subscriberCount ?? '0'),
      thumbnail: item.snippet?.thumbnails?.default?.url,
    })
  } catch (error: any) {
    console.error('YouTube API route crash:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

