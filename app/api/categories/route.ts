import { NextResponse } from 'next/server'
import { getCategoriesStore, createCategoryStore, updateCategoryStore, deleteCategoryStore } from '@/lib/data-store'

export async function GET() {
  const categories = await getCategoriesStore()
  return NextResponse.json({ categories })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const category = await createCategoryStore(data)
    return NextResponse.json({ category, message: 'Category created successfully' }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category', details: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json()
    const category = await updateCategoryStore(id, data)
    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    return NextResponse.json({ category, message: 'Category updated successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  const success = await deleteCategoryStore(id)
  if (!success) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  return NextResponse.json({ message: 'Category deleted successfully' })
}
