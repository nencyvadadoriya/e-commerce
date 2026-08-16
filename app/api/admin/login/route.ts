import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Demo admin credentials
    if ((email === 'admin@nava.com' || email === 'admin') && (password === 'admin123' || password === 'admin')) {
      const response = NextResponse.json({ success: true, message: 'Logged in successfully' })
      response.cookies.set('nava-admin-auth', 'authenticated', {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid email or password. Demo credentials: admin@nava.com / admin123' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed', details: String(error) }, { status: 500 })
  }
}
