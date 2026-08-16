import { NextResponse } from 'next/server'
import { getCustomersStore } from '@/lib/data-store'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
  const query = searchParams.get('q')?.trim() ?? undefined

  const result = await getCustomersStore(page, limit, query)
  return NextResponse.json({
    customers: result.items,
    total: result.total,
    page: result.page,
    pages: result.pages,
  })
}
