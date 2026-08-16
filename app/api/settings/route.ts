import { NextResponse } from 'next/server'
import { getSettingsStore, updateSettingsStore } from '@/lib/data-store'

export async function GET() {
  const settings = await getSettingsStore()
  return NextResponse.json({ settings })
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const updated = await updateSettingsStore(data)
    return NextResponse.json({ settings: updated, message: 'Settings saved successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings', details: String(error) }, { status: 500 })
  }
}
