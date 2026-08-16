'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Check, CreditCard, LockKeyhole, MapPin, ShoppingBag, ShieldCheck, Ticket } from 'lucide-react'
import { useCommerce, formatMoney } from '@/components/commerce-provider'
import { useToast } from '@/components/toast-provider'

const ADDRESS_STORAGE_KEY = 'nava-delivery-address'

export function CheckoutFlow() {
  const router = useRouter()
  const { cart, appliedCoupon, applyCoupon, removeCoupon } = useCommerce()
  const { error, success } = useToast()
  const [address, setAddress] = useState({ name: 'Priya Sharma', phone: '+91 98201 12345', email: 'priya@example.com', line: '402 Sunrise Towers, Juhu', city: 'Mumbai', pincode: '400049' })
  const [couponInput, setCouponInput] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY)
      if (saved) setAddress(JSON.parse(saved))
    } catch {}
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)
  const discount = appliedCoupon?.discount || 0
  const shipping = subtotal >= 999 ? 0 : 99
  const total = Math.max(0, subtotal - discount + shipping)

  if (!cart.length) return <EmptyCheckout />

  const handleApplyCoupon = async (e: FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    setApplyingCoupon(true)
    await applyCoupon(couponInput.trim())
    setApplyingCoupon(false)
    setCouponInput('')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (Object.values(address).some((value) => !value.trim())) {
      error('Please complete all address fields')
      return
    }
    localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(address))
    router.push('/checkout/payment')
  }

  return (
    <main className="min-h-screen bg-background">
      <CheckoutHeader step="Address" />
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1fr_380px] lg:px-10">
        <form onSubmit={submit} className="space-y-6">
          <div className="border border-border bg-card p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <MapPin size={22} className="text-primary" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">Step 1 of 2</p>
                  <h1 className="mt-1 font-serif text-3xl">Delivery Address</h1>
                </div>
              </div>
              <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ArrowLeft size={14} /> Back to store
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Full Name *</label>
                <input required value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Email Address *</label>
                <input type="email" required value={address.email} onChange={(e) => setAddress({ ...address, email: e.target.value })} className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Phone Number *</label>
                <input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pincode *</label>
                <input required value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Flat / House No. & Street Address *</label>
                <input required value={address.line} onChange={(e) => setAddress({ ...address, line: e.target.value })} className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">City & State *</label>
                <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border border-border bg-card p-4 text-xs text-muted-foreground">
            <LockKeyhole size={16} className="text-accent shrink-0" />
            <span>Your delivery details are encrypted and securely stored for order processing.</span>
          </div>

          <button type="submit" className="flex w-full items-center justify-center gap-2 bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer">
            Continue to Payment <ArrowRight size={16} />
          </button>
        </form>

        <OrderSummary subtotal={subtotal} discount={discount} shipping={shipping} total={total} appliedCoupon={appliedCoupon} onApplyCoupon={handleApplyCoupon} couponInput={couponInput} setCouponInput={setCouponInput} applyingCoupon={applyingCoupon} onRemoveCoupon={removeCoupon} />
      </div>
    </main>
  )
}

