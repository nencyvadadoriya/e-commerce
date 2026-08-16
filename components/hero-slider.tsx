'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

type Banner = {
  id: string
  title: string
  eyebrow: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  active: boolean
}

const defaultSlides: Banner[] = [
  { id: '1', eyebrow: 'The new everyday', title: 'Made for your pace.', description: 'Thoughtful essentials, considered details, and pieces that stay with you.', image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1600&q=80', buttonText: 'Explore the edit', buttonLink: '#shop', active: true },
  { id: '2', eyebrow: 'Soft structure', title: 'A little more considered.', description: 'Easy layers and quiet details for days that move at their own rhythm.', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=80', buttonText: 'Shop Women', buttonLink: '/category/women', active: true },
  { id: '3', eyebrow: 'Off-duty edit', title: 'The art of doing less.', description: 'Relaxed silhouettes, useful textures, and the pieces you reach for again.', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80', buttonText: 'Shop Men', buttonLink: '/category/men', active: true },
  { id: '4', eyebrow: 'New classics', title: 'Keep the good things close.', description: 'Objects and accessories that finish the day without trying too hard.', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80', buttonText: 'Shop Accessories', buttonLink: '/category/accessories', active: true },
]

export function HeroSlider() {
  const [slides, setSlides] = useState<Banner[]>(defaultSlides)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/banners', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.banners?.length > 0) setSlides(data.banners)
      })
      .catch(() => undefined)
    return () => controller.abort()
  }, [])

  const nextSlide = useCallback(() => {
    setActive((curr) => (curr + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setActive((curr) => (curr - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (!slides.length) return
    const timer = window.setInterval(nextSlide, 6000)
    return () => window.clearInterval(timer)
  }, [slides.length, nextSlide])

  if (!slides.length) return null
  const slide = slides[active] ?? slides[0]

  return (
    <div className="relative min-h-[480px] overflow-hidden bg-muted lg:min-h-[560px]">
      <Image
        key={slide.id || slide.image}
        src={slide.image}
        alt={slide.title}
        fill
        priority={active === 0}
        loading={active === 0 ? 'eager' : 'lazy'}
        sizes="(max-width: 768px) 100vw, (max-width: 1440px) 100vw, 1440px"
        className="object-cover object-center transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/20 to-transparent pointer-events-none" />

      <div className="relative flex min-h-[480px] max-w-lg flex-col justify-end p-7 text-background lg:min-h-[560px] lg:p-14 z-10">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
          <Sparkles size={15} /> {slide.eyebrow}
        </p>
        <h1 className="font-serif text-5xl leading-[0.95] tracking-tight lg:text-7xl">{slide.title}</h1>
        <p className="mt-5 max-w-sm text-sm leading-6 text-background/85">{slide.description}</p>
        <Link
          href={slide.buttonLink || '#shop'}
          className="mt-8 flex w-fit items-center gap-3 bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:opacity-90 shadow-md"
        >
          {slide.buttonText || 'Explore the edit'} <ArrowRight size={17} />
        </Link>
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20">
        <button
          aria-label="Previous banner"
          onClick={prevSlide}
          className="rounded-full bg-background/90 p-2 text-foreground hover:bg-background transition"
        >
          <ChevronLeft size={18} />
        </button>
        {slides.map((item, index) => (
          <button
            key={item.id || index}
            aria-label={`Show banner ${index + 1}`}
            onClick={() => setActive(index)}
            className={`h-2 rounded-full transition-all duration-300 ${index === active ? 'w-7 bg-background' : 'w-2 bg-background/60'}`}
          />
        ))}
        <button
          aria-label="Next banner"
          onClick={nextSlide}
          className="rounded-full bg-background/90 p-2 text-foreground hover:bg-background transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
