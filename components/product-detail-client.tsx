'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Star,
  Truck,
  RefreshCw,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Zap,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Check,
} from 'lucide-react'
import { useCommerce, formatMoney, getDiscount } from '@/components/commerce-provider'
import type { ProductItem, ProductVariant } from '@/lib/data-store'
import { useToast } from '@/components/toast-provider'

export function ProductDetailClient({ product }: { product: ProductItem }) {
  const router = useRouter()
  const { addToCart, toggleWishlist, isWishlisted } = useCommerce()
  const { showToast } = useToast()

  const hasVariants = Boolean(product.hasVariants && product.variants && product.variants.length > 0)
  const variants = useMemo(() => product.variants || [], [product.variants])

  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    hasVariants && variants.length > 0 ? variants[0] : null
  )

  // Determine current active images
  const currentImages = useMemo(() => {
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images
    }
    if (product.images && product.images.length > 0) {
      return product.images
    }
    if (product.image) {
      return [product.image]
    }
    return ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85']
  }, [selectedVariant, product.images, product.image])

  // Current active main image in gallery
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Reset main image when variant changes
  useEffect(() => {
    setActiveImageIndex(0)
  }, [selectedVariant])

  const [quantity, setQuantity] = useState(1)

  // Extract distinct colors and sizes from variants if available
  const availableColors = useMemo(() => {
    const colors = variants.map((v) => v.color).filter(Boolean) as string[]
    return Array.from(new Set(colors))
  }, [variants])

  const availableSizes = useMemo(() => {
    const sizes = variants.map((v) => v.size).filter(Boolean) as string[]
    return Array.from(new Set(sizes))
  }, [variants])

  // Current pricing & stock based on selected variant
  const currentPrice = selectedVariant?.price ?? product.sellingPrice
  const currentOriginalPrice = selectedVariant?.originalPrice ?? product.originalPrice ?? currentPrice
  const currentStock = selectedVariant?.stock ?? product.stock
  const discount = getDiscount({ originalPrice: currentOriginalPrice, sellingPrice: currentPrice })
  const isLiked = isWishlisted(product.id)

  const handleSelectColor = (color: string) => {
    const match = variants.find((v) => v.color === color)
    if (match) setSelectedVariant(match)
  }

  const handleSelectSize = (size: string) => {
    const match = variants.find((v) => {
      if (selectedVariant?.color) {
        return v.color === selectedVariant.color && v.size === size
      }
      return v.size === size
    }) || variants.find((v) => v.size === size)
    if (match) setSelectedVariant(match)
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length)
  }

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % currentImages.length)
  }

  const handleAddToCart = () => {
    const commerceProduct = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      originalPrice: product.originalPrice,
      sellingPrice: product.sellingPrice,
      rating: product.rating,
      reviewCount: product.reviewCount,
      stock: product.stock,
      image: currentImages[0],
      badge: product.badge,
    }
    addToCart(commerceProduct, selectedVariant, quantity)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      showToast('Link copied to clipboard!', 'info')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="border-b border-border bg-card sticky top-0 z-30 backdrop-blur-xs bg-background/95">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-10">
          <Link href="/" className="font-serif text-2xl font-semibold text-primary">
            nava<span className="text-accent">.</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              title="Share link"
            >
              <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
            </button>
            <Link href="/" className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition">
              <ArrowLeft size={16} /> Back to Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Main Product Container */}
      <div className="mx-auto max-w-[1400px] px-5 py-8 lg:px-10 lg:py-12">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-foreground capitalize">{product.category}</Link>
          {product.subcategory && (
            <>
              <span>/</span>
              <span className="text-foreground">{product.subcategory}</span>
            </>
          )}
          <span>/</span>
          <span className="truncate text-foreground font-medium max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          {/* LEFT: Product Images Gallery */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnail Strip */}
            {currentImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] pb-2 sm:pb-0 sm:w-20 shrink-0">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[3/4] w-16 sm:w-full shrink-0 border overflow-hidden rounded-xs cursor-pointer transition ${
                      activeImageIndex === idx
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Display */}
            <div className="relative flex-1 aspect-[3/4] min-h-[420px] max-h-[680px] bg-muted border border-border rounded-xs overflow-hidden group">
              <Image
                src={currentImages[activeImageIndex] || currentImages[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badge */}
              <div className="absolute left-4 top-4 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wider border border-border shadow-xs">
                {product.badge || 'New'}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    originalPrice: product.originalPrice,
                    sellingPrice: product.sellingPrice,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    stock: product.stock,
                    image: currentImages[0],
                    badge: product.badge,
                  })
                }
                className="absolute right-4 top-4 rounded-full bg-background/90 p-2.5 shadow-md hover:scale-110 transition cursor-pointer"
                title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={18} className={isLiked ? 'fill-accent text-accent' : 'text-foreground'} />
              </button>

              {/* Prev / Next controls for multiple images */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background p-2 text-foreground shadow-md transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 hover:bg-background p-2 text-foreground shadow-md transition opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-foreground/60 text-background px-2.5 py-0.5 text-[11px] font-medium rounded-full backdrop-blur-xs">
                    {activeImageIndex + 1} / {currentImages.length}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Product Details & Purchase Actions */}
          <div className="flex flex-col justify-start space-y-6">
            {/* Header info */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                {product.brand} · {product.category}
              </p>
              <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight">
                {product.name}
              </h1>

              <div className="mt-3.5 flex items-center gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-xs font-semibold">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span>{product.rating || 4.8}</span>
                </div>
                <span className="text-muted-foreground">({product.reviewCount || 128} verified reviews)</span>
                <span className="text-border">|</span>
                <span className="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs">
                  {currentStock > 0 ? `${currentStock} in stock` : 'Sold out'}
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 border-y border-border py-4 bg-muted/10 px-4 rounded-xs">
              <span className="text-3xl sm:text-4xl font-semibold">{formatMoney(currentPrice)}</span>
              {currentOriginalPrice > currentPrice && (
                <>
                  <span className="text-base sm:text-lg text-muted-foreground line-through">
                    {formatMoney(currentOriginalPrice)}
                  </span>
                  <span className="text-xs font-bold text-accent border border-accent/40 bg-accent/10 px-2.5 py-1 uppercase tracking-wider rounded-xs">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            {/* VARIANTS SECTION */}
            {hasVariants && variants.length > 0 && (
              <div className="space-y-4 border-t border-border pt-4">
                {/* Variant Selector: Color */}
                {availableColors.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Select Color: <strong className="text-foreground">{selectedVariant?.color || 'Selected'}</strong>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {availableColors.map((color) => {
                        const isSelected = selectedVariant?.color === color
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleSelectColor(color)}
                            className={`px-4 py-2 text-xs font-semibold border transition rounded-xs cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                : 'border-border bg-background hover:border-primary text-foreground'
                            }`}
                          >
                            {color}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Variant Selector: Size */}
                {availableSizes.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Select Size / Unit: <strong className="text-foreground">{selectedVariant?.size || 'Selected'}</strong>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {availableSizes.map((size) => {
                        const isSelected = selectedVariant?.size === size
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSelectSize(size)}
                            className={`min-w-12 px-3.5 py-2 text-xs font-semibold border text-center transition rounded-xs cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                : 'border-border bg-background hover:border-primary text-foreground'
                            }`}
                          >
                            {size}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Fallback to Variant Name Buttons if no separate color/size */}
                {availableColors.length === 0 && availableSizes.length === 0 && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      Select Variant: <strong className="text-foreground">{selectedVariant?.name}</strong>
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {variants.map((v) => {
                        const isSelected = selectedVariant?.id === v.id
                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariant(v)}
                            className={`px-4 py-2 text-xs font-semibold border transition rounded-xs cursor-pointer ${
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                                : 'border-border bg-background hover:border-primary text-foreground'
                            }`}
                          >
                            {v.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-4 border-t border-border pt-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity:</span>
                <div className="flex items-center border border-border bg-card rounded-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={quantity >= currentStock}
                    className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                {selectedVariant && (
                  <span className="text-xs text-muted-foreground">
                    Selected: <strong>{selectedVariant.name}</strong>
                  </span>
                )}
              </div>

              {/* Buttons: Add to Bag + Buy Now */}
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  className="flex items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  <span>{currentStock > 0 ? 'Add to Bag' : 'Out of Stock'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={currentStock <= 0}
                  className="flex items-center justify-center gap-2 border-2 border-primary bg-background px-6 py-4 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Zap size={18} />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Assurance Badges */}
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-6 text-center text-xs text-muted-foreground bg-muted/20 p-4 rounded-xs">
              <div className="flex flex-col items-center gap-1.5">
                <Truck size={18} className="text-primary" />
                <span className="font-medium text-foreground">Pan-India Delivery</span>
                <span className="text-[10px]">Express shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 border-x border-border">
                <RefreshCw size={18} className="text-primary" />
                <span className="font-medium text-foreground">7-Day Easy Returns</span>
                <span className="text-[10px]">Hassle-free pickup</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck size={18} className="text-primary" />
                <span className="font-medium text-foreground">100% Genuine</span>
                <span className="text-[10px]">Direct from studio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
