'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Users,
  Boxes,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Eye,
  ChevronRight,
} from 'lucide-react'

type Product = { id: string; name: string; brand: string; category: string; sellingPrice: number; stock: number; badge: string }
type Order = { id: string; orderNumber: string; customerName: string; total: number; orderStatus: string; createdAt: string }

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/products?mode=admin').then((res) => res.json()),
      fetch('/api/orders').then((res) => res.json()),
    ])
      .then(([productsData, ordersData]) => {
        setProducts(productsData.products ?? [])
        setOrders(ordersData.orders ?? [])
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  const totalCatalogValue = products.reduce((sum, p) => sum + p.sellingPrice * (p.stock || 1), 0)
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length
  const outOfStockCount = products.filter((p) => p.stock === 0).length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="flex-1 min-w-0">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 lg:px-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Store Management</p>
          <h1 className="font-serif text-xl">Overview Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/add"
            className="hidden sm:flex items-center gap-2 bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            <PlusCircle size={15} /> Add Product
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-5 lg:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={loading ? '...' : products.length.toString()}
            note="Active live catalog"
            icon={<Package size={20} className="text-primary" />}
          />
          <StatCard
            title="Total Revenue"
            value={loading ? '...' : `₹${totalRevenue.toLocaleString('en-IN')}`}
            note={`${orders.length} orders recorded`}
            icon={<TrendingUp size={20} className="text-accent" />}
          />
          <StatCard
            title="Catalog Value"
            value={loading ? '...' : `₹${totalCatalogValue.toLocaleString('en-IN')}`}
            note="Current price valuation"
            icon={<Boxes size={20} className="text-primary" />}
          />
          <StatCard
            title="Needs Attention"
            value={loading ? '...' : `${lowStockCount + outOfStockCount}`}
            note={`${outOfStockCount} out of stock, ${lowStockCount} low`}
            icon={<AlertTriangle size={20} className="text-amber-500" />}
          />
        </div>

        {/* Quick Nav / Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/products"
            className="flex items-center justify-between border border-border bg-card p-5 hover:border-primary transition group"
          >
            <div className="flex items-center gap-3">
              <Package size={22} className="text-primary" />
              <div>
                <p className="font-medium text-sm">Manage Products</p>
                <p className="text-xs text-muted-foreground">Full CRUD catalog editor</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center justify-between border border-border bg-card p-5 hover:border-primary transition group"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={22} className="text-accent" />
              <div>
                <p className="font-medium text-sm">Customer Orders</p>
                <p className="text-xs text-muted-foreground">Status updates & tracking</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/admin/banners"
            className="flex items-center justify-between border border-border bg-card p-5 hover:border-primary transition group"
          >
            <div className="flex items-center gap-3">
              <Boxes size={22} className="text-primary" />
              <div>
                <p className="font-medium text-sm">Hero Banners</p>
                <p className="text-xs text-muted-foreground">Sync homepage slider</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {/* Recent Orders Section */}
        <div className="border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-accent font-semibold">Live Feed</p>
              <h2 className="font-serif text-xl">Recent Customer Orders</h2>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All Orders <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">Loading order activity…</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No orders recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Order ID</th>
                    <th className="px-5 py-3 font-semibold">Customer</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition">
                      <td className="px-5 py-3.5 font-semibold text-primary">{order.orderNumber}</td>
                      <td className="px-5 py-3.5">{order.customerName}</td>
                      <td className="px-5 py-3.5 font-medium">₹{order.total?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.orderStatus === 'Shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <Eye size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, note, icon }: { title: string; value: string; note: string; icon: React.ReactNode }) {
  return (
    <div className="border border-border bg-card p-5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{title}</p>
        {icon}
      </div>
      <p className="font-serif text-3xl">{value}</p>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  )
}
