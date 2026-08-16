'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LockKeyhole, ArrowRight, ShieldCheck } from 'lucide-react'
import { useToast } from '@/components/toast-provider'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@nava.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { success, error } = useToast()

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        error(data.error || 'Authentication failed')
        setLoading(false)
        return
      }

      success('Welcome back, Admin!')
      router.push('/admin')
    } catch {
      error('Login failed. Please check credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block font-serif text-4xl font-semibold tracking-tight text-primary">
            nava<span className="text-accent">.</span>
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin Workspace</p>
          <h1 className="mt-4 font-serif text-3xl font-normal">Sign in to control panel</h1>
        </div>

        <form onSubmit={handleLogin} className="border border-border bg-card p-6 md:p-8 space-y-5 shadow-lg">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="admin@nava.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>

          <div className="bg-muted p-3 text-xs text-muted-foreground flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary shrink-0" />
            <span>Demo credentials pre-filled for instant access.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating…' : 'Sign in to Admin'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Return to customer store
          </Link>
        </div>
      </div>
    </div>
  )
}
