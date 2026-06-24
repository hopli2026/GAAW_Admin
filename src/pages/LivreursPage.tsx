import { useState } from 'react'
import { Eye, Ban, Check, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import type { AdminDriver } from '../types'
import DriverDetailModal from '../components/DriverDetailModal'

const AVATAR_COLORS = ['bg-green-500', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400']

function getInitials(d: AdminDriver) { return `${d.firstName[0] ?? ''}${d.lastName[0] ?? ''}`.toUpperCase() }
function getColor(d: AdminDriver) { return AVATAR_COLORS[d.id % AVATAR_COLORS.length] }

function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE') return <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit"><Check size={12} /> VALIDÉ</span>
  if (status === 'SUSPENDED') return <span className="bg-red-100 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 w-fit"><Ban size={12} /> SUSPENDU</span>
  return <span className="bg-yellow-100 text-yellow-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 w-fit">◎ EN ATTENTE</span>
}

export default function LivreursPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<AdminDriver | null>(null)

  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => adminApi.getDrivers().then(r => r.data),
  })

  const validateMutation = useMutation({
    mutationFn: (id: number) => adminApi.validateDriver(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })
  const suspendMutation = useMutation({
    mutationFn: (id: number) => adminApi.suspendDriver(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['drivers'] }),
  })

  const active  = drivers.filter(d => d.driverStatus === 'ACTIVE').length
  const pending = drivers.filter(d => d.driverStatus !== 'ACTIVE' && d.driverStatus !== 'SUSPENDED').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0D1B2A]">Gestion des Livreurs</h2>
        <span className="text-sm font-medium text-[#0D1B2A] border border-gray-200 rounded-lg px-4 py-2 bg-white shadow-sm">
          Total: {drivers.length} | En attente: {pending} | Actifs: {active}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Nom', 'Contact', 'Véhicule', 'Wallet', 'Statut', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Chargement...</td></tr>
            ) : drivers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Aucun livreur.</td></tr>
            ) : drivers.map((d, i) => (
              <tr key={d.id} className={i !== drivers.length - 1 ? 'border-b border-gray-50' : ''}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getColor(d)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {getInitials(d)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0D1B2A] text-sm">{d.firstName} {d.lastName}</p>
                      <p className="text-xs text-gray-400">ID: COUR-{d.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 mb-1">✉ {d.email}</div>
                  <div className="text-sm text-gray-600">□ {d.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm border border-gray-200 rounded-lg px-3 py-1 text-gray-600 w-fit">
                    {d.vehicleType ?? '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-[#0D1B2A]">{d.walletBalance.toFixed(2)}€</span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={d.driverStatus} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {d.driverStatus === 'ACTIVE' ? (
                      <button
                        onClick={() => suspendMutation.mutate(d.id)}
                        className="w-8 h-8 rounded-lg border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 transition"
                      >
                        <Ban size={14} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => validateMutation.mutate(d.id)}
                          className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-200 transition"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => suspendMutation.mutate(d.id)}
                          className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200 transition"
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                    <button onClick={() => setSelected(d)} className="text-gray-400 hover:text-[#0D1B2A] transition ml-1">
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <DriverDetailModal driver={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
