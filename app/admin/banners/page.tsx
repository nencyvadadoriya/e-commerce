'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, X, Check, ArrowUp, ArrowDown } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

type Banner = {
  id: string
  title: string
  eyebrow: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  active: boolean
  order: number
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const { success, error } = useToast()

  const [form, setForm] = useState({
    title: '',
    eyebrow: 'Featured Edit',
    description: '',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1800&q=85',
    buttonText: 'Explore the edit',
    buttonLink: '#shop',
    active: true,
  })

  const loadBanners = () => {
    setLoading(true)
    fetch('/api/banners?all=true')
      .then((res) => res.json())
      .then((data) => setBanners(data.banners ?? []))
      .catch(() => error('Failed to load banners'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.image.trim()) return

    if (editingBanner) {
      const res = await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingBanner.id, ...form }),
      })
      if (res.ok) {
        success('Banner updated successfully')
        loadBanners()
        setModalOpen(false)
        setEditingBanner(null)
      } else {
        error('Failed to update banner')
      }
    } else {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        success('Banner created! Instantly visible on customer homepage hero slider.')
        loadBanners()
        setModalOpen(false)
      } else {
        error('Failed to create banner')
      }
    }
  }

  const toggleActive = async (banner: Banner) => {
    const res = await fetch('/api/banners', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: banner.id, active: !banner.active }),
    })
    if (res.ok) {
      success(`Banner ${!banner.active ? 'activated' : 'deactivated'}`)
      loadBanners()
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete banner "${title}"?`)) return
    const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      success(`Deleted banner "${title}"`)
      setBanners((current) => current.filter((b) => b.id !== id))
    }
  }

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Homepage Hero</p>
          <h1 className="font-serif text-xl">Banner Slider Management</h1>
        </div>
        <button
          onClick={() => {
            setEditingBanner(null)
            setForm({
              title: '',
              eyebrow: 'Featured Edit',
              description: '',
              image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1800&q=85',
              buttonText: 'Explore the edit',
              buttonLink: '#shop',
              active: true,
            })
            setModalOpen(true)
          }}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          <Plus size={16} /> Add Hero Banner
        </button>
      </header>

      <div className="mx-auto max-w-6xl p-5 lg:p-8 space-y-6">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Loading hero banners…</div>
        ) : banners.length === 0 ? (
          <div className="p-16 text-center space-y-3 border border-border bg-card">
            <ImageIcon size={32} className="mx-auto text-muted-foreground" />
            <p className="font-serif text-2xl">No banners configured</p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus size={15} /> Add First Banner
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {banners.map((banner, idx) => (
              <div key={banner.id} className="border border-border bg-card overflow-hidden space-y-3">
                <div className="relative aspect-[16/9] bg-muted">
                  <Image src={banner.image} alt={banner.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-background">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-accent">{banner.eyebrow}</p>
                    <h3 className="font-serif text-xl font-semibold leading-tight">{banner.title}</h3>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(banner)}
                      className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                        banner.active ? 'bg-emerald-600 text-white' : 'bg-destructive text-white'
                      }`}
                    >
                      {banner.active ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <div className="p-4 pt-1 space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">{banner.description || 'No description'}</p>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                    <span className="font-medium text-primary">Button: {banner.buttonText} ({banner.buttonLink})</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingBanner(banner)
                          setForm({
                            title: banner.title,
                            eyebrow: banner.eyebrow,
                            description: banner.description,
                            image: banner.image,
                            buttonText: banner.buttonText,
                            buttonLink: banner.buttonLink,
                            active: banner.active,
                          })
                          setModalOpen(true)
                        }}
                        className="p-1.5 text-muted-foreground hover:text-primary"
                        title="Edit Banner"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id, banner.title)}
                        className="p-1.5 text-muted-foreground hover:text-destructive"
                        title="Delete Banner"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl">{editingBanner ? 'Edit Hero Banner' : 'Add Hero Banner'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Banner Heading *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Made for your pace."
                className="w-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Eyebrow Tag</label>
                <input
                  value={form.eyebrow}
                  onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                  placeholder="e.g. Soft structure"
                  className="w-full border border-border bg-background px-4 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Button Text</label>
                <input
                  value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  placeholder="e.g. Explore the edit"
                  className="w-full border border-border bg-background px-4 py-2 text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Banner Image URL *</label>
              <input
                required
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full border border-border bg-background px-4 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Button Link Target</label>
              <input
                value={form.buttonLink}
                onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                placeholder="e.g. /category/women or #shop"
                className="w-full border border-border bg-background px-4 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description Copy</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Thoughtful essentials and considered details..."
                className="w-full border border-border bg-background px-4 py-2 text-sm outline-none resize-y"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="border border-border px-4 py-2 text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Save Banner
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
