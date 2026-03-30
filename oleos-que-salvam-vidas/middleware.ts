import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect dashboard and admin routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && !payload.isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
}
