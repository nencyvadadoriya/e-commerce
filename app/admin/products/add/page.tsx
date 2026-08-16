'use client'

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent, type DragEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Layers,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react'
import { useToast } from '@/components/toast-provider'
import type { ProductVariant } from '@/lib/data-store'

export default function AddProductPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<string[]>([
    'Men',
    'Women',
    'Kids',
    'Footwear',
    'Accessories',
    'Jewellery',
    'Home',
    'Beauty',
    'GenZ',
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: 'Men',
    subcategory: '',
    originalPrice: '',
    sellingPrice: '',
    stock: '10',
    description: '',
    badge: 'New',
    sku: '',
    size: '',
    color: '',
    active: true,
  })

  const [images, setImages] = useState<string[]>([])
  const [draggedImgIdx, setDraggedImgIdx] = useState<number | null>(null)
  const [dragOverImgIdx, setDragOverImgIdx] = useState<number | null>(null)

  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories?.length) {
          setCategories(data.categories.map((c: any) => c.name))
        }
      })
      .catch(() => undefined)
  }, [])

  // Handle uploading product images via file picker
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.urls?.length) {
        setImages((prev) => [...prev, ...data.urls])
        success(`Uploaded ${data.urls.length} image(s)`)
      } else {
        error(data.error || 'Failed to upload images')
      }
    } catch {
      error('Error uploading image files')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, i) => i !== index))
  }

  // Drag and drop reordering for main product images
  const handleDragStart = (index: number) => {
    setDraggedImgIdx(index)
  }

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault()
    if (dragOverImgIdx !== index) {
      setDragOverImgIdx(index)
    }
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedImgIdx === null || draggedImgIdx === targetIndex) {
      setDraggedImgIdx(null)
      setDragOverImgIdx(null)
      return
    }

    setImages((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(draggedImgIdx, 1)
      updated.splice(targetIndex, 0, moved)
      return updated
    })

    setDraggedImgIdx(null)
    setDragOverImgIdx(null)
  }

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return
    setImages((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(from, 1)
      updated.splice(to, 0, moved)
      return updated
    })
  }

  const makePrimary = (index: number) => {
    if (index === 0) return
    setImages((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(index, 1)
      updated.unshift(moved)
      return updated
    })
    success('Image moved to Primary (#1) position')
  }

  // Variant operations
  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: '',
      color: '',
      size: '',
      price: Number(form.sellingPrice) || 0,
      originalPrice: Number(form.originalPrice) || 0,
      stock: Number(form.stock) || 10,
      sku: '',
      images: [],
    }
    setVariants((prev) => [...prev, newVariant])
    setHasVariants(true)
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariants((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeVariant = (index: number) => {
    setVariants((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) setHasVariants(false)
      return updated
    })
  }

  const handleVariantImageUpload = async (variantIndex: number, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok && data.urls?.length) {
        setVariants((prev) => {
          const updated = [...prev]
          const curImgs = updated[variantIndex].images || []
          updated[variantIndex].images = [...curImgs, ...data.urls]
          return updated
        })
        success(`Uploaded ${data.urls.length} image(s) for variant`)
      } else {
        error(data.error || 'Failed to upload variant images')
      }
    } catch {
      error('Error uploading variant images')
    }
  }

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setVariants((prev) => {
      const updated = [...prev]
      updated[variantIndex].images = updated[variantIndex].images.filter((_, i) => i !== imageIndex)
      return updated
    })
  }

  const moveVariantImage = (variantIndex: number, fromIdx: number, toIdx: number) => {
    setVariants((prev) => {
      const updated = [...prev]
      const curImgs = [...(updated[variantIndex].images || [])]
      if (toIdx < 0 || toIdx >= curImgs.length) return prev
      const [moved] = curImgs.splice(fromIdx, 1)
      curImgs.splice(toIdx, 0, moved)
      updated[variantIndex].images = curImgs
      return updated
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.brand.trim() || !form.sellingPrice) {
      error('Please fill in all required product fields.')
      return
    }

    if (images.length === 0) {
      error('Please upload at least one main product image.')
      return
    }

    if (hasVariants && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        if (!variants[i].name.trim() && !variants[i].color?.trim() && !variants[i].size?.trim()) {
          error(`Variant #${i + 1} requires a name, color, or size.`)
          return
        }
      }
    }

    setSubmitting(true)
    const originalPrice = Number(form.originalPrice || form.sellingPrice)
    const sellingPrice = Number(form.sellingPrice)
    const discount = Math.max(0, Math.round((1 - sellingPrice / originalPrice) * 100))

    const payload = {
      ...form,
      slug: form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      originalPrice,
      sellingPrice,
      discount,
      stock: Number(form.stock || 0),
      images: images,
      image: images[0],
      sku: form.sku || `SKU-${Date.now().toString().slice(-5)}`,
      hasVariants: hasVariants && variants.length > 0,
      variants: hasVariants
        ? variants.map((v, i) => {
            const vPrice = Number(v.price || sellingPrice)
            const vOrig = Number(v.originalPrice || originalPrice)
            const vDisc =
              v.discount !== undefined
                ? Number(v.discount)
                : Math.max(0, Math.round((1 - vPrice / vOrig) * 100))
            return {
              ...v,
              id: v.id || `var-${Date.now()}-${i}`,
              name: v.name.trim() || `${v.color || ''} ${v.size || ''}`.trim() || `Variant ${i + 1}`,
              price: vPrice,
              originalPrice: vOrig,
              discount: vDisc,
              stock: Number(v.stock ?? form.stock ?? 0),
              images: v.images?.length ? v.images : images,
              image: v.images?.length ? v.images[0] : images[0],
            }
          })
        : [],
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        error(data.error || 'Failed to create product')
        setSubmitting(false)
        return
      }

      success(`Product "${form.name}" created successfully!`)
      router.push('/admin/products')
    } catch {
      error('Network error creating product')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Catalog / Add</p>
            <h1 className="font-serif text-xl">Create New Product</h1>
          </div>
        </div>
        <button
          type="submit"
          form="add-product-form"
          disabled={submitting || uploading}
          className="flex items-center gap-2 bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 shadow-xs cursor-pointer"
        >
          <Save size={16} /> {submitting ? 'Saving…' : 'Save Product'}
        </button>
      </header>

      <div className="mx-auto max-w-5xl p-5 lg:p-8">
        <form id="add-product-form" onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main Form Area */}
          <div className="space-y-6">
            {/* General Info */}
            <div className="border border-border bg-card p-6 space-y-4">
              <h2 className="font-serif text-lg border-b border-border pb-3">Basic Information</h2>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Classic Linen Shirt"
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Brand Name *
                  </label>
                  <input
                    required
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    placeholder="e.g. Northline"
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SKU Code
                  </label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="e.g. NL-SH-019"
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Write a detailed description of the product, fabric, styling tips..."
                  className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary resize-y"
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="border border-border bg-card p-6 space-y-4">
              <h2 className="font-serif text-lg border-b border-border pb-3">Pricing & Inventory</h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    placeholder="1499"
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    placeholder="2499"
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="25"
                    className="w-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            {/* Product Images Upload with Drag & Drop Reordering */}
            <div className="border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="font-serif text-lg">Product Images *</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <strong>Drag & drop</strong> images to reorder them. First image (#1) is automatically the Primary image.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload Images'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {images.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/30 transition rounded-xs"
                >
                  <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-semibold">Click to upload product images</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP supported. Multiple files allowed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, index) => {
                    const isDragging = draggedImgIdx === index
                    const isDragOver = dragOverImgIdx === index
                    return (
                      <div
                        key={img + index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        onDragEnd={() => {
                          setDraggedImgIdx(null)
                          setDragOverImgIdx(null)
                        }}
                        className={`relative aspect-[3/4] border bg-muted group rounded-xs overflow-hidden transition-all duration-200 cursor-grab active:cursor-grabbing ${
                          isDragging
                            ? 'opacity-40 scale-95 border-dashed border-primary ring-2 ring-primary'
                            : isDragOver
                            ? 'border-primary ring-2 ring-primary scale-105 shadow-lg'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        <Image src={img} alt={`Product ${index + 1}`} fill sizes="160px" className="object-cover pointer-events-none" />

                        {/* Position Badge */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-xs shadow-xs uppercase tracking-wider ${
                              index === 0
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-foreground/80 text-background backdrop-blur-xs'
                            }`}
                          >
                            {index === 0 ? 'Primary (#1)' : `#${index + 1}`}
                          </span>
                        </div>

                        {/* Drag Handle Indicator */}
                        <div className="absolute bottom-2 left-2 bg-foreground/60 text-background p-1 rounded-xs opacity-0 group-hover:opacity-100 transition backdrop-blur-xs">
                          <GripVertical size={13} />
                        </div>

                        {/* Top Right Actions: Make Primary + Delete */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition z-10">
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                makePrimary(index)
                              }}
                              className="bg-background/90 hover:bg-background text-foreground p-1.5 rounded-xs shadow-xs transition"
                              title="Set as Primary Image (#1)"
                            >
                              <Star size={12} className="text-amber-500 fill-amber-500" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeImage(index)
                            }}
                            className="bg-destructive text-destructive-foreground p-1.5 rounded-xs shadow-xs hover:opacity-100 transition cursor-pointer"
                            title="Remove Image"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Bottom Left/Right Move Buttons for Quick Precision */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveImage(index, index - 1)
                            }}
                            className="bg-background/90 text-foreground p-1 rounded-xs hover:bg-background disabled:opacity-30 shadow-xs cursor-pointer"
                            title="Move Left / Earlier"
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={index === images.length - 1}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveImage(index, index + 1)
                            }}
                            className="bg-background/90 text-foreground p-1 rounded-xs hover:bg-background disabled:opacity-30 shadow-xs cursor-pointer"
                            title="Move Right / Later"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed border-border hover:border-primary hover:bg-muted/40 transition text-muted-foreground hover:text-foreground text-xs font-semibold gap-1 rounded-xs cursor-pointer"
                  >
                    <Plus size={20} />
                    <span>Add More</span>
                  </button>
                </div>
              )}
            </div>

            {/* Product Variants Section */}
            <div className="border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="font-serif text-lg flex items-center gap-2">
                    <Layers size={18} className="text-primary" /> Product Variants
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add color, size, or custom variants with variant-specific images and pricing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1.5 border border-primary text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition cursor-pointer"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-border">
                  No variants added. Click <strong>+ Add Variant</strong> to create options like Color (Pink, White, Blue) or Size (S, M, L, 1000 ML).
                </div>
              ) : (
                <div className="space-y-5 pt-1">
                  {variants.map((variant, vIdx) => (
                    <div key={variant.id || vIdx} className="border border-border p-4 bg-muted/20 space-y-4 rounded-xs">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Variant #{vIdx + 1}: {variant.name || 'Unnamed Variant'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeVariant(vIdx)}
                          className="text-destructive hover:underline text-xs flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-4">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Variant Name *
                          </label>
                          <input
                            value={variant.name}
                            onChange={(e) => updateVariant(vIdx, 'name', e.target.value)}
                            placeholder="e.g. Pink, 1000 ML"
                            className="w-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Color
                          </label>
                          <input
                            value={variant.color || ''}
                            onChange={(e) => updateVariant(vIdx, 'color', e.target.value)}
                            placeholder="e.g. Pink, White, Blue"
                            className="w-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Size
                          </label>
                          <input
                            value={variant.size || ''}
                            onChange={(e) => updateVariant(vIdx, 'size', e.target.value)}
                            placeholder="e.g. S, M, L, XL, 1000 ML"
                            className="w-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => updateVariant(vIdx, 'stock', Number(e.target.value))}
                            placeholder="10"
                            className="w-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Selling Price (₹)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={variant.price || ''}
                            onChange={(e) => updateVariant(vIdx, 'price', Number(e.target.value))}
                            placeholder={form.sellingPrice || '1499'}
                            className="w-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Original MRP (₹)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={variant.originalPrice || ''}
                            onChange={(e) => updateVariant(vIdx, 'originalPrice', Number(e.target.value))}
                            placeholder={form.originalPrice || '2499'}
                            className="w-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Variant SKU
                          </label>
                          <input
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(vIdx, 'sku', e.target.value)}
                            placeholder="e.g. NL-SH-PNK-01"
                            className="w-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Variant Specific Images with Reordering */}
                      <div className="border-t border-border/70 pt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Variant Images ({variant.images?.length || 0})
                          </span>
                          <label className="inline-flex items-center gap-1.5 bg-background border border-border hover:border-primary px-3 py-1 text-xs font-medium cursor-pointer rounded-xs transition shadow-xs">
                            <Upload size={12} /> Upload Variant Images
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleVariantImageUpload(vIdx, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {variant.images && variant.images.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                            {variant.images.map((img, imgIdx) => (
                              <div key={imgIdx} className="relative aspect-square border border-border bg-background group rounded-xs overflow-hidden">
                                <Image src={img} alt={`Variant ${vIdx} Image ${imgIdx}`} fill sizes="80px" className="object-cover" />
                                <span className="absolute top-1 left-1 bg-foreground/75 text-background text-[9px] font-bold px-1 rounded-xs">
                                  #{imgIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(vIdx, imgIdx)}
                                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-xs opacity-90 hover:opacity-100 transition cursor-pointer"
                                  title="Remove Image"
                                >
                                  <Trash2 size={11} />
                                </button>
                                <div className="absolute bottom-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    type="button"
                                    disabled={imgIdx === 0}
                                    onClick={() => moveVariantImage(vIdx, imgIdx, imgIdx - 1)}
                                    className="bg-background text-foreground p-0.5 rounded-xs disabled:opacity-20 shadow-xs cursor-pointer"
                                    title="Move Left"
                                  >
                                    <ChevronLeft size={10} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={imgIdx === variant.images.length - 1}
                                    onClick={() => moveVariantImage(vIdx, imgIdx, imgIdx + 1)}
                                    className="bg-background text-foreground p-0.5 rounded-xs disabled:opacity-20 shadow-xs cursor-pointer"
                                    title="Move Right"
                                  >
                                    <ChevronRight size={10} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-muted-foreground italic">
                            No variant-specific images uploaded. (Will fallback to main product images if left empty).
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Category & Attributes */}
            <div className="border border-border bg-card p-6 space-y-4">
              <h2 className="font-serif text-lg border-b border-border pb-3">Organization</h2>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-border bg-background px-3 py-2.5 text-sm outline-none font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Subcategory
                </label>
                <input
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                  placeholder="e.g. Shirts, Sneakers..."
                  className="w-full border border-border bg-background px-4 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Badge Label
                </label>
                <select
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  className="w-full border border-border bg-background px-3 py-2 text-sm outline-none font-medium"
                >
                  <option value="Bestseller">Bestseller</option>
                  <option value="New">New</option>
                  <option value="Trending">Trending</option>
                  <option value="30% off">30% off</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
            </div>

            {/* Status */}
            <div className="border border-border bg-card p-6 space-y-4">
              <h2 className="font-serif text-lg border-b border-border pb-3">Status</h2>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium">Active (Visible in Store)</span>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
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
