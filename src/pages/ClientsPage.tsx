import { useState } from 'react'
import { Eye, Lock, LockOpen, Search } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import type { AdminClient } from '../types'
import ClientDetailModal from '../components/ClientDetailModal'
import { TableLoader } from '../components/ui/Spinner'
import ConfirmModal from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'

export default function ClientsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<AdminClient | null>(null)
  const [confirm, setConfirm] = useState<{ id: number; action: 'block' | 'unblock' } | null>(null)

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => adminApi.getClients().then(r => r.data),
  })

  const blockMutation = useMutation({
    mutationFn: (id: number) => adminApi.blockClient(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast('Client bloqué') },
    onError: () => toast('Erreur lors du blocage', 'error'),
  })
  const unblockMutation = useMutation({
    mutationFn: (id: number) => adminApi.unblockClient(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clients'] }); toast('Client débloqué') },
    onError: () => toast('Erreur lors du déblocage', 'error'),
  })

  const handleConfirm = () => {
    if (!confirm) return
    if (confirm.action === 'block') blockMutation.mutate(confirm.id)
    else unblockMutation.mutate(confirm.id)
    setConfirm(null)
  }

  const filtered = clients.filter(c =>
    `${c.firstName ?? ''} ${c.lastName ?? ''}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
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
              <TableLoader cols={5} />
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">Aucun client.</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c.id} className={i !== filtered.length - 1 ? 'border-b border-gray-50' : ''}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[#0D1B2A] font-bold text-sm shrink-0">
                      {c.firstName?.[0] ?? '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0D1B2A] text-sm">{c.firstName ?? '—'} {c.lastName ?? ''}</p>
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
                    {c.blocked ? (
                      <button
                        onClick={() => setConfirm({ id: c.id, action: 'unblock' })}
                        className="w-8 h-8 rounded-lg border border-green-200 flex items-center justify-center text-green-500 hover:bg-green-50 transition cursor-pointer"
                        title="Débloquer"
                      >
                        <LockOpen size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirm({ id: c.id, action: 'block' })}
                        className="w-8 h-8 rounded-lg border border-red-200 flex items-center justify-center text-red-400 hover:bg-red-50 transition cursor-pointer"
                        title="Bloquer"
                      >
                        <Lock size={14} />
                      </button>
                    )}
                    <button onClick={() => setSelected(c)} className="text-gray-400 hover:text-[#0D1B2A] transition cursor-pointer">
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ClientDetailModal
          client={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => setSelected(updated)}
          onDeleted={() => setSelected(null)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.action === 'block' ? 'Bloquer ce client ?' : 'Débloquer ce client ?'}
          message={confirm.action === 'block'
            ? 'Le client ne pourra plus passer de commandes.'
            : 'Le client retrouvera accès à l\'application.'}
          confirmLabel={confirm.action === 'block' ? 'Bloquer' : 'Débloquer'}
          danger={confirm.action === 'block'}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
