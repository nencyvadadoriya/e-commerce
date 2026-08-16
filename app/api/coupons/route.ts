import { NextResponse } from 'next/server'
import { getCouponsStore, createCouponStore, updateCouponStore, deleteCouponStore, validateCouponStore } from '@/lib/data-store'

export async function GET() {
  const coupons = await getCouponsStore(false)
  return NextResponse.json({ coupons })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Check if applying coupon code
    if (data.action === 'apply') {
      const result = await validateCouponStore(data.code, data.cartTotal)
      if (!result.valid) return NextResponse.json({ error: result.message }, { status: 400 })
      return NextResponse.json({ message: 'Coupon applied successfully', discount: result.discount, coupon: result.coupon })
    }

    const coupon = await createCouponStore(data)
    return NextResponse.json({ coupon, message: 'Coupon created successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process coupon', details: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()
    const coupon = await updateCouponStore(id, data)
    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    return NextResponse.json({ coupon, message: 'Coupon updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coupon', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  const success = await deleteCouponStore(id)
  if (!success) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
  return NextResponse.json({ message: 'Coupon deleted successfully' })
}
