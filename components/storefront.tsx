'use client'

import React, { useEffect, useMemo, useState, useCallback, memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { CartDrawer, ProductTile } from '@/components/commerce-surfaces'
import { HeroSlider } from '@/components/hero-slider'
import { useCommerce } from '@/components/commerce-provider'
import { categoryNavigation, categoryLabel, slugify } from '@/lib/category-navigation'

type Product = {
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
  badge: string
}

const categories = ['All', 'Women', 'Men', 'Footwear', 'Accessories', 'Jewellery']

export function Storefront() {
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('popular')
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaMenu, setMegaMenu] = useState<string | null>(null)
  const [mobileCategory, setMobileCategory] = useState<string | null>(null)
  const { cartCount, setCartOpen } = useCommerce()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    const params = new URLSearchParams({
      category: category,
      sort: sort,
      limit: '24',
    })
    if (query.trim()) params.set('q', query.trim())

    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => setProducts(data.products ?? []))
      .catch((err) => {
        if (err.name !== 'AbortError') setProducts([])
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [category, query, sort])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium tracking-[0.18em] text-primary-foreground">
        PAN-INDIA DELIVERY · EASY 7-DAY RETURNS · CURATED FOR EVERYDAY
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <button className="lg:hidden p-1" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu size={22} />
          </button>
          <a href="#top" className="font-serif text-2xl font-semibold tracking-tight text-primary">
            nava<span className="text-accent">.</span>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex" onMouseLeave={() => setMegaMenu(null)}>
            <Link href="/#shop" className="hover:text-primary transition">Shop</Link>
            {Object.keys(categoryNavigation).map((slug) => (
              <div key={slug} className="relative" onMouseEnter={() => setMegaMenu(slug)}>
                <Link href={`/category/${slug}`} className="inline-flex items-center gap-1 py-3 hover:text-primary transition">
                  {categoryLabel(slug)}
                  <ChevronDown size={14} />
                </Link>
                {megaMenu === slug && <MegaMenu slug={slug} />}
              </div>
            ))}
            <Link href="/#offers" className="text-accent hover:opacity-80 transition font-semibold">Offers</Link>
          </nav>

          <form action="/search" className="hidden max-w-sm flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 lg:flex shadow-xs">
            <Search size={17} className="text-muted-foreground" />
            <input name="q" defaultValue={query} placeholder="Search products, brands & more" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </form>

          <div className="flex items-center gap-4">
            <button className="lg:hidden p-1" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={21} />
            </button>
            <Link href="/wishlist" aria-label="Wishlist" className="relative p-1 hover:text-accent transition">
              <span className="sr-only">Wishlist</span>
              <span aria-hidden="true" className="text-lg">♡</span>
            </Link>
            <button aria-label="Shopping bag" className="relative p-1 hover:text-primary transition" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={21} strokeWidth={1.7} />
              <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 py-0.2 text-[10px] font-bold text-accent-foreground">
                {cartCount || ''}
              </span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-border px-5 py-3 lg:hidden">
            <form action="/search" className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
              <Search size={17} />
              <input autoFocus name="q" defaultValue={query} placeholder="Search products" className="w-full bg-transparent text-sm outline-none" />
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/30 lg:hidden" onClick={() => setMenuOpen(false)}>
          <aside className="h-full w-80 bg-background p-6 shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="font-serif text-2xl text-primary font-semibold">nava.</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1">
                <X size={20} />
              </button>
            </div>
            <nav className="mt-8 grid gap-4 font-medium text-sm">
              <Link href="/#shop" onClick={() => setMenuOpen(false)} className="py-1">Shop All</Link>
              {Object.keys(categoryNavigation).map((slug) => (
                <div key={slug} className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <Link href={`/category/${slug}`} onClick={() => setMenuOpen(false)}>
                      {categoryLabel(slug)}
                    </Link>
                    <button aria-label={`Expand ${categoryLabel(slug)}`} onClick={() => setMobileCategory(mobileCategory === slug ? null : slug)} className="p-1">
                      <ChevronDown size={17} className={mobileCategory === slug ? 'rotate-180 transition' : 'transition'} />
                    </button>
                  </div>
                  {mobileCategory === slug && (
                    <div className="mt-3 grid gap-2.5 pl-3 text-xs text-muted-foreground">
                      {categoryNavigation[slug].flatMap((group) => group.items.slice(0, 4)).map((item) => (
                        <Link key={item} href={`/category/${slug}/${slugify(item)}`} onClick={() => setMenuOpen(false)}>
                          {item}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/#offers" onClick={() => setMenuOpen(false)} className="text-accent py-1">Offers</Link>
            </nav>
          </aside>
        </div>
      )}

      <main id="top">
        <section className="mx-auto max-w-[1440px] px-5 pt-6 lg:px-10 lg:pt-10">
          <HeroSlider />
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Curated Collections</p>
              <h2 className="mt-2 font-serif text-3xl lg:text-4xl">Shop by Mood</h2>
            </div>
            <a href="#shop" className="hidden items-center gap-2 text-sm font-semibold lg:flex hover:text-primary transition">
              View all <ArrowRight size={16} />
            </a>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            <CategoryTile title="Soft tailoring" image="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80" />
            <CategoryTile title="Off-duty" image="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80" />
            <CategoryTile title="The finishing touch" image="https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=600&q=80" />
            <CategoryTile title="New classics" image="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80" />
          </div>
        </section>

        <section id="shop" className="border-t border-border">
          <div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-16">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">The Edit</p>
                <h2 className="mt-2 font-serif text-3xl lg:text-4xl">Freshly Considered</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      category === item
                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                        : 'border-border bg-background hover:border-primary'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-y border-border py-3">
              <p className="text-xs font-medium text-muted-foreground">
                {loading ? 'Finding pieces for you…' : `${products.length} pieces in this edit`}
              </p>
              <label className="flex items-center gap-2 text-xs font-medium">
                <span className="hidden text-muted-foreground sm:inline">Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent font-semibold outline-none cursor-pointer">
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <ChevronDown size={14} />
              </label>
            </div>

            {loading ? (
              <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse bg-muted rounded-xs" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <p className="font-serif text-2xl">No pieces in this edit.</p>
                <button onClick={() => setCategory('All')} className="bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                  View All Products
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductTile key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="offers" className="mx-auto max-w-[1440px] px-5 pb-16 lg:px-10">
          <div className="flex flex-col justify-between gap-6 bg-accent p-8 text-accent-foreground md:flex-row md:items-center lg:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">Special Offer</p>
              <h2 className="mt-2 font-serif text-3xl">Your first order, made sweeter.</h2>
              <p className="mt-2 text-sm opacity-85">Take 10% off your order with code NAVAWELCOME during checkout.</p>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText('NAVAWELCOME')}
              className="w-fit border border-accent-foreground px-5 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-accent-foreground hover:text-accent transition"
            >
              Copy code: NAVAWELCOME
            </button>
          </div>
        </section>
      </main>

      <CartDrawer />

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 md:grid-cols-4 lg:px-10">
          <div>
            <p className="font-serif text-2xl text-primary font-semibold">nava.</p>
            <p className="mt-4 max-w-xs text-xs leading-6 text-muted-foreground">
              Everyday pieces for the way you actually live. Designed in India, made to move with you.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-foreground">Shop Categories</p>
            <div className="mt-4 grid gap-2.5 text-xs text-muted-foreground">
              <Link href="/category/women" className="hover:text-foreground transition">Women</Link>
              <Link href="/category/men" className="hover:text-foreground transition">Men</Link>
              <Link href="/category/accessories" className="hover:text-foreground transition">Accessories</Link>
              <Link href="/category/footwear" className="hover:text-foreground transition">Footwear</Link>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-foreground">Help & Support</p>
            <div className="mt-4 grid gap-2.5 text-xs text-muted-foreground">
              <a href="#top" className="hover:text-foreground transition">Shipping & Returns</a>
              <a href="#top" className="hover:text-foreground transition">Contact Us</a>
              <a href="#top" className="hover:text-foreground transition">FAQs</a>
              <Link href="/admin" className="hover:text-primary transition font-semibold">Admin Panel</Link>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-foreground">Stay in the Loop</p>
            <p className="mt-4 text-xs leading-6 text-muted-foreground">New drops, thoughtful edits, and special discounts.</p>
            <div className="mt-4 flex border-b border-foreground/30 py-2">
              <input placeholder="Your email address" className="w-full bg-transparent text-xs outline-none" />
              <ArrowRight size={16} className="text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground lg:px-10">
          <div className="mx-auto max-w-[1440px] flex flex-col sm:flex-row justify-between gap-2">
            <span>© 2026 Nava Studio. Built for the everyday.</span>
            <span>Fast · Responsive · Modern</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

const MegaMenu = memo(function MegaMenu({ slug }: { slug: string }) {
  const groups = categoryNavigation[slug] ?? []
  return (
    <div className="absolute left-1/2 top-full z-40 hidden w-[min(860px,calc(100vw-40px))] -translate-x-1/2 border border-border bg-card p-6 shadow-2xl lg:block animate-in fade-in-50 duration-200">
      <div className="grid grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.title}>
            <Link href={`/category/${slug}/${slugify(group.title)}`} className="text-xs font-bold uppercase tracking-wider text-accent">
              {group.title}
            </Link>
            <div className="mt-3 grid gap-2">
              {group.items.map((item) => (
                <Link key={item} href={`/category/${slug}/${slugify(item)}`} className="text-xs text-muted-foreground transition hover:text-foreground">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})

const CategoryTile = memo(function CategoryTile({ title, image }: { title: string; image: string }) {
  const category = title === 'Soft tailoring' ? 'women' : title === 'Off-duty' ? 'men' : title === 'The finishing touch' ? 'beauty' : 'home'
  return (
    <Link href={`/category/${category}`} className="group relative aspect-[4/5] overflow-hidden bg-muted border border-border">
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        loading="lazy"
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
      <span className="absolute bottom-4 left-4 font-serif text-xl text-background font-medium leading-tight">{title}</span>
    </Link>
  )
})
