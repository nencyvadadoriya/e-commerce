import { NextResponse } from 'next/server'
import { getBannersStore, createBannerStore, updateBannerStore, deleteBannerStore } from '@/lib/data-store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const all = searchParams.get('all') === 'true'
  const banners = await getBannersStore(!all)
  return NextResponse.json({ banners })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const banner = await createBannerStore(data)
    return NextResponse.json({ banner, message: 'Banner created successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create banner', details: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()
    const banner = await updateBannerStore(id, data)
    if (!banner) return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    return NextResponse.json({ banner, message: 'Banner updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update banner', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  const success = await deleteBannerStore(id)
  if (!success) return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
  return NextResponse.json({ message: 'Banner deleted successfully' })
}
