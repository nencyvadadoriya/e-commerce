'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { ProductTile } from '@/components/commerce-surfaces'
import { useCommerce } from '@/components/commerce-provider'

export default function WishlistPage() {
  const { wishlist } = useCommerce()
  return <main className="min-h-screen bg-background"><header className="border-b border-border bg-card"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 lg:px-10"><Link href="/" className="font-serif text-2xl font-semibold text-primary">nava<span className="text-accent">.</span></Link><Link href="/" className="text-sm font-semibold">Continue shopping</Link></div></header><div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-10 lg:py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Saved for later</p><h1 className="mt-2 font-serif text-4xl">Your wishlist</h1>{wishlist.length ? <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 lg:grid-cols-4">{wishlist.map((product) => <ProductTile key={product.id} product={product} />)}</div> : <div className="flex min-h-[360px] flex-col items-center justify-center text-center"><Heart size={38} className="text-muted-foreground" /><h2 className="mt-5 font-serif text-3xl">Nothing saved yet.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Tap the heart on anything that feels like you. We’ll keep it here.</p><Link href="/" className="mt-6 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Explore the edit</Link></div>}</div></main>
}
