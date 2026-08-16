'use client'

import { useEffect } from 'react'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { useEffect(() => { console.error('[v0] category route failed') }, []); return <main className="flex min-h-screen items-center justify-center px-5 text-center"><div><p className="text-xs uppercase tracking-[0.18em] text-destructive">Catalog unavailable</p><h1 className="mt-3 font-serif text-4xl">We could not load this collection.</h1><button onClick={() => reset()} className="mt-7 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Try again</button></div></main> }
