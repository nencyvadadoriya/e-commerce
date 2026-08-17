import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ProductTile } from '@/components/commerce-surfaces'
import { allSubcategories, categoryLabel, slugify } from '@/lib/category-navigation'
import { getProductsStore, getCategoriesStore } from '@/lib/data-store'

export default async function CategoryPage({ params }: { params: Promise<{ slugs: string[] }> }) {
  const { slugs } = await params
  const categoryParam = slugs[0]?.toLowerCase() || 'all'
  const subcategoryParam = slugs[1]?.toLowerCase()

  const categories = await getCategoriesStore()
  const matchedCategory = categories.find((c) => c.slug.toLowerCase() === categoryParam || c.name.toLowerCase() === categoryParam)

  const categoryName = matchedCategory ? matchedCategory.name : categoryLabel(categoryParam)
  const subcategoryName = subcategoryParam ? categoryLabel(subcategoryParam) : undefined

  const result = await getProductsStore(subcategoryName, categoryName)
  const products = result.items.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    originalPrice: p.originalPrice,
    sellingPrice: p.sellingPrice,
    rating: p.rating || 4.5,
    reviewCount: p.reviewCount || 10,
    stock: p.stock,
    image: p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85',
    badge: p.badge || 'New',
  }))

  const subcategoryLinks = matchedCategory?.subcategories?.map((s) => s.name) || allSubcategories(categoryParam)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 lg:px-10">
          <Link href="/" className="font-serif text-2xl font-semibold text-primary">
            nava<span className="text-accent">.</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:text-accent transition">
            <ArrowLeft size={16} /> Back to store
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10 lg:py-12">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href={`/category/${categoryParam}`} className="hover:text-foreground">{categoryName}</Link>
          {subcategoryName && (
            <>
              <span>/</span>
              <span className="text-foreground font-medium">{subcategoryName}</span>
            </>
          )}
        </div>

        <div className="mt-8 flex flex-col justify-between gap-5 border-b border-border pb-7 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Nava / {categoryName}
            </p>
            <h1 className="mt-2 font-serif text-4xl lg:text-5xl">
              {subcategoryName || categoryName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              A considered edit of pieces selected for everyday living, easy layering, and a little more joy.
            </p>
          </div>
          <span className="text-sm text-muted-foreground font-medium">{products.length} pieces available</span>
        </div>

        {subcategoryLinks.length > 0 && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {subcategoryLinks.map((item) => {
              const subSlug = slugify(item)
              const isActive = subcategoryParam === subSlug
              return (
                <Link
                  key={item}
                  href={`/category/${categoryParam}/${subSlug}`}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary bg-card'
                  }`}
                >
                  {item}
                </Link>
              )
            })}
          </div>
        )}

        {products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 border border-dashed border-border p-16 text-center space-y-3">
            <p className="font-serif text-2xl">This collection is coming together.</p>
            <p className="text-sm text-muted-foreground">No pieces currently listed in this specific subcategory.</p>
            <Link
              href="/#shop"
              className="mt-4 inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
            >
              Shop All Products <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
