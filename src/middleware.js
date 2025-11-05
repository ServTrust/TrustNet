import { NextResponse } from 'next/server'

const rateLimit = new Map()
const LIMIT = parseInt(process.env.RATE_LIMIT_PER_DAY || '20', 10)
const WINDOW = 24 * 60 * 60 * 1000

export function middleware(request) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown'
  const now = Date.now()

  const userRequests = rateLimit.get(ip) || []
  const recentRequests = userRequests.filter(time => now - time < WINDOW)

  if (recentRequests.length >= LIMIT) {
    return new NextResponse('Rate limit exceeded. Try again tomorrow.', { status: 429 })
  }

  recentRequests.push(now)
  rateLimit.set(ip, recentRequests)

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
