import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getProductsStore, getAllAdminProductsStore, createProductStore } from '@/lib/data-store'

const variantInput = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  discount: z.number().optional(),
  stock: z.number().int().default(0),
  sku: z.string().optional(),
  images: z.array(z.string()).default([]),
  image: z.string().optional(),
})

const productInput = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().optional(),
  brand: z.string().min(1, 'Brand is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  originalPrice: z.number().positive(),
  sellingPrice: z.number().positive(),
  discount: z.number().optional(),
  stock: z.number().int().min(0),
  images: z.array(z.string()).min(1, 'At least one image is required'),
  image: z.string().optional(),
  badge: z.string().optional(),
  description: z.string().optional(),
  hasVariants: z.boolean().optional(),
  variants: z.array(variantInput).optional(),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  active: z.boolean().optional(),
  sku: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? searchParams.get('search')?.trim()
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const sort = searchParams.get('sort') ?? 'popular'
  const mode = searchParams.get('mode')
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? (mode === 'admin' ? 15 : 40))))

  if (mode === 'admin') {
    const result = await getAllAdminProductsStore(page, limit, query, category ?? undefined)
    return NextResponse.json({
      products: result.items,
      total: result.total,
      page: result.page,
      pages: result.pages,
      source: 'store',
    })
  }

  const result = await getProductsStore(query, category ?? undefined, sort, page, limit, subcategory ?? undefined)
  return NextResponse.json({
    products: result.items,
    total: result.total,
    page: result.page,
    pages: result.pages,
    source: 'store',
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = productInput.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid product data', details: parsed.error.flatten() }, { status: 400 })
    }
    const product = await createProductStore(parsed.data)
    return NextResponse.json({ product, message: 'Product created successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product', details: String(error) }, { status: 500 })
  }
}
