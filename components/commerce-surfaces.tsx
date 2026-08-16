'use client'

import React, { useState, memo, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCommerce, formatMoney, getDiscount, type CommerceProduct } from '@/components/commerce-provider'

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, appliedCoupon, applyCoupon, removeCoupon } = useCommerce()
  const [couponCode, setCouponCode] = useState('')
  const [loadingCoupon, setLoadingCoupon] = useState(false)

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0), [cart])
  const savings = useMemo(() => cart.reduce((sum, item) => sum + (Math.max(0, item.originalPrice - item.sellingPrice)) * item.quantity, 0), [cart])
  const discount = appliedCoupon?.discount || 0
  const finalTotal = Math.max(0, subtotal - discount)
  const totalItemCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart])

  const handleApplyCoupon = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    setLoadingCoupon(true)
    await applyCoupon(couponCode.trim())
    setLoadingCoupon(false)
    setCouponCode('')
  }, [couponCode, applyCoupon])

  if (!cartOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-xs" onClick={() => setCartOpen(false)}>
      <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-background shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">Your Edit</p>
            <h2 className="mt-1 font-serif text-2xl">Shopping Bag ({totalItemCount})</h2>
          </div>
          <button aria-label="Close shopping bag" onClick={() => setCartOpen(false)} className="rounded-full border border-border p-2 hover:bg-muted transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShoppingBag size={40} className="text-muted-foreground" />
            <p className="font-serif text-2xl">Your bag is waiting.</p>
            <p className="text-sm text-muted-foreground">Add pieces from the catalog to begin your order.</p>
            <button onClick={() => setCartOpen(false)} className="bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition cursor-pointer">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {cart.map((item) => (
                <div key={item.cartItemId} className="flex gap-4 border-b border-border pb-4">
                  <div className="relative h-24 w-20 shrink-0 bg-muted border border-border rounded-xs overflow-hidden">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=300&q=80'}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{item.brand}</p>
                        <h3 className="mt-0.5 truncate text-sm font-medium">{item.name}</h3>
                        {item.variantName && (
                          <span className="inline-block mt-1 text-[11px] font-semibold bg-muted px-2 py-0.5 border border-border text-foreground">
                            Variant: {item.variantName}
                          </span>
                        )}
                      </div>
                      <button aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.cartItemId)} className="text-muted-foreground hover:text-destructive cursor-pointer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">{formatMoney(item.sellingPrice)}</p>
                      <div className="flex items-center gap-2.5">
                        <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="rounded-full border border-border p-1 hover:bg-muted cursor-pointer">
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-semibold">{item.quantity}</span>
                        <button aria-label="Increase quantity" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="rounded-full border border-border p-1 hover:bg-muted cursor-pointer">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code (e.g. NAVAWELCOME)"
                    className="flex-1 border border-border bg-background px-3 py-2 text-xs font-mono uppercase outline-none focus:border-primary"
                  />
                  <button type="submit" disabled={loadingCoupon} className="bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground cursor-pointer">
                    {loadingCoupon ? '...' : 'Apply'}
                  </button>
                </form>
                {appliedCoupon && (
                  <div className="mt-2 flex items-center justify-between bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs">
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{appliedCoupon.discount})</span>
                    <button type="button" onClick={removeCoupon} className="text-destructive font-semibold cursor-pointer">Remove</button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border p-6 space-y-3 bg-muted/20">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-accent font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatMoney(discount)}</span>
                </div>
              )}
              {savings > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Total MRP Savings</span>
                  <span className="text-accent font-semibold">{formatMoney(savings)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold border-t border-border pt-2">
                <span>Total</span>
                <span>{formatMoney(finalTotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Shipping and taxes confirmed at checkout.</p>
              <Link href="/checkout" onClick={() => setCartOpen(false)} className="mt-4 flex items-center justify-center gap-2 bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shadow-xs">
                Go to Checkout <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export const ProductTile = memo(function ProductTile({ product }: { product: CommerceProduct }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCommerce()
  const liked = isWishlisted(product.id)
  const discount = useMemo(() => getDiscount(product), [product])
  const primaryImage = product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted border border-border rounded-xs">
        <Link href={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="lazy"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        <div className="absolute left-3 top-3 bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-wider border border-border">
          {product.badge || 'New'}
        </div>
        <button
          onClick={() => toggleWishlist(product)}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-3 top-3 rounded-full bg-background/90 p-2 shadow-xs transition hover:scale-110 cursor-pointer"
        >
          <Heart size={16} className={liked ? 'fill-accent text-accent' : 'text-foreground'} />
        </button>
        {product.stock > 0 ? (
          <Link
            href={`/product/${product.id}`}
            className="absolute bottom-3 left-3 right-3 translate-y-2 bg-background py-2.5 text-center text-xs font-semibold opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 shadow-md hover:bg-primary hover:text-primary-foreground"
          >
            {product.hasVariants || (product.variants && product.variants.length > 0) ? 'View Options' : 'Select Options'}
          </Link>
        ) : (
          <div className="absolute bottom-3 left-3 right-3 bg-background/90 py-2 text-center text-xs font-semibold text-destructive">
            Out of Stock
          </div>
        )}
      </div>
      <div className="pt-3">
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">{product.brand}</p>
        <Link href={`/product/${product.id}`} className="mt-1 block truncate text-sm font-medium hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold">{formatMoney(product.sellingPrice)}</span>
          {product.originalPrice > product.sellingPrice && (
            <>
              <span className="text-xs text-muted-foreground line-through">{formatMoney(product.originalPrice)}</span>
              <span className="text-[11px] font-semibold text-accent">{discount}% off</span>
            </>
          )}
        </div>
      </div>
    </article>
  )
})
