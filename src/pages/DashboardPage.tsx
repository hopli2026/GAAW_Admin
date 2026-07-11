import { TrendingUp, Package, Truck, Users, Euro, ArrowUpRight } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  DELIVERED:        'Livré',
  CANCELLED:        'Annulé',
  IN_DELIVERY:      'En cours',
  ACCEPTED:         'Accepté',
  ARRIVED_PICKUP:   'Sur place',
  SEARCHING:        'Recherche',
  AWAITING_PAYMENT: 'Attente paiement',
  BLOCKED:          'Bloqué',
}

const STATUS_STYLES: Record<string, string> = {
  DELIVERED:        'bg-green-100 text-green-600',
  CANCELLED:        'bg-red-100 text-red-500',
  IN_DELIVERY:      'bg-blue-100 text-blue-500',
  ACCEPTED:         'bg-blue-100 text-blue-500',
  ARRIVED_PICKUP:   'bg-blue-100 text-blue-500',
  SEARCHING:        'bg-yellow-100 text-yellow-600',
  AWAITING_PAYMENT: 'bg-gray-100 text-gray-500',
  BLOCKED:          'bg-red-100 text-red-500',
}
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="w-9 h-9 rounded-full bg-gray-200" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
      <div className="h-2 bg-gray-100 rounded w-10" />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-32" />
        <div className="h-2 bg-gray-100 rounded w-48" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-3 bg-gray-200 rounded w-12" />
        <div className="h-4 bg-gray-100 rounded w-16" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => adminApi.getDashboard().then(r => r.data) })
  const { data: orders = [], isLoading: ordersLoading } = useQuery({ queryKey: ['orders'], queryFn: () => adminApi.getOrders().then(r => r.data) })
  const { data: drivers = [], isLoading: driversLoading } = useQuery({ queryKey: ['drivers'], queryFn: () => adminApi.getDrivers().then(r => r.data) })

  const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const recentOrders = orders.slice(0, 3)
  const pendingDrivers = drivers.filter(d => d.driverStatus === 'PENDING_VERIFICATION' || d.driverStatus === 'DOCUMENTS_SUBMITTED').slice(0, 3)
  const activeDrivers = drivers.filter(d => d.driverStatus === 'ACTIVE').length

  const statCards = [
    { label: 'Courses du jour', value: String(stats?.ordersToday ?? '—'), trend: null, Icon: Package, iconBg: 'bg-green-100', iconColor: 'text-green-500' },
    { label: 'Livreurs actifs', value: driversLoading ? '—' : `${activeDrivers}/${drivers.length}`, trend: null, Icon: Truck, iconBg: 'bg-green-100', iconColor: 'text-green-500' },
    { label: 'Clients inscrits', value: String(stats?.totalClients ?? '—'), trend: null, Icon: Users, iconBg: 'bg-gray-100', iconColor: 'text-gray-500' },
    { label: 'CA du jour', value: stats ? `${stats.revenueToday.toFixed(2)}€` : '—', trend: null, Icon: Euro, iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0D1B2A]">Tableau de bord</h2>
        <span className="text-sm text-gray-500 border border-gray-200 rounded-xl px-4 py-2 bg-white shadow-sm capitalize">{today}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : statCards.map(({ label, value, Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-gray-400 leading-tight">{label}</p>
              <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={iconColor} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#0D1B2A] mb-1">{value}</p>
            <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
              <TrendingUp size={12} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0D1B2A]">Dernières commandes</h3>
            <Link to="/orders" className="text-sm text-gray-400 hover:text-[#0D1B2A] transition">Voir tout</Link>
          </div>
          {ordersLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucune commande.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                    {order.client.firstName?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0D1B2A] text-sm">COURSE-{order.id}</p>
                    <p className="text-xs text-gray-400 truncate">{order.pickupAddress} → {order.deliveryAddress}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#0D1B2A] text-sm">{order.price}€</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0D1B2A]">Livreurs en attente</h3>
            <Link to="/drivers" className="text-sm text-gray-400 hover:text-[#0D1B2A] transition">Gérer</Link>
          </div>
          {driversLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>
          ) : pendingDrivers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucun livreur en attente.</p>
          ) : (
            <div className="space-y-3">
              {pendingDrivers.map((d) => (
                <div key={d.id} className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                  <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {d.firstName?.[0] ?? '?'}{d.lastName?.[0] ?? ''}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#0D1B2A] text-sm">{d.firstName} {d.lastName}</p>
                    <p className="text-xs text-orange-500">Documents à vérifier</p>
                  </div>
                  <Link to="/drivers">
                    <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0D1B2A] transition shadow-sm">
                      <ArrowUpRight size={14} />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
