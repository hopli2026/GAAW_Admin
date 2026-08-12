import { useState } from 'react'
import { Eye, Search, Filter } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import type { AdminOrder } from '../types'
import CourseDetailModal from '../components/CourseDetailModal'
import { TableLoader } from '../components/ui/Spinner'

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

const STATUS_LABELS: Record<string, string> = {
  DELIVERED:       'Livré',
  CANCELLED:       'Annulé',
  BLOCKED:         'Bloqué',
  IN_DELIVERY:     'En livraison',
  ACCEPTED:        'Accepté',
  ARRIVED_PICKUP:  'Sur place',
  SEARCHING:       'Recherche',
  AWAITING_PAYMENT:'Attente paiement',
}

const STATUS_OPTIONS = ['', 'SEARCHING', 'AWAITING_PAYMENT', 'ACCEPTED', 'ARRIVED_PICKUP', 'IN_DELIVERY', 'DELIVERED', 'CANCELLED']

export default function CoursesPage() {
  const [selected, setSelected] = useState<AdminOrder | null>(null)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => adminApi.getOrders().then(r => r.data),
  })

  const filtered = orders.filter(o => {
    const q = search.trim().toLowerCase()
    const matchSearch = !q ||
      String(o.id).includes(q) ||
      // La référence affichée dans le tableau est « COURSE-42 » : sans cette ligne,
      // copier-coller ce qu'on voit à l'écran ne renvoie aucun résultat.
      `course-${o.id}`.includes(q) ||
      `client-${o.client?.id ?? ''}`.includes(q) ||
      `${o.client?.firstName ?? ''} ${o.client?.lastName ?? ''}`.toLowerCase().includes(q) ||
      (o.pickupAddress ?? '').toLowerCase().includes(q) ||
      (o.deliveryAddress ?? '').toLowerCase().includes(q) ||
      (o.status ?? '').toLowerCase().includes(q)

    const matchStatus = !status || o.status === status

    const d = new Date(o.createdAt)
    const matchFrom = !dateFrom || d >= new Date(dateFrom)
    const matchTo   = !dateTo   || d <= new Date(dateTo + 'T23:59:59')

    return matchSearch && matchStatus && matchFrom && matchTo
  })

  const hasFilters = search || status || dateFrom || dateTo
  const resetFilters = () => { setSearch(''); setStatus(''); setDateFrom(''); setDateTo('') }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#0D1B2A]">Suivi des Courses</h2>
        <span className="text-sm font-medium text-[#0D1B2A] border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm">
          {filtered.length} / {orders.length} courses
        </span>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
        {/* Recherche */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 w-56">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text" placeholder="COURSE-12, client, adresse…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-600 w-full bg-transparent"
          />
        </div>

        {/* Statut */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
          <Filter size={14} className="text-gray-400 shrink-0" />
          <select
            value={status} onChange={e => setStatus(e.target.value)}
            className="outline-none text-sm text-gray-600 bg-transparent cursor-pointer"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s ? STATUS_LABELS[s] ?? s : 'Tous les statuts'}</option>
            ))}
          </select>
        </div>

        {/* Date de */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
          <span className="text-xs text-gray-400 shrink-0">Du</span>
          <input
            type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="outline-none text-sm text-gray-600 bg-transparent cursor-pointer"
          />
        </div>

        {/* Date au */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
          <span className="text-xs text-gray-400 shrink-0">Au</span>
          <input
            type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="outline-none text-sm text-gray-600 bg-transparent cursor-pointer"
          />
        </div>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-gray-400 hover:text-red-500 transition cursor-pointer px-2 py-1"
          >
            Réinitialiser
          </button>
        )}
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
              <TableLoader cols={6} />
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">{hasFilters ? 'Aucun résultat pour ces filtres.' : 'Aucune commande.'}</td></tr>
            ) : filtered.map((order, i) => (
              <tr key={order.id} className={i !== filtered.length - 1 ? 'border-b border-gray-50' : ''}>
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#0D1B2A] text-sm">COURSE-{order.id}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-[#0D1B2A] text-sm">{order.client ? `${order.client.firstName} ${order.client.lastName}` : 'Compte supprimé'}</p>
                  <p className="text-xs text-gray-400">{order.client ? `ID: CLIENT-${order.client.id}` : '—'}</p>
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
                  <span className="font-bold text-[#0D1B2A]">{order.price != null ? `${order.price}€` : '—'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => setSelected(order)} className="text-gray-400 hover:text-[#0D1B2A] transition cursor-pointer">
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <CourseDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onCancelled={(id) => setSelected(prev => prev?.id === id ? { ...prev, status: 'CANCELLED' } : prev)}
        />
      )}
    </div>
  )
}
