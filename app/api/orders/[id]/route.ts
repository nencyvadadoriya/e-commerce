import { NextResponse } from 'next/server'
import { getOrderByIdStore, updateOrderStatusStore } from '@/lib/data-store'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderByIdStore(id)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({ order })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { status } = await request.json()
    const updated = await updateOrderStatusStore(id, status)
    if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order: updated, message: `Order status updated to ${status}` })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status', details: String(error) }, { status: 500 })
  }
}
