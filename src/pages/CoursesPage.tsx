import { useState } from 'react'
import { Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import type { AdminOrder } from '../types'
import CourseDetailModal from '../components/CourseDetailModal'

const STATUS_STYLES: Record<string, string> = {
  DELIVERED:       'bg-green-100 text-green-600',
  CANCELLED:       'bg-red-100 text-red-500',
  BLOCKED:         'bg-red-100 text-red-500',
  IN_DELIVERY:     'bg-blue-100 text-blue-500',
  ACCEPTED:        'bg-blue-100 text-blue-500',
  ARRIVED_PICKUP:  'bg-blue-100 text-blue-500',
  SEARCHING:       'bg-yellow-100 text-yellow-600',
  AWAITING_PAYMENT:'bg-gray-100 text-gray-500',
}

export default function CoursesPage() {
  const [selected, setSelected] = useState<AdminOrder | null>(null)
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => adminApi.getOrders().then(r => r.data),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0D1B2A]">Suivi des Courses</h2>
        <span className="text-sm font-medium text-[#0D1B2A] border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm">
          Total: {orders.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID Course</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Trajet</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Prix</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Chargement...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Aucune commande.</td></tr>
            ) : orders.map((order, i) => (
              <tr key={order.id} className={i !== orders.length - 1 ? 'border-b border-gray-50' : ''}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#0D1B2A] text-sm">ORD-{order.id}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#0D1B2A] text-sm">{order.client.firstName} {order.client.lastName}</p>
                  <p className="text-xs text-gray-400">ID: CLIENT-{order.client.id}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />{order.pickupAddress.split(',')[0]}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />{order.deliveryAddress.split(',')[0]}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-[#0D1B2A]">{order.price}€</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setSelected(order)} className="text-gray-400 hover:text-[#0D1B2A] transition">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <CourseDetailModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
