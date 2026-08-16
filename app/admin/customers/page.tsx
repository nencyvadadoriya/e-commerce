'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, Search, ShoppingBag, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  status: string
  createdAt: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const { error } = useToast()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const loadCustomers = useCallback((pageNum = 1, search = debouncedQuery) => {
    setLoading(true)
    const params = new URLSearchParams({ page: pageNum.toString(), limit: '15' })
    if (search) params.set('q', search)

    fetch(`/api/customers?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data.customers ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.pages ?? 1)
        setPage(data.page ?? 1)
      })
      .catch(() => error('Failed to load customers'))
      .finally(() => setLoading(false))
  }, [debouncedQuery, error])

  useEffect(() => {
    loadCustomers(page, debouncedQuery)
  }, [loadCustomers, page, debouncedQuery])

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">User Base</p>
          <h1 className="font-serif text-xl">Registered Customers ({total})</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-5 lg:p-8 space-y-6">
        {/* Search */}
        <div className="flex items-center gap-2 border border-border bg-card px-4 py-3 text-sm max-w-md">
          <Search size={17} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer by name, email, phone..."
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Customers Table */}
        <div className="border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Loading customers directory…</div>
          ) : customers.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Users size={32} className="mx-auto text-muted-foreground" />
              <p className="font-serif text-2xl">No customers found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Customer Name</th>
                      <th className="px-5 py-3.5 font-semibold">Contact Info</th>
                      <th className="px-5 py-3.5 font-semibold">Orders Count</th>
                      <th className="px-5 py-3.5 font-semibold">Total Spending</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                      <th className="px-5 py-3.5 font-semibold">Registered Date</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-muted/30 transition">
                        <td className="px-5 py-4 font-semibold text-foreground">{customer.name}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground">{customer.email}</p>
                          <p className="text-xs text-muted-foreground">{customer.phone}</p>
                        </td>
                        <td className="px-5 py-4 font-semibold">{customer.totalOrders || 1} orders</td>
                        <td className="px-5 py-4 font-semibold text-primary">₹{(customer.totalSpent || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <span className="inline-block bg-emerald-100 text-emerald-900 px-2.5 py-0.5 text-xs font-semibold">
                            {customer.status || 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          >
                            <Eye size={14} /> Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-muted/20 text-xs">
                  <span className="text-muted-foreground">
                    Page {page} of {totalPages} ({total} total customers)
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

      {/* Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-md border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-serif text-xl">{selectedCustomer.name}</h3>
              <button onClick={() => setSelectedCustomer(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{selectedCustomer.email}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium">{selectedCustomer.phone}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Total Orders:</span>
                <span className="font-semibold text-primary">{selectedCustomer.totalOrders} orders</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Total Spent:</span>
                <span className="font-semibold text-accent">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Status:</span>
                <span className="font-semibold text-emerald-800">{selectedCustomer.status}</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
