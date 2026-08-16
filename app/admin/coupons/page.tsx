'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Edit, Trash2, Ticket, X, Check } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

type Coupon = {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderValue: number
  maxDiscount: number
  usageLimit: number
  usedCount: number
  startDate: string
  expiryDate: string
  active: boolean
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const { success, error } = useToast()

  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '10',
    minOrderValue: '999',
    maxDiscount: '500',
    usageLimit: '200',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '2026-12-31',
    active: true,
  })

  const loadCoupons = () => {
    setLoading(true)
    fetch('/api/coupons')
      .then((res) => res.json())
      .then((data) => setCoupons(data.coupons ?? []))
      .catch(() => error('Failed to load coupons'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) return

    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      discountValue: Number(form.discountValue || 0),
      minOrderValue: Number(form.minOrderValue || 0),
      maxDiscount: Number(form.maxDiscount || 0),
      usageLimit: Number(form.usageLimit || 100),
    }

    if (editingCoupon) {
      const res = await fetch('/api/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCoupon.id, ...payload }),
      })
      if (res.ok) {
        success(`Updated coupon "${payload.code}"`)
        loadCoupons()
        setModalOpen(false)
        setEditingCoupon(null)
      } else {
        error('Failed to update coupon')
      }
    } else {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        success(`Created promo code "${payload.code}"! Available during checkout.`)
        loadCoupons()
        setModalOpen(false)
      } else {
        error('Failed to create coupon')
      }
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    const res = await fetch('/api/coupons', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coupon.id, active: !coupon.active }),
    })
    if (res.ok) {
      success(`Coupon ${!coupon.active ? 'activated' : 'disabled'}`)
      loadCoupons()
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon code "${code}"?`)) return
    const res = await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      success(`Deleted coupon "${code}"`)
      setCoupons((current) => current.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Promotions</p>
          <h1 className="font-serif text-xl">Discount Coupons Management</h1>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null)
            setForm({
              code: '',
              discountType: 'percentage',
              discountValue: '10',
              minOrderValue: '999',
              maxDiscount: '500',
              usageLimit: '200',
              startDate: new Date().toISOString().split('T')[0],
              expiryDate: '2026-12-31',
              active: true,
            })
            setModalOpen(true)
          }}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          <Plus size={16} /> Create Coupon
        </button>
      </header>

      <div className="mx-auto max-w-6xl p-5 lg:p-8 space-y-6">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Loading promo coupons…</div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center space-y-3 border border-border bg-card">
            <Ticket size={32} className="mx-auto text-muted-foreground" />
            <p className="font-serif text-2xl">No active promo coupons</p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus size={15} /> Create First Coupon
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="border border-border bg-card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xl font-bold text-primary tracking-wider">{coupon.code}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                      coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {coupon.active ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-border pt-3">
                  <div>
                    <span className="text-muted-foreground">Min Order:</span>
                    <span className="font-semibold ml-1">₹{coupon.minOrderValue}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Cap:</span>
                    <span className="font-semibold ml-1">₹{coupon.maxDiscount || 'No Limit'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Usage Limit:</span>
                    <span className="font-semibold ml-1">{coupon.usedCount || 0} / {coupon.usageLimit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid Until:</span>
                    <span className="font-semibold ml-1">{coupon.expiryDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => {
                      setEditingCoupon(coupon)
                      setForm({
                        code: coupon.code,
                        discountType: coupon.discountType,
                        discountValue: coupon.discountValue.toString(),
                        minOrderValue: coupon.minOrderValue.toString(),
                        maxDiscount: coupon.maxDiscount.toString(),
                        usageLimit: coupon.usageLimit.toString(),
                        startDate: coupon.startDate || new Date().toISOString().split('T')[0],
                        expiryDate: coupon.expiryDate || '2026-12-31',
                        active: coupon.active,
                      })
                      setModalOpen(true)
                    }}
                    className="p-1.5 text-muted-foreground hover:text-primary"
                    title="Edit Coupon"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id, coupon.code)}
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                    title="Delete Coupon"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl">{editingCoupon ? 'Edit Coupon' : 'Create Promo Coupon'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coupon Code *</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. NAVAWELCOME"
                className="w-full border border-border bg-background px-4 py-2 font-mono text-sm uppercase outline-none focus:border-primary"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount Type</label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount Value *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  placeholder="10"
                  className="w-full border border-border bg-background px-4 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Min Order Value (₹)</label>
                <input
                  type="number"
                  value={form.minOrderValue}
                  onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                  placeholder="999"
                  className="w-full border border-border bg-background px-4 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Max Discount (₹)</label>
                <input
                  type="number"
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder="500"
                  className="w-full border border-border bg-background px-4 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usage Limit</label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="200"
                  className="w-full border border-border bg-background px-4 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="border border-border px-4 py-2 text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Save Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
