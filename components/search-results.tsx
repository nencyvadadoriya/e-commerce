'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react'
import { ProductTile } from '@/components/commerce-surfaces'
import type { CommerceProduct } from '@/components/commerce-provider'

export function SearchResults({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [products, setProducts] = useState<CommerceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Debounce query changes by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(handler)
  }, [query])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(false)

    fetch(`/api/products?q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Search failed')
        return res.json()
      })
      .then((data) => setProducts(data.products ?? []))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(true)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [debouncedQuery])

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border px-5 py-4 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4">
          <Link href="/" aria-label="Back to home" className="rounded-full border border-border p-2 hover:bg-muted transition">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-1 items-center gap-3 rounded-full border border-primary bg-card px-4 py-2.5 shadow-xs">
            <Search size={18} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands and more..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-10">
        <div className="flex items-end justify-between border-b border-border pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Search results</p>
            <h1 className="mt-2 font-serif text-4xl">
              {debouncedQuery ? `Results for “${debouncedQuery}”` : 'All products'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {loading ? 'Finding pieces for you…' : `${products.length} pieces found`}
            </p>
          </div>
        </div>

        {error ? (
          <div className="py-24 text-center space-y-4">
            <h2 className="font-serif text-3xl">We couldn&apos;t load those results.</h2>
            <Link href="/" className="inline-block bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Back to shopping
            </Link>
          </div>
        ) : loading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] animate-pulse bg-muted rounded-xs" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <h2 className="font-serif text-3xl">No pieces found.</h2>
            <p className="text-sm text-muted-foreground">Try searching another product name, brand, or category.</p>
            <Link href="/" className="inline-block bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
