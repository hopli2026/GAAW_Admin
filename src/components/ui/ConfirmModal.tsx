import { AlertTriangle } from 'lucide-react'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmModal({ title, message, confirmLabel = 'Confirmer', onConfirm, onCancel, danger = true }: Props) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-50' : 'bg-yellow-50'}`}>
          <AlertTriangle size={22} className={danger ? 'text-red-500' : 'text-yellow-500'} />
        </div>
        <h3 className="font-bold text-[#0D1B2A] text-center text-base mb-2">{title}</h3>
        <p className="text-sm text-gray-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition cursor-pointer ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0D1B2A] hover:opacity-90'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
