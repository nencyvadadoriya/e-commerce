'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'
type ToastMessage = { id: string; type: ToastType; text: string }

type ToastContextValue = {
  showToast: (text: string, type?: ToastType) => void
  success: (text: string) => void
  error: (text: string) => void
  info: (text: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((text: string, type: ToastType = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5)
    setToasts((current) => [...current, { id, type, text }])
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const success = useCallback((text: string) => showToast(text, 'success'), [showToast])
  const error = useCallback((text: string) => showToast(text, 'error'), [showToast])
  const info = useCallback((text: string) => showToast(text, 'info'), [showToast])

  const dismiss = (id: string) => setToasts((current) => current.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-md w-[calc(100vw-40px)] pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 shadow-xl transition-all duration-300 border text-sm ${
              toast.type === 'success'
                ? 'bg-primary text-primary-foreground border-primary/20'
                : toast.type === 'error'
                ? 'bg-destructive text-destructive-foreground border-destructive/20'
                : 'bg-card text-card-foreground border-border'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {toast.type === 'success' && <CheckCircle2 size={18} className="shrink-0 text-accent" />}
              {toast.type === 'error' && <AlertCircle size={18} className="shrink-0" />}
              {toast.type === 'info' && <Info size={18} className="shrink-0 text-primary" />}
              <span className="truncate font-medium">{toast.text}</span>
            </div>
            <button onClick={() => dismiss(toast.id)} className="opacity-70 hover:opacity-100 p-0.5">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
