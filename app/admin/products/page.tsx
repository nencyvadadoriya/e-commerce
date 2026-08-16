'use client'

import { useEffect, useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { useToast } from '@/components/toast-provider'

type Product = {
  id: string
  name: string
  brand: string
  category: string
  subcategory?: string
  originalPrice: number
  sellingPrice: number
  stock: number
  image: string
  badge: string
  active?: boolean
  sku?: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { success, error } = useToast()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const loadProducts = useCallback((pageNum = 1, cat = categoryFilter, search = debouncedQuery) => {
    setLoading(true)
    const params = new URLSearchParams({ mode: 'admin', page: pageNum.toString(), limit: '15' })
    if (cat !== 'All') params.set('category', cat)
    if (search) params.set('q', search)

    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.pages ?? 1)
        setPage(data.page ?? 1)
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [categoryFilter, debouncedQuery])

  useEffect(() => {
    loadProducts(page, categoryFilter, debouncedQuery)
  }, [loadProducts, page, categoryFilter, debouncedQuery])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      success(`Deleted "${deleteTarget.name}" successfully`)
      setProducts((current) => current.filter((p) => p.id !== deleteTarget.id))
      setTotal((t) => Math.max(0, t - 1))
      setDeleteTarget(null)
      loadProducts(page, categoryFilter, debouncedQuery)
    } catch {
      error('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const toggleActiveStatus = async (product: Product) => {
    const newStatus = product.active === false ? true : false
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: newStatus } : p))
      )
      success(`"${product.name}" is now ${newStatus ? 'Active (Visible)' : 'Inactive (Hidden)'}`)
    } catch {
      error('Failed to update product status')
    }
  }

  const categories = ['All', 'Men', 'Women', 'Kids', 'Footwear', 'Accessories', 'Jewellery', 'Home', 'Beauty', 'GenZ']

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Catalog</p>
          <h1 className="font-serif text-xl">All Products ({total})</h1>
        </div>
        <Link
          href="/admin/products/add"
          className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition shadow-xs"
        >
          <Plus size={16} /> Add Product
        </Link>
      </header>

      <div className="mx-auto max-w-7xl p-5 lg:p-8 space-y-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-border bg-card p-4">
          <div className="flex flex-1 items-center gap-2 border border-border bg-background px-3 py-2 text-sm max-w-md">
            <Search size={17} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products by name, brand, SKU..."
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              className="border border-border bg-background px-3 py-2 text-sm outline-none font-medium"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Loading product catalog…</div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <AlertCircle size={32} className="mx-auto text-muted-foreground" />
              <p className="font-serif text-2xl">No products found</p>
              <p className="text-sm text-muted-foreground">Try clearing search filters or add a new product.</p>
              <Link
                href="/admin/products/add"
                className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Plus size={15} /> Add First Product
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">Product</th>
                      <th className="px-4 py-3.5 font-semibold">Brand / Category</th>
                      <th className="px-4 py-3.5 font-semibold">Price</th>
                      <th className="px-4 py-3.5 font-semibold">Stock</th>
                      <th className="px-4 py-3.5 font-semibold">Status</th>
                      <th className="px-4 py-3.5 font-semibold">Badge</th>
                      <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <div className="relative h-12 w-12 shrink-0 bg-muted border border-border">
                              <Image
                                src={product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=150&q=80'}
                                alt={product.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link href={`/admin/products/${product.id}`} className="font-semibold text-foreground hover:text-primary truncate block">
                                {product.name}
                              </Link>
                              <span className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-medium text-foreground">{product.brand}</p>
                          <p className="text-xs text-muted-foreground">{product.category} {product.subcategory ? `› ${product.subcategory}` : ''}</p>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-semibold">₹{product.sellingPrice?.toLocaleString('en-IN')}</p>
                          {product.originalPrice > product.sellingPrice && (
                            <p className="text-xs text-muted-foreground line-through">₹{product.originalPrice?.toLocaleString('en-IN')}</p>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-xs font-semibold ${
                              product.stock === 0
                                ? 'bg-destructive/15 text-destructive'
                                : product.stock < 10
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => toggleActiveStatus(product)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border transition cursor-pointer ${
                              product.active !== false
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                            }`}
                            title={`Click to ${product.active !== false ? 'Deactivate' : 'Activate'}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${product.active !== false ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                            {product.active !== false ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-block border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            {product.badge || 'Standard'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition"
                              title="View Product"
                            >
                              <Eye size={17} />
                            </Link>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition"
                              title="Edit Product"
                            >
                              <Edit size={17} />
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-muted/20 text-xs">
                  <span className="text-muted-foreground">
                    Page {page} of {totalPages} ({total} total items)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex items-center gap-1 border border-border px-3 py-1.5 font-semibold disabled:opacity-40 hover:bg-muted transition"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="flex items-center gap-1 border border-border px-3 py-1.5 font-semibold disabled:opacity-40 hover:bg-muted transition"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-md border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl text-destructive font-semibold">Delete Product</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">"{deleteTarget.name}"</strong>? This will remove the product from both Admin catalog and Customer store.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground hover:opacity-90"
              >
                {deleting ? 'Deleting…' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
