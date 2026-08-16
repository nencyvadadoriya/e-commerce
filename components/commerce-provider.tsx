'use client'

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useToast } from '@/components/toast-provider'
import type { ProductVariant } from '@/lib/data-store'

export type CommerceProduct = {
  id: string
  name: string
  brand: string
  category: string
  originalPrice: number
  sellingPrice: number
  rating: number
  reviewCount: number
  stock: number
  image: string
  images?: string[]
  badge: string
  description?: string
  hasVariants?: boolean
  variants?: ProductVariant[]
  variantId?: string
  variantName?: string
}

export type CartItem = {
  cartItemId: string
  id: string
  name: string
  brand: string
  category: string
  originalPrice: number
  sellingPrice: number
  stock: number
  image: string
  badge?: string
  quantity: number
  variantId?: string
  variantName?: string
}

type CommerceContextValue = {
  cart: CartItem[]
  wishlist: CommerceProduct[]
  cartCount: number
  cartOpen: boolean
  appliedCoupon: { code: string; discount: number } | null
  setCartOpen: (open: boolean) => void
  addToCart: (product: CommerceProduct, variant?: ProductVariant | null, quantity?: number) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  removeFromCart: (cartItemId: string) => void
  toggleWishlist: (product: CommerceProduct) => void
  isWishlisted: (id: string) => boolean
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>
  removeCoupon: () => void
  clearCart: () => void
}

const CommerceContext = createContext<CommerceContextValue | null>(null)
const CART_KEY = 'nava-cart-v2'
const WISHLIST_KEY = 'nava-wishlist-v2'

export function CommerceProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<CommerceProduct[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY)
      const savedWishlist = localStorage.getItem(WISHLIST_KEY)
      if (savedCart) setCart(JSON.parse(savedCart))
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    } catch {}
  }, [cart])

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist))
    } catch {}
  }, [wishlist])

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])

  const addToCart = useCallback((product: CommerceProduct, variant?: ProductVariant | null, quantity = 1) => {
    const activePrice = variant?.price ?? product.sellingPrice
    const activeOriginalPrice = variant?.originalPrice ?? product.originalPrice ?? activePrice
    const activeStock = variant?.stock ?? product.stock
    const activeImage = variant?.images?.[0] || variant?.image || product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'
    const cartItemId = variant ? `${product.id}-${variant.id}` : product.id

    if (activeStock <= 0) {
      showToast(`${product.name}${variant ? ` (${variant.name})` : ''} is currently out of stock.`, 'error')
      return
    }

    setCart((current) => {
      const found = current.find((item) => item.cartItemId === cartItemId)
      if (found) {
        return current.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: Math.min(item.quantity + quantity, activeStock) }
            : item
        )
      }

      const newItem: CartItem = {
        cartItemId,
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        sellingPrice: activePrice,
        originalPrice: activeOriginalPrice,
        stock: activeStock,
        image: activeImage,
        badge: product.badge,
        quantity: Math.min(quantity, activeStock),
        variantId: variant?.id,
        variantName: variant?.name,
      }
      return [...current, newItem]
    })

    const title = variant ? `${product.name} (${variant.name})` : product.name
    showToast(`Added ${title} to bag`, 'success')
    setCartOpen(true)
  }, [showToast])

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item))
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart((current) => {
      const item = current.find((i) => i.cartItemId === cartItemId)
      if (item) showToast(`Removed ${item.name}${item.variantName ? ` (${item.variantName})` : ''} from bag`, 'info')
      return current.filter((i) => i.cartItemId !== cartItemId)
    })
  }, [showToast])

  const toggleWishlist = useCallback((product: CommerceProduct) => {
    setWishlist((current) => {
      const exists = current.some((item) => item.id === product.id)
      showToast(exists ? `Removed ${product.name} from wishlist` : `Added ${product.name} to wishlist`, exists ? 'info' : 'success')
      return exists ? current.filter((item) => item.id !== product.id) : [...current, product]
    })
  }, [showToast])

  const isWishlisted = useCallback((id: string) => wishlist.some((item) => item.id === id), [wishlist])

  const applyCoupon = useCallback(async (code: string) => {
    const subtotal = cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', code, cartTotal: subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Invalid coupon code', 'error')
        return { success: false, message: data.error || 'Invalid coupon code' }
      }
      setAppliedCoupon({ code: data.coupon.code, discount: data.discount })
      showToast(`Coupon ${data.coupon.code} applied! Saved ₹${data.discount}`, 'success')
      return { success: true, message: 'Coupon applied successfully' }
    } catch {
      showToast('Failed to apply coupon', 'error')
      return { success: false, message: 'Failed to apply coupon' }
    }
  }, [cart, showToast])

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null)
    showToast('Coupon removed', 'info')
  }, [showToast])

  const clearCart = useCallback(() => {
    setCart([])
    setAppliedCoupon(null)
  }, [])

  const value = useMemo(() => ({
    cart,
    wishlist,
    cartCount,
    cartOpen,
    appliedCoupon,
    setCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    isWishlisted,
    applyCoupon,
    removeCoupon,
    clearCart,
  }), [cart, wishlist, cartCount, cartOpen, appliedCoupon, addToCart, updateQuantity, removeFromCart, toggleWishlist, isWishlisted, applyCoupon, removeCoupon, clearCart])

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
}

export function useCommerce() {
  const context = useContext(CommerceContext)
  if (!context) throw new Error('useCommerce must be used inside CommerceProvider')
  return context
}

export const formatMoney = (value: number) => `₹${value.toLocaleString('en-IN')}`
export const getDiscount = (product: { originalPrice: number; sellingPrice: number }) => {
  if (!product.originalPrice || product.originalPrice <= product.sellingPrice) return 0
  return Math.round((1 - product.sellingPrice / product.originalPrice) * 100)
}
