'use client'

import React, { useState, memo, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Image as ImageIcon,
  Ticket,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Boxes },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export const AdminSidebar = memo(function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const logout = useCallback(() => {
    document.cookie = 'nava-admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/admin/login')
  }, [router])

  const isNavItemActive = useCallback((itemHref: string) => {
    if (itemHref === '/admin') return pathname === '/admin'
    return pathname.startsWith(itemHref)
  }, [pathname])

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card border-r border-border p-5">
      <div className="flex items-center justify-between">
        <Link href="/admin" className="font-serif text-2xl font-semibold text-primary">
          nava<span className="text-accent">.</span>
          <span className="ml-2 font-sans text-xs font-medium text-muted-foreground uppercase tracking-widest">admin</span>
        </Link>
        <button className="md:hidden text-muted-foreground hover:text-foreground p-1" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="mt-6">
        <Link
          href="/admin/products/add"
          onClick={() => setMobileOpen(false)}
          className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 shadow-xs"
        >
          <PlusCircle size={17} /> Add Product
        </Link>
      </div>

      <nav className="mt-6 grid gap-1.5 text-sm font-medium">
        {navItems.map((item) => {
          const active = isNavItemActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 transition ${
                active
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={18} className={active ? 'text-primary-foreground' : 'text-muted-foreground'} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border grid gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          <Store size={18} />
          <span>View Customer Site</span>
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3.5 py-2 text-sm text-destructive hover:bg-destructive/10 transition text-left"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 md:block sticky top-0 h-screen overflow-y-auto z-40">
        <SidebarContent />
      </aside>

      <div className="flex h-16 items-center justify-between border-b border-border bg-card px-5 md:hidden w-full sticky top-0 z-30">
        <Link href="/admin" className="font-serif text-xl font-semibold text-primary">
          nava<span className="text-accent">.</span>
          <span className="ml-1 font-sans text-xs text-muted-foreground">admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md border border-border p-2 text-foreground"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/30 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-72 max-w-[80vw]" onClick={(e) => e.stopPropagation()}>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
})