export function PaymentFlow() {
  const router = useRouter()
  const { cart, appliedCoupon } = useCommerce()
  const { error } = useToast()
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', expiry: '12/28', cvv: '123', name: 'Priya Sharma' })

  const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)
  const discount = appliedCoupon?.discount || 0
  const shipping = subtotal >= 999 ? 0 : 99
  const total = Math.max(0, subtotal - discount + shipping)

  if (!cart.length) return <EmptyCheckout />

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!card.number.trim() || !card.expiry.trim() || !card.cvv.trim() || !card.name.trim()) {
      error('Please fill all card details')
      return
    }
    router.push('/checkout/otp')
  }

  return (
    <main className="min-h-screen bg-background">
      <CheckoutHeader step="Payment" />
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-8 lg:grid-cols-[1fr_340px] lg:px-10">
        <form onSubmit={submit} className="border border-border bg-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <CreditCard size={22} className="text-primary" />
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">Step 2 of 2</p>
                <h1 className="mt-1 font-serif text-3xl">Card Payment (Sandbox)</h1>
              </div>
            </div>
            <Link href="/checkout" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft size={14} /> Back to address
            </Link>
          </div>

          <div className="bg-muted/70 p-3.5 text-xs text-muted-foreground flex items-center gap-2 border border-border">
            <ShieldCheck size={18} className="text-primary shrink-0" />
            <span>Sandbox Test Mode: Test card details pre-filled. Confirm with OTP on next step.</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Card Number *</label>
              <input inputMode="numeric" required value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary font-mono" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Expiry (MM / YY) *</label>
              <input required value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM / YY" className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary font-mono" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">CVV *</label>
              <input required maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="123" className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary font-mono" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Name on Card *</label>
              <input required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" />
            </div>
          </div>

          <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer">
            Proceed to Verification <ArrowRight size={16} />
          </button>
        </form>

        <div className="space-y-6">
          <div className="border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-xl border-b border-border pb-3">Payable: {formatMoney(total)}</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upon clicking proceed, an SMS verification prompt will verify code <strong>123456</strong> before confirming your order.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export function OtpFlow() {
  const router = useRouter()
  const { cart, appliedCoupon, clearCart } = useCommerce()
  const { success, error: toastError } = useToast()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)
  const discount = appliedCoupon?.discount || 0
  const shipping = subtotal >= 999 ? 0 : 99
  const total = Math.max(0, subtotal - discount + shipping)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (otp !== '123456') {
      const msg = 'Invalid verification code. Please enter test OTP: 123456'
      setError(msg)
      toastError(msg)
      return
    }

    setSubmitting(true)
    let address = { name: 'Customer', email: 'customer@example.com', phone: '+91 98765 43210', line: 'Mumbai', city: 'Mumbai', pincode: '400001' }
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY)
      if (saved) address = JSON.parse(saved)
    } catch {}

    const orderPayload = {
      orderNumber: `NAV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: address.name,
      customerEmail: address.email,
      customerPhone: address.phone,
      shippingAddress: { line: address.line, city: address.city, pincode: address.pincode },
      items: cart.map((item) => ({
        productId: item.id,
        variantId: item.variantId,
        variantName: item.variantName,
        name: item.variantName ? `${item.name} (${item.variantName})` : item.name,
        image: item.image,
        brand: item.brand,
        category: item.category,
        price: item.sellingPrice,
        quantity: item.quantity,
      })),
      subtotal,
      discount,
      shipping,
      total,
      couponCode: appliedCoupon?.code,
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })
      const data = await res.json()

      if (res.ok) {
        success(`Order ${data.order?.orderNumber || ''} confirmed successfully!`)
        clearCart()
        router.push('/order-success')
      } else {
        toastError('Failed to record order')
        setSubmitting(false)
      }
    } catch {
      toastError('Network error confirming order')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <CheckoutHeader step="Confirm" />
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/30 text-primary">
          <Check size={24} />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Final Verification</p>
        <h1 className="mt-2 font-serif text-4xl">Confirm Test Payment</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Enter the 6-digit test code. Required OTP: <strong className="text-primary font-mono text-base">123456</strong>
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            autoFocus
            maxLength={6}
            inputMode="numeric"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''))
              setError('')
            }}
            className="w-full border border-border bg-card px-4 py-4 text-center text-3xl font-mono tracking-[0.4em] outline-none focus:border-primary shadow-xs"
            placeholder="000000"
          />

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting || otp.length < 6}
            className="w-full bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Confirming Order…' : 'Verify & Place Order'}
          </button>
        </form>

        <div className="mt-6">
          <Link href="/checkout/payment" className="text-xs text-muted-foreground hover:text-foreground">
            ← Change Payment Method
          </Link>
        </div>
      </div>
    </main>
  )
}

export function OrderSuccess() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="max-w-lg text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
          <Check size={32} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-bold">Order Confirmed</p>
        <h1 className="font-serif text-5xl">It’s on its way.</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Thank you for shopping with nava. Your order has been placed in the database and is now live in the Admin Fulfillment panel!
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row pt-4">
          <Link href="/" className="bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition">
            Continue Shopping
          </Link>
          <Link href="/admin/orders" className="border border-border px-6 py-3.5 text-sm font-semibold hover:bg-muted transition">
            View in Admin Orders
          </Link>
        </div>
      </div>
    </main>
  )
}

function CheckoutHeader({ step }: { step: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-10">
        <Link href="/" className="font-serif text-2xl font-semibold text-primary">
          nava<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
          <span className="text-primary">Cart</span>
          <span>›</span>
          <span className={step === 'Address' ? 'text-primary font-bold' : ''}>Address</span>
          <span>›</span>
          <span className={step === 'Payment' ? 'text-primary font-bold' : ''}>Payment</span>
          <span>›</span>
          <span className={step === 'Confirm' ? 'text-primary font-bold' : ''}>Verify</span>
        </div>
      </div>
    </header>
  )
}

function OrderSummary({
  subtotal,
  discount,
  shipping,
  total,
  appliedCoupon,
  onApplyCoupon,
  couponInput,
  setCouponInput,
  applyingCoupon,
  onRemoveCoupon,
}: any) {
  return (
    <aside className="h-fit border border-border bg-card p-6 space-y-6">
      <h2 className="font-serif text-2xl border-b border-border pb-3">Order Summary</h2>

      {/* Coupon input */}
      <div>
        <form onSubmit={onApplyCoupon} className="flex gap-2">
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            placeholder="Coupon code (e.g. NAVAWELCOME)"
            className="flex-1 border border-border bg-background px-3 py-2 text-xs font-mono uppercase outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={applyingCoupon}
            className="bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground cursor-pointer"
          >
            {applyingCoupon ? '...' : 'Apply'}
          </button>
        </form>
        {appliedCoupon && (
          <div className="mt-2 flex items-center justify-between bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 text-xs">
            <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
            <button type="button" onClick={onRemoveCoupon} className="text-destructive font-bold text-xs ml-2 cursor-pointer">
              Remove
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 text-sm border-t border-border pt-4">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-accent font-medium">
            <span>Promo Discount</span>
            <span>-{formatMoney(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span>{shipping ? formatMoney(shipping) : 'Free Delivery'}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-4 font-semibold text-base">
          <span>Total Payable</span>
          <span>{formatMoney(total)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <LockKeyhole size={14} className="text-primary" /> Secure 256-bit encrypted checkout
      </div>
    </aside>
  )
}

function EmptyCheckout() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 text-center">
      <div className="space-y-4">
        <ShoppingBag size={42} className="mx-auto text-muted-foreground" />
        <h1 className="font-serif text-4xl">Your bag is empty.</h1>
        <p className="text-sm text-muted-foreground">Add products to your cart to proceed to checkout.</p>
        <Link href="/" className="mt-4 inline-flex bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          Explore Catalog
        </Link>
      </div>
    </main>
  )
}
