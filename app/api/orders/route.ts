import { NextResponse } from 'next/server'
import { getOrdersStore, createOrderStore } from '@/lib/data-store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
  const status = searchParams.get('status') ?? undefined
  const query = searchParams.get('q')?.trim() ?? undefined

  const result = await getOrdersStore(page, limit, status, query)
  return NextResponse.json({
    orders: result.items,
    total: result.total,
    page: result.page,
    pages: result.pages,
  })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const order = await createOrderStore(data)
    return NextResponse.json({ order, message: 'Order created successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order', details: String(error) }, { status: 500 })
  }
}
