'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { ProductDetailClient } from '@/components/product-detail-client'
import type { ProductItem } from '@/lib/data-store'

export function ProductDetailLoader({ productId }: { productId: string }) {
  const [product, setProduct] = useState<ProductItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${encodeURIComponent(productId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        if (data.product) {
          setProduct(data.product)
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading product details…</p>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground" />
          <h1 className="font-serif text-3xl">Product Not Found</h1>
          <p className="text-sm text-muted-foreground">
            The piece you are looking for might have been moved or is currently unavailable.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-xs font-semibold text-primary-foreground hover:opacity-90 transition shadow-xs"
          >
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>
      </main>
    )
  }

  return <ProductDetailClient product={product} />
}
