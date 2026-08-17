'use client'

import React, { useEffect, useState, useCallback, memo } from 'react'
import { ChevronDown, ChevronRight, Filter, SlidersHorizontal, X } from 'lucide-react'
import { ProductTile } from '@/components/commerce-surfaces'
import { CartDrawer } from '@/components/commerce-surfaces'
import { Pagination } from '@/components/pagination'
import { StoreHeader } from '@/components/storefront'
import { categoryNavigation, categoryLabel, slugify } from '@/lib/category-navigation'
import type { Metadata } from 'next'

const PAGE_SIZE = 12

type Product = {
  id: string
  name: string
  brand: string
  category: string
  subcategory?: string
  originalPrice: number
  sellingPrice: number
  rating: number
  reviewCount: number
  stock: number
  image: string
  images?: string[]
  badge: string
  hasVariants?: boolean
  variants?: { id: string; name: string; stock: number; images: string[]; color?: string; size?: string; price?: number; originalPrice?: number; discount?: number; sku?: string; image?: string }[]
}

type FilterState = {
  category: string   // e.g. 'women'
  subcategory: string // e.g. 'Dresses'
  sort: string
  page: number
}

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    subcategory: '',
    sort: 'popular',
    page: 1,
  })

  // Which category accordion is open in sidebar
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : (value as number) }))
  }, [])

  const selectCategory = useCallback((catSlug: string) => {
    setFilters((prev) => ({
      ...prev,
      category: catSlug,
      subcategory: '',
      page: 1,
    }))
    setExpandedCategory(catSlug === 'all' ? null : catSlug)
  }, [])

  const selectSubcategory = useCallback((sub: string) => {
    setFilters((prev) => ({ ...prev, subcategory: sub, page: 1 }))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    const params = new URLSearchParams({
      sort: filters.sort,
      limit: String(PAGE_SIZE),
      page: String(filters.page),
    })
    if (filters.category && filters.category !== 'all') {
      // map slug → category name used in product data (e.g. 'women' → 'Women')
      params.set('category', categoryLabel(filters.category))
    }
    if (filters.subcategory) {
      params.set('subcategory', filters.subcategory)
    }

    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then((data) => {
        setProducts(data.products ?? [])
        setTotal(data.total ?? 0)
        setPages(data.pages ?? 1)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') { setProducts([]); setTotal(0) }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [filters])

  const categoryEntries = Object.entries(categoryNavigation) // [slug, groups[]]

  const activeCategoryLabel =
    filters.category === 'all'
      ? 'All Products'
      : categoryLabel(filters.category)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader />

      {/* Page hero strip */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Everything</p>
          <h1 className="mt-1 font-serif text-3xl lg:text-4xl">Shop All</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? 'Loading collection…' : `${total} piece${total !== 1 ? 's' : ''} in the edit`}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 lg:px-10">
        {/* Mobile filter bar */}
        <div className="flex items-center justify-between border-b border-border py-3 lg:hidden">
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-semibold hover:border-primary transition"
          >
            <SlidersHorizontal size={14} />
            Filter{filters.category !== 'all' || filters.subcategory ? ' (active)' : ''}
          </button>
          <label className="flex items-center gap-2 text-xs font-medium">
            <span className="text-muted-foreground">Sort</span>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="bg-transparent font-semibold outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={13} />
          </label>
        </div>

        <div className="flex gap-8 py-8 lg:py-10">
          {/* ── Left Sidebar (desktop) ── */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-24">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Categories</p>

              {/* All products */}
              <button
                onClick={() => selectCategory('all')}
                className={`w-full text-left py-1.5 px-2 rounded-sm text-sm font-medium transition mb-1 ${
                  filters.category === 'all'
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                All Products
              </button>

              {/* Category accordion list */}
              {categoryEntries.map(([slug, groups]) => (
                <CategoryAccordion
                  key={slug}
                  slug={slug}
                  groups={groups}
                  activeCategory={filters.category}
                  activeSubcategory={filters.subcategory}
                  expanded={expandedCategory === slug}
                  onToggle={() => {
                    if (expandedCategory === slug) {
                      setExpandedCategory(null)
                    } else {
                      setExpandedCategory(slug)
                      // also filter by category when expanding
                      selectCategory(slug)
                    }
                  }}
                  onSelectSubcategory={selectSubcategory}
                />
              ))}
            </div>
          </aside>

          {/* ── Right: sort bar + product grid ── */}
          <div className="min-w-0 flex-1">
            {/* Desktop sort bar */}
            <div className="hidden items-center justify-between border-b border-border pb-4 mb-8 lg:flex">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{activeCategoryLabel}</span>
                {filters.subcategory && (
                  <> · <span className="text-primary font-semibold">{filters.subcategory}</span></>
                )}
              </p>
              <div className="flex items-center gap-4">
                {(filters.category !== 'all' || filters.subcategory) && (
                  <button
                    onClick={() => { selectCategory('all'); setExpandedCategory(null) }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition"
                  >
                    <X size={12} /> Clear filters
                  </button>
                )}
                <label className="flex items-center gap-2 text-xs font-medium">
                  <span className="text-muted-foreground">Sort by</span>
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="bg-transparent font-semibold outline-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown size={13} />
                </label>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse bg-muted rounded-xs" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
                <p className="font-serif text-2xl">Nothing here yet.</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  We couldn&apos;t find any products matching your filters. Try a different category.
                </p>
                <button
                  onClick={() => { selectCategory('all'); setExpandedCategory(null) }}
                  className="bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductTile key={product.id} product={product} />
                ))}
              </div>
            )}

            <Pagination
              page={filters.page}
              pages={pages}
              onPageChange={(p) => updateFilter('page', p)}
            />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 lg:hidden"
          onClick={() => setFilterDrawerOpen(false)}
        >
          <aside
            className="ml-auto h-full w-72 overflow-y-auto bg-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-base">Filter by Category</span>
              <button onClick={() => setFilterDrawerOpen(false)} className="p-1">
                <X size={20} />
              </button>
            </div>

            <button
              onClick={() => { selectCategory('all'); setFilterDrawerOpen(false) }}
              className={`w-full text-left py-2 px-3 rounded-sm text-sm font-medium mb-2 transition ${
                filters.category === 'all' ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted'
              }`}
            >
              All Products
            </button>

            {categoryEntries.map(([slug, groups]) => (
              <MobileFilterAccordion
                key={slug}
                slug={slug}
                groups={groups}
                activeCategory={filters.category}
                activeSubcategory={filters.subcategory}
                onSelectCategory={(s) => { selectCategory(s); setExpandedCategory(s) }}
                onSelectSubcategory={(sub) => { selectSubcategory(sub); setFilterDrawerOpen(false) }}
              />
            ))}

            {(filters.category !== 'all' || filters.subcategory) && (
              <button
                onClick={() => { selectCategory('all'); setExpandedCategory(null); setFilterDrawerOpen(false) }}
                className="mt-6 w-full border border-border py-2.5 text-xs font-semibold hover:border-primary transition"
              >
                Clear all filters
              </button>
            )}
          </aside>
        </div>
      )}

      <CartDrawer />

      <footer className="border-t border-border bg-card mt-8">
        <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="font-serif text-lg text-primary font-semibold">nava.</span>
            <span>© 2026 Nava Studio. Everyday pieces, thoughtfully made.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── Desktop Category Accordion ── */
type AccordionProps = {
  slug: string
  groups: { title: string; items: string[] }[]
  activeCategory: string
  activeSubcategory: string
  expanded: boolean
  onToggle: () => void
  onSelectSubcategory: (sub: string) => void
}

const CategoryAccordion = memo(function CategoryAccordion({
  slug, groups, activeCategory, activeSubcategory, expanded, onToggle, onSelectSubcategory
}: AccordionProps) {
  const isActive = activeCategory === slug
  const allSubItems = groups.flatMap((g) => g.items)

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm font-medium transition ${
          isActive ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground'
        }`}
      >
        <span>{categoryLabel(slug)}</span>
        <ChevronRight
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      {expanded && (
        <div className="ml-3 mt-1 mb-2 border-l border-border pl-3 grid gap-0.5">
          {/* "All [category]" option */}
          <button
            onClick={() => onSelectSubcategory('')}
            className={`text-left py-1 px-2 rounded-sm text-xs transition ${
              isActive && !activeSubcategory
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All {categoryLabel(slug)}
          </button>
          {allSubItems.map((item) => (
            <button
              key={item}
              onClick={() => onSelectSubcategory(item)}
              className={`text-left py-1 px-2 rounded-sm text-xs transition ${
                activeSubcategory === item
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

/* ── Mobile Filter Accordion ── */
type MobileAccordionProps = {
  slug: string
  groups: { title: string; items: string[] }[]
  activeCategory: string
  activeSubcategory: string
  onSelectCategory: (slug: string) => void
  onSelectSubcategory: (sub: string) => void
}

const MobileFilterAccordion = memo(function MobileFilterAccordion({
  slug, groups, activeCategory, activeSubcategory, onSelectCategory, onSelectSubcategory
}: MobileAccordionProps) {
  const [open, setOpen] = useState(activeCategory === slug)
  const isActive = activeCategory === slug
  const allSubItems = groups.flatMap((g) => g.items)

  return (
    <div className="border-b border-border py-2">
      <button
        onClick={() => { setOpen((o) => !o); if (!open) onSelectCategory(slug) }}
        className={`flex w-full items-center justify-between py-1.5 text-sm font-medium transition ${isActive ? 'text-primary' : ''}`}
      >
        <span>{categoryLabel(slug)}</span>
        <ChevronDown size={15} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-2 ml-2 grid gap-1 pb-2">
          <button
            onClick={() => { onSelectSubcategory(''); onSelectCategory(slug) }}
            className={`text-left py-1 px-2 text-xs rounded-sm ${isActive && !activeSubcategory ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All {categoryLabel(slug)}
          </button>
          {allSubItems.map((item) => (
            <button
              key={item}
              onClick={() => onSelectSubcategory(item)}
              className={`text-left py-1 px-2 text-xs rounded-sm transition ${
                activeSubcategory === item ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
