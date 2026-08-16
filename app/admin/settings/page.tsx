'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Settings, Save, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

export default function AdminSettingsPage() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    storeName: 'Nava Studio',
    supportEmail: 'support@nava.com',
    supportPhone: '+91 98765 43210',
    currency: 'INR',
    taxRate: 18,
    freeShippingThreshold: 999,
    shippingFee: 99,
    address: '102 Design Quarter, Bandra West, Mumbai 400050',
    enableCOD: true,
    enableCardPayment: true,
  })

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setForm((current) => ({ ...current, ...data.settings }))
      })
      .catch(() => error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [error])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        error(data.error || 'Failed to save settings')
        setSaving(false)
        return
      }

      success('Store preferences saved successfully')
    } catch {
      error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Loading store preferences…</div>
  }

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Preferences</p>
          <h1 className="font-serif text-xl">Store Settings</h1>
        </div>
        <button
          type="submit"
          form="settings-form"
          disabled={saving}
          className="flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </header>

      <div className="mx-auto max-w-4xl p-5 lg:p-8">
        <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Store Info */}
          <div className="border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-lg border-b border-border pb-3">Store Information</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Store Brand Name
                </label>
                <input
                  required
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Support Email
                </label>
                <input
                  type="email"
                  required
                  value={form.supportEmail}
                  onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Support Phone
                </label>
                <input
                  value={form.supportPhone}
                  onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Default Currency
                </label>
                <input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Warehouse / Return Address
              </label>
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary resize-y"
              />
            </div>
          </div>

          {/* Shipping & Payment Options */}
          <div className="border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-lg border-b border-border pb-3">Shipping & Checkout Configuration</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  value={form.freeShippingThreshold}
                  onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Flat Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={form.shippingFee}
                  onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })}
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center justify-between border border-border bg-background p-3 cursor-pointer">
                <span className="text-sm font-medium">Enable Card Sandbox Checkout</span>
                <input
                  type="checkbox"
                  checked={form.enableCardPayment}
                  onChange={(e) => setForm({ ...form, enableCardPayment: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between border border-border bg-background p-3 cursor-pointer">
                <span className="text-sm font-medium">Enable Cash On Delivery (COD)</span>
                <input
                  type="checkbox"
                  checked={form.enableCOD}
                  onChange={(e) => setForm({ ...form, enableCOD: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
              </label>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
