import { TrendingUp, Package, Truck, Users, Euro, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../api/admin'

export default function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ['dashboard'], queryFn: () => adminApi.getDashboard().then(r => r.data) })
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: () => adminApi.getOrders().then(r => r.data) })
  const { data: drivers = [] } = useQuery({ queryKey: ['drivers'], queryFn: () => adminApi.getDrivers().then(r => r.data) })

  const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const recentOrders = orders.slice(0, 3)
  const pendingDrivers = drivers.filter(d => d.driverStatus === 'PENDING_VERIFICATION' || d.driverStatus === 'DOCUMENTS_SUBMITTED').slice(0, 3)

  const statCards = [
    { label: 'Courses du jour', value: String(stats?.ordersToday ?? '—'), trend: null, Icon: Package, iconBg: 'bg-green-100', iconColor: 'text-green-500' },
    { label: 'Livreurs actifs', value: stats ? `${stats.activeDrivers}/${stats.totalDrivers}` : '—', trend: null, Icon: Truck, iconBg: 'bg-green-100', iconColor: 'text-green-500' },
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
        {statCards.map(({ label, value, Icon, iconBg, iconColor }) => (
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
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucune commande.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                    {order.client.firstName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0D1B2A] text-sm">Course #ORD-{order.id}</p>
                    <p className="text-xs text-gray-400 truncate">{order.pickupAddress} → {order.deliveryAddress}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#0D1B2A] text-sm">{order.price}€</p>
                    <span className="text-xs font-bold text-green-500 bg-green-100 px-2 py-0.5 rounded-full">{order.status}</span>
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
          {pendingDrivers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucun livreur en attente.</p>
          ) : (
            <div className="space-y-3">
              {pendingDrivers.map((d) => (
                <div key={d.id} className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                  <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {d.firstName[0]}{d.lastName[0]}
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
