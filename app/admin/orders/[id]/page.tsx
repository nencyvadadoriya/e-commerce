'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShoppingBag, MapPin, User, CheckCircle2, Truck, Clock, X } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

type OrderItem = {
  productId: string
  name: string
  image?: string
  brand?: string
  price: number
  quantity: number
}

type Order = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: { line: string; city: string; pincode: string }
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  total: number
  couponCode?: string
  paymentStatus: string
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  createdAt: string
}

const statusOptions: Order['orderStatus'][] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { success, error } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order)
      })
      .catch(() => error('Failed to load order'))
      .finally(() => setLoading(false))
  }, [id, error])

  const handleStatusChange = async (newStatus: Order['orderStatus']) => {
    if (!order) return
    setUpdating(true)

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (!res.ok) {
        error(data.error || 'Failed to update status')
        setUpdating(false)
        return
      }

      setOrder({ ...order, orderStatus: newStatus })
      success(`Order status updated to ${newStatus}`)
    } catch {
      error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Loading order details…</div>
  }

  if (!order) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="font-serif text-3xl">Order Not Found</p>
        <Link href="/admin/orders" className="inline-flex bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
          ← Back to Orders List
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Fulfillment / Order Detail</p>
            <h1 className="font-serif text-xl">{order.orderNumber}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Update Status:</span>
          <select
            value={order.orderStatus}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as Order['orderStatus'])}
            className="border border-primary bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-card text-foreground font-normal">
                {opt}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-5 lg:p-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Main Items Section */}
        <div className="space-y-6">
          <div className="border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-lg border-b border-border pb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" /> Purchased Items ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-border">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 bg-muted border border-border">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85'}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.brand || 'Nava'}</p>
                    <p className="text-xs font-semibold text-primary mt-2">
                      ₹{item.price?.toLocaleString('en-IN')} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border border-border bg-card p-6 space-y-3 text-sm">
            <h3 className="font-serif text-base border-b border-border pb-2">Payment Summary</h3>
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-accent font-medium">
                <span>Discount ({order.couponCode || 'Promo'})</span>
                <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{order.shipping ? `₹${order.shipping}` : 'Free Delivery'}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-semibold text-base">
              <span>Total Paid</span>
              <span className="text-primary">₹{order.total?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-lg border-b border-border pb-3 flex items-center gap-2">
              <User size={18} className="text-primary" /> Customer Info
            </h2>
            <div className="text-sm space-y-2">
              <p className="font-semibold text-foreground">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
              <p className="text-muted-foreground">{order.customerPhone}</p>
            </div>
          </div>

          <div className="border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-lg border-b border-border pb-3 flex items-center gap-2">
              <MapPin size={18} className="text-primary" /> Delivery Address
            </h2>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingAddress?.line}</p>
              <p>{order.shippingAddress?.city} — {order.shippingAddress?.pincode}</p>
            </div>
          </div>

          <div className="border border-border bg-card p-6 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Mode:</span>
              <span className="font-semibold text-foreground">Card (Sandbox)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date:</span>
              <span className="font-medium text-foreground">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
