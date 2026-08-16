'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

type Order = {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  paymentStatus: string
  orderStatus: string
  createdAt: string
  items: { name: string; quantity: number }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const { error } = useToast()

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const loadOrders = useCallback((pageNum = 1, status = statusFilter, search = debouncedQuery) => {
    setLoading(true)
    const params = new URLSearchParams({ page: pageNum.toString(), limit: '15' })
    if (status !== 'All') params.set('status', status)
    if (search) params.set('q', search)

    fetch(`/api/orders?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders ?? [])
        setTotal(data.total ?? 0)
        setTotalPages(data.pages ?? 1)
        setPage(data.page ?? 1)
      })
      .catch(() => error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [statusFilter, debouncedQuery, error])

  useEffect(() => {
    loadOrders(page, statusFilter, debouncedQuery)
  }, [loadOrders, page, statusFilter, debouncedQuery])

  return (
    <div className="flex-1 min-w-0 pb-16">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Fulfillment</p>
          <h1 className="font-serif text-xl">Customer Orders ({total})</h1>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-5 lg:p-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border border-border bg-card p-4">
          <div className="flex flex-1 items-center gap-2 border border-border bg-background px-3 py-2 text-sm max-w-md">
            <Search size={17} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order ID, customer name, email..."
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="border border-border bg-background px-3 py-2 text-sm outline-none font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">Loading orders list…</div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <ShoppingCart size={32} className="mx-auto text-muted-foreground" />
              <p className="font-serif text-2xl">No orders found</p>
              <p className="text-sm text-muted-foreground">Orders generated during customer checkout will appear here.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Order ID</th>
                      <th className="px-5 py-3.5 font-semibold">Customer</th>
                      <th className="px-5 py-3.5 font-semibold">Items</th>
                      <th className="px-5 py-3.5 font-semibold">Total Amount</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                      <th className="px-5 py-3.5 font-semibold">Date</th>
                      <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition">
                        <td className="px-5 py-4 font-semibold text-primary">
                          <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs text-muted-foreground">
                            {order.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ') || 'Item'}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold">₹{order.total?.toLocaleString('en-IN')}</td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.orderStatus === 'Shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : order.orderStatus === 'Cancelled'
                                ? 'bg-destructive/15 text-destructive'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition"
                          >
                            <Eye size={14} /> View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-muted/20 text-xs">
                  <span className="text-muted-foreground">
                    Page {page} of {totalPages} ({total} total orders)
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
    </div>
  )
}
