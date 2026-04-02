import { sql } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string

    if (!name || !message) {
      return NextResponse.redirect(new URL('/?error=1', request.url))
    }

    await sql`
      INSERT INTO contacts (name, phone, email, message)
      VALUES (${name}, ${phone}, ${email}, ${message})
    `

    return NextResponse.redirect(new URL('/?success=1', request.url))
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.redirect(new URL('/?error=1', request.url))
  }
}
