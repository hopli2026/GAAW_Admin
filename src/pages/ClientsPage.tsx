import { useState } from 'react'
import { Eye, Lock, Search } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import type { AdminClient } from '../types'
import ClientDetailModal from '../components/ClientDetailModal'

export default function ClientsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AdminClient | null>(null)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => adminApi.getClients().then(r => r.data),
  })

  const blockMutation = useMutation({
    mutationFn: (id: number) => adminApi.blockClient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const filtered = clients.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0D1B2A]">Gestion des Clients</h2>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm w-72">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text" placeholder="Rechercher..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-600 w-full bg-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Client', 'Contact', 'Commandes', 'Statut', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Aucun client.</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c.id} className={i !== filtered.length - 1 ? 'border-b border-gray-50' : ''}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[#0D1B2A] font-bold text-sm shrink-0">
                      {c.firstName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0D1B2A] text-sm">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-gray-400">ID: CLIENT-{c.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">□ {c.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1 w-fit">
                    📋 {c.totalOrders}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.blocked ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
                    {c.blocked ? 'BLOQUÉ' : 'ACTIF'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => blockMutation.mutate(c.id)}
                      className="w-8 h-8 rounded-lg border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 transition"
                    >
                      <Lock size={14} />
                    </button>
                    <button onClick={() => setSelected(c)} className="text-gray-400 hover:text-[#0D1B2A] transition">
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <ClientDetailModal client={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
