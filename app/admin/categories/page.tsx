'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Edit, Trash2, Boxes, FolderPlus, X, ChevronDown, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

type Subcategory = { name: string; slug: string; description?: string; active: boolean }
type Category = {
  id: string
  name: string
  slug: string
  group: string
  description?: string
  subcategories: Subcategory[]
  active: boolean
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [subModalOpen, setSubModalOpen] = useState<Category | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { success, error } = useToast()

  const [categoryForm, setCategoryForm] = useState({ name: '', group: 'Apparel', description: '' })
  const [subForm, setSubForm] = useState({ name: '', description: '' })

  const loadCategories = () => {
    setLoading(true)
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => error('Failed to load categories'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault()
    if (!categoryForm.name.trim()) return

    const slug = categoryForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

    if (editingCategory) {
      // Update
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingCategory.id, ...categoryForm, slug }),
      })
      if (res.ok) {
        success(`Updated category "${categoryForm.name}"`)
        loadCategories()
        setModalOpen(false)
        setEditingCategory(null)
      } else {
        error('Failed to update category')
      }
    } else {
      // Create
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...categoryForm, slug, subcategories: [] }),
      })
      if (res.ok) {
        success(`Created category "${categoryForm.name}"`)
        loadCategories()
        setModalOpen(false)
      } else {
        error('Failed to create category')
      }
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return
    const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      success(`Deleted category "${name}"`)
      setCategories((current) => current.filter((c) => c.id !== id))
    } else {
      error('Failed to delete category')
    }
  }

  const handleAddSubcategory = async (e: FormEvent) => {
    e.preventDefault()
    if (!subModalOpen || !subForm.name.trim()) return

    const subSlug = subForm.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    const updatedSubs = [...(subModalOpen.subcategories || []), { name: subForm.name, slug: subSlug, description: subForm.description, active: true }]

    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: subModalOpen.id, subcategories: updatedSubs }),
    })

    if (res.ok) {
      success(`Added subcategory "${subForm.name}"`)
      loadCategories()
      setSubModalOpen(null)
      setSubForm({ name: '', description: '' })
    } else {
      error('Failed to add subcategory')
    }
  }

  const handleDeleteSubcategory = async (cat: Category, subSlug: string) => {
    const updatedSubs = cat.subcategories.filter((s) => s.slug !== subSlug)
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cat.id, subcategories: updatedSubs }),
    })
    if (res.ok) {
      success('Subcategory removed')
      loadCategories()
    }
  }

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Store Taxonomy</p>
          <h1 className="font-serif text-xl">Categories & Subcategories</h1>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null)
            setCategoryForm({ name: '', group: 'Apparel', description: '' })
            setModalOpen(true)
          }}
          className="flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          <Plus size={16} /> Add Category
        </button>
      </header>

      <div className="mx-auto max-w-6xl p-5 lg:p-8 space-y-6">
        {loading ? (
          <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Loading categories catalog…</div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center space-y-3 border border-border bg-card">
            <Boxes size={32} className="mx-auto text-muted-foreground" />
            <p className="font-serif text-2xl">No categories available</p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus size={15} /> Create First Category
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((cat) => (
              <div key={cat.id} className="border border-border bg-card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent border border-accent/30 px-2 py-0.5">
                      {cat.group}
                    </span>
                    <h2 className="font-serif text-2xl font-medium mt-2">{cat.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Slug: /category/{cat.slug}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat)
                        setCategoryForm({ name: cat.name, group: cat.group, description: cat.description || '' })
                        setModalOpen(true)
                      }}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted"
                      title="Edit Category"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted"
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {cat.description && <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>}

                {/* Subcategories List */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Subcategories ({cat.subcategories?.length || 0})
                    </p>
                    <button
                      onClick={() => {
                        setSubModalOpen(cat)
                        setSubForm({ name: '', description: '' })
                      }}
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
                    >
                      <FolderPlus size={14} /> Add Subcategory
                    </button>
                  </div>

                  {cat.subcategories?.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-2">No subcategories created yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {cat.subcategories.map((sub) => (
                        <div
                          key={sub.slug}
                          className="flex items-center gap-2 border border-border bg-muted/60 px-3 py-1 text-xs font-medium"
                        >
                          <span>{sub.name}</span>
                          <button
                            onClick={() => handleDeleteSubcategory(cat, sub.slug)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Remove subcategory"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <form onSubmit={handleSaveCategory} className="w-full max-w-md border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl">{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Name *</label>
              <input
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="e.g. Footwear"
                className="w-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Group / Department</label>
              <input
                value={categoryForm.group}
                onChange={(e) => setCategoryForm({ ...categoryForm, group: e.target.value })}
                placeholder="e.g. Apparel, Fashion, Lifestyle..."
                className="w-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea
                rows={3}
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="Brief description of this category..."
                className="w-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary resize-y"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="border border-border px-4 py-2 text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <form onSubmit={handleAddSubcategory} className="w-full max-w-md border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl">Add Subcategory to "{subModalOpen.name}"</h3>
              <button type="button" onClick={() => setSubModalOpen(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subcategory Name *</label>
              <input
                required
                value={subForm.name}
                onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                placeholder="e.g. Sneakers, Shirts, Earrings..."
                className="w-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setSubModalOpen(null)} className="border border-border px-4 py-2 text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
                Add Subcategory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
