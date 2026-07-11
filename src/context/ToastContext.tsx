import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast { id: number; message: string; type: ToastType }

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let _id = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++_id
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[200] pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold min-w-[260px] max-w-xs ${
              t.type === 'success' ? 'bg-[#0D1B2A] text-white' :
              t.type === 'error'   ? 'bg-red-500 text-white' :
                                     'bg-gray-700 text-white'
            }`}
          >
            {t.type === 'success' ? <CheckCircle size={16} className="shrink-0 text-[#CCFF00]" /> :
             t.type === 'error'   ? <XCircle size={16} className="shrink-0" /> :
                                    <Info size={16} className="shrink-0" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
