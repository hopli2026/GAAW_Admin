import { X, ShoppingBag, Euro, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import type { AdminClient, AdminOrder } from '../types'

const STATUS_STYLES: Record<string, string> = {
  DELIVERED:    'bg-green-100 text-green-600',
  CANCELLED:    'bg-red-100 text-red-500',
  IN_DELIVERY:  'bg-blue-100 text-blue-500',
  SEARCHING:    'bg-yellow-100 text-yellow-600',
}

interface Props {
  client: AdminClient
  onClose: () => void
}

function OrderRow({ order }: { order: AdminOrder }) {
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D1B2A]">ORD-{order.id}</p>
        <p className="text-xs text-gray-400">{date} — {order.pickupAddress.split(',')[0]}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#0D1B2A]">{order.price.toFixed(2)}€</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {order.status}
        </span>
      </div>
    </div>
  )
}

export default function ClientDetailModal({ client, onClose }: Props) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['client-orders', client.id],
    queryFn: () => adminApi.getClientOrders(client.id).then(r => r.data),
  })

  const avgBasket = orders.length > 0 ? orders.reduce((s, o) => s + o.price, 0) / orders.length : 0
  const initials = `${client.firstName[0] ?? ''}${client.lastName[0] ?? ''}`.toUpperCase()

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[#0D1B2A] font-bold text-lg">
              {initials}
            </div>
            <div>
              <h2 className="font-bold text-[#0D1B2A] text-lg">{client.firstName} {client.lastName}</h2>
              <p className="text-sm text-gray-400">{client.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${client.blocked ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
              {client.blocked ? 'BLOQUÉ' : 'ACTIF'}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-[#0D1B2A] transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Téléphone</p>
            <p className="font-semibold text-[#0D1B2A] text-sm">{client.phone}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <ShoppingBag size={13} className="text-green-500" />
                <p className="text-xs text-gray-400">Commandes</p>
              </div>
              <p className="font-bold text-[#0D1B2A] text-xl">{client.totalOrders}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Euro size={13} className="text-orange-500" />
                <p className="text-xs text-gray-400">Total dépensé</p>
              </div>
              <p className="font-bold text-[#0D1B2A] text-xl">{client.totalSpent.toFixed(0)}€</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={13} className="text-blue-500" />
                <p className="text-xs text-gray-400">Panier moy.</p>
              </div>
              <p className="font-bold text-[#0D1B2A] text-xl">{avgBasket.toFixed(0)}€</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Historique des commandes</h3>
            {isLoading ? (
              <p className="text-sm text-gray-400 text-center py-4">Chargement...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune commande.</p>
            ) : (
              <div className="bg-gray-50 rounded-xl px-4 pt-1 pb-1 max-h-60 overflow-y-auto">
                {orders.map(o => <OrderRow key={o.id} order={o} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
