import { X, Truck, CheckCircle, XCircle, Euro } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import type { AdminDriver, AdminOrder } from '../types'

const STATUS_STYLES: Record<string, string> = {
  DELIVERED:    'bg-green-100 text-green-600',
  CANCELLED:    'bg-red-100 text-red-500',
  IN_DELIVERY:  'bg-blue-100 text-blue-500',
  SEARCHING:    'bg-yellow-100 text-yellow-600',
}

interface Props {
  driver: AdminDriver
  onClose: () => void
}

function OrderRow({ order }: { order: AdminOrder }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D1B2A]">ORD-{order.id}</p>
        <p className="text-xs text-gray-400 truncate">{order.pickupAddress.split(',')[0]} → {order.deliveryAddress.split(',')[0]}</p>
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

export default function DriverDetailModal({ driver, onClose }: Props) {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['driver-orders', driver.id],
    queryFn: () => adminApi.getDriverOrders(driver.id).then(r => r.data),
  })

  const initials = `${driver.firstName[0] ?? ''}${driver.lastName[0] ?? ''}`.toUpperCase()
  const delivered = orders.filter(o => o.status === 'DELIVERED').length

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0D1B2A] flex items-center justify-center text-[#CCFF00] font-bold text-lg">
              {initials}
            </div>
            <div>
              <h2 className="font-bold text-[#0D1B2A] text-lg">{driver.firstName} {driver.lastName}</h2>
              <p className="text-sm text-gray-400">{driver.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              driver.driverStatus === 'ACTIVE' ? 'bg-green-100 text-green-600' :
              driver.driverStatus === 'SUSPENDED' ? 'bg-red-100 text-red-500' :
              'bg-yellow-100 text-yellow-600'
            }`}>
              {driver.driverStatus === 'ACTIVE' ? 'VALIDÉ' : driver.driverStatus === 'SUSPENDED' ? 'SUSPENDU' : 'EN ATTENTE'}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-[#0D1B2A] transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Téléphone</p>
              <p className="font-semibold text-[#0D1B2A] text-sm">{driver.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Véhicule</p>
              <div className="flex items-center gap-1.5">
                <Truck size={14} className="text-gray-400" />
                <p className="font-semibold text-[#0D1B2A] text-sm">{driver.vehicleType ?? '—'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0D1B2A] rounded-xl p-4 col-span-1">
              <p className="text-xs text-gray-400 mb-1">Wallet</p>
              <div className="flex items-center gap-1">
                <Euro size={14} className="text-[#CCFF00]" />
                <p className="font-bold text-white text-lg">{driver.walletBalance.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Livrées</p>
              <div className="flex items-center gap-1">
                <CheckCircle size={14} className="text-green-500" />
                <p className="font-bold text-[#0D1B2A] text-lg">{delivered}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Total</p>
              <div className="flex items-center gap-1">
                <XCircle size={14} className="text-gray-400" />
                <p className="font-bold text-[#0D1B2A] text-lg">{orders.length}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Documents</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {["Pièce d'identité", 'KBIS / Extrait Siret', 'RIB Bancaire'].map(label => (
                <div key={label} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-[#0D1B2A]">{label}</span>
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">À vérifier</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Historique des courses</h3>
            {isLoading ? (
              <p className="text-sm text-gray-400 text-center py-4">Chargement...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune course.</p>
            ) : (
              <div className="bg-gray-50 rounded-xl px-4 pt-1 pb-1 max-h-52 overflow-y-auto">
                {orders.map(o => <OrderRow key={o.id} order={o} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
