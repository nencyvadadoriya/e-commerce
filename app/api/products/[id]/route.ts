import { NextResponse } from 'next/server'
import { getProductByIdStore, updateProductStore, deleteProductStore } from '@/lib/data-store'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductByIdStore(id)
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  return NextResponse.json({ product })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await request.json()
    const updated = await updateProductStore(id, data)
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ product: updated, message: 'Product updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const success = await deleteProductStore(id)
  if (!success) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  return NextResponse.json({ message: 'Product deleted successfully' })
}
