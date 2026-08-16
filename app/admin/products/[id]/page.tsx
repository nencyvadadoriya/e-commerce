'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Star, ExternalLink, X, Layers } from 'lucide-react'
import { useToast } from '@/components/toast-provider'
import type { ProductVariant } from '@/lib/data-store'

type Product = {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  subcategory?: string
  originalPrice: number
  sellingPrice: number
  stock: number
  rating: number
  reviewCount: number
  image: string
  images: string[]
  badge: string
  description?: string
  sku?: string
  active?: boolean
  hasVariants?: boolean
  variants?: ProductVariant[]
}

export default function AdminProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { success, error } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [deleteModal, setDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProduct(data.product)
          setSelectedImage(data.product.image || data.product.images?.[0] || '')
        }
      })
      .catch(() => error('Failed to load product details'))
      .finally(() => setLoading(false))
  }, [id, error])

  const handleDelete = async () => {
    if (!product) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      success(`Deleted "${product.name}" successfully`)
      router.push('/admin/products')
    } catch {
      error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Loading product specification…</div>
  }

  if (!product) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="font-serif text-3xl">Product Not Found</p>
        <Link href="/admin/products" className="inline-flex bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
          ← Back to Products List
        </Link>
      </div>
    )
  }

  const discount = Math.round((1 - product.sellingPrice / (product.originalPrice || product.sellingPrice)) * 100)
  const images = product.images?.length ? product.images : [product.image].filter(Boolean)

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Product Detail</p>
            <h1 className="font-serif text-xl">{product.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/product/${product.id}`}
            target="_blank"
            className="flex items-center gap-1 border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ExternalLink size={14} /> Storefront
          </Link>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex items-center gap-1 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Edit size={14} /> Edit Product
          </Link>
          <button
            onClick={() => setDeleteModal(true)}
            className="flex items-center gap-1 bg-destructive px-3.5 py-2 text-xs font-semibold text-destructive-foreground hover:opacity-90"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-5 lg:p-8 space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] border border-border bg-muted overflow-hidden rounded-xs">
              <Image
                src={selectedImage || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85'}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute left-3 top-3 bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider border border-border">
                {product.badge || 'Product'}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 w-20 shrink-0 border transition rounded-xs overflow-hidden ${
                      selectedImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${i}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Info */}
          <div className="space-y-6">
            <div className="border border-border bg-card p-6 space-y-4 rounded-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-accent font-semibold">{product.brand}</span>
                <span className={`px-2.5 py-0.5 text-xs font-semibold ${product.stock > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-destructive/15 text-destructive'}`}>
                  {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                </span>
              </div>

              <h2 className="font-serif text-3xl">{product.name}</h2>
              <p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-3xl font-semibold">₹{product.sellingPrice?.toLocaleString('en-IN')}</span>
                {product.originalPrice > product.sellingPrice && (
                  <>
                    <span className="text-base text-muted-foreground line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                    <span className="text-xs font-semibold text-accent border border-accent/30 px-2 py-0.5">{discount}% OFF</span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="text-sm leading-relaxed text-muted-foreground border-t border-border pt-4">
                  {product.description}
                </p>
              )}
            </div>

            <div className="border border-border bg-card p-6 grid gap-4 sm:grid-cols-2 text-sm rounded-xs">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Category</p>
                <p className="font-medium mt-1">{product.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Subcategory</p>
                <p className="font-medium mt-1">{product.subcategory || 'General'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Customer Rating</p>
                <p className="font-medium mt-1 flex items-center gap-1">
                  <Star size={14} className="fill-accent text-accent" /> {product.rating || 4.5} ({product.reviewCount || 10} reviews)
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Visibility Status</p>
                <p className="font-medium mt-1">{product.active !== false ? 'Active (Visible)' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Variants List if any */}
        {product.variants && product.variants.length > 0 && (
          <div className="border border-border bg-card p-6 space-y-4 rounded-xs">
            <h3 className="font-serif text-xl flex items-center gap-2 border-b border-border pb-3">
              <Layers size={18} className="text-primary" /> Product Variants ({product.variants.length})
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.variants.map((v) => (
                <div key={v.id} className="border border-border p-4 bg-muted/20 space-y-3 rounded-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm">{v.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {v.color ? `Color: ${v.color}` : ''} {v.size ? `· Size: ${v.size}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-background border border-border">
                      {v.stock} in stock
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 text-sm font-semibold">
                    <span>₹{(v.price || product.sellingPrice).toLocaleString('en-IN')}</span>
                    {v.originalPrice && v.originalPrice > (v.price || product.sellingPrice) && (
                      <span className="text-xs text-muted-foreground line-through">₹{v.originalPrice.toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  {v.images && v.images.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto pt-1">
                      {v.images.map((img, i) => (
                        <div key={i} className="relative h-12 w-12 shrink-0 border border-border bg-background rounded-xs overflow-hidden">
                          <Image src={img} alt={`${v.name} ${i}`} fill sizes="48px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-md border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl text-destructive font-semibold">Confirm Delete</h3>
              <button onClick={() => setDeleteModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">"{product.name}"</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:opacity-90"
              >
                {deleting ? 'Deleting…' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
