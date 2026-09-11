import { useState } from 'react'
// KeyRound, Eye, EyeOff : réservés à la section mot de passe, désactivée plus bas.
import { X, ShoppingBag, Euro, TrendingUp, Pencil, Save, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import type { AdminClient, AdminOrder } from '../types'
import ConfirmModal from './ui/ConfirmModal'

const STATUS_STYLES: Record<string, string> = {
  DELIVERED:    'bg-green-100 text-green-600',
  CANCELLED:    'bg-red-100 text-red-500',
  IN_DELIVERY:  'bg-blue-100 text-blue-500',
  SEARCHING:    'bg-yellow-100 text-yellow-600',
}

interface Props {
  client: AdminClient
  onClose: () => void
  onUpdated?: (updated: AdminClient) => void
  onDeleted?: () => void
}

function OrderRow({ order }: { order: AdminOrder }) {
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D1B2A]">COURSE-{order.id}</p>
        <p className="text-xs text-gray-400">{date} — {order.pickupAddress.split(',')[0]}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#0D1B2A]">{order.price?.toFixed(2) ?? '0.00'}€</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {order.status}
        </span>
      </div>
    </div>
  )
}

export default function ClientDetailModal({ client, onClose, onUpdated, onDeleted }: Props) {
  const queryClient = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [form, setForm] = useState({
    firstName: client.firstName ?? '',
    lastName:  client.lastName  ?? '',
    email:     client.email     ?? '',
    phone:     client.phone     ?? '',
  })

  // Changement de mot de passe désactivé : un administrateur ne devrait pas pouvoir
  // définir le mot de passe d'un client. Conservé en commentaire en attendant l'arbitrage.
  // const [pwSection, setPwSection] = useState(false)
  // const [pw, setPw]               = useState('')
  // const [showPw, setShowPw]       = useState(false)
  // const [pwSuccess, setPwSuccess] = useState(false)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['client-orders', client.id],
    queryFn: () => adminApi.getClientOrders(client.id).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateClient(client.id, form),
    onSuccess: (res) => {
      const updated = res.data
      queryClient.setQueryData<AdminClient[]>(['clients'], old =>
        old ? old.map(c => c.id === updated.id ? updated : c) : old
      )
      onUpdated?.(updated)
      setEditing(false)
    },
  })

  // Désactivé avec la section mot de passe (voir plus haut).
  // const passwordMutation = useMutation({
  //   mutationFn: () => adminApi.resetClientPassword(client.id, pw),
  //   onSuccess: () => {
  //     setPw('')
  //     setPwSection(false)
  //     setPwSuccess(true)
  //     setTimeout(() => setPwSuccess(false), 3000)
  //   },
  // })

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteClient(client.id),
    onSuccess: () => {
      queryClient.setQueryData<AdminClient[]>(['clients'], old =>
        old ? old.filter(c => c.id !== client.id) : old
      )
      onDeleted?.()
    },
    onError: (e: any) => {
      setDeleteError(e?.response?.data?.message ?? 'Erreur lors de la suppression.')
      setShowDeleteConfirm(false)
    },
  })

  const avgBasket = orders.length > 0 ? orders.reduce((s, o) => s + (o.price ?? 0), 0) / orders.length : 0
  const displayFirst = editing ? form.firstName : (client.firstName ?? '')
  const displayLast  = editing ? form.lastName  : (client.lastName  ?? '')
  const initials = `${displayFirst[0] ?? ''}${displayLast[0] ?? ''}`.toUpperCase()

  const cancelEdit = () => {
    setEditing(false)
    setForm({
      firstName: client.firstName ?? '',
      lastName:  client.lastName  ?? '',
      email:     client.email     ?? '',
      phone:     client.phone     ?? '',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-[#0D1B2A] font-bold text-lg">
              {initials || '?'}
            </div>
            <div>
              <h2 className="font-bold text-[#0D1B2A] text-lg">
                {`${displayFirst} ${displayLast}`.trim() || '—'}
              </h2>
              <p className="text-sm text-gray-400">{editing ? form.email : (client.email ?? '—')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${client.blocked ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
              {client.blocked ? 'BLOQUÉ' : 'ACTIF'}
            </span>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#0D1B2A] hover:border-gray-300 transition cursor-pointer"
                title="Modifier les infos"
              >
                <Pencil size={14} />
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-[#0D1B2A] transition cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Infos client (lecture ou édition) */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Prénom</label>
                {editing ? (
                  <input
                    type="text" value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                  />
                ) : (
                  <p className="text-sm font-semibold text-[#0D1B2A]">{client.firstName || '—'}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nom</label>
                {editing ? (
                  <input
                    type="text" value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                  />
                ) : (
                  <p className="text-sm font-semibold text-[#0D1B2A]">{client.lastName || '—'}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              {editing ? (
                <input
                  type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                />
              ) : (
                <p className="text-sm font-semibold text-[#0D1B2A]">{client.email || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Téléphone</label>
              {editing ? (
                <input
                  type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                />
              ) : (
                <p className="text-sm font-semibold text-[#0D1B2A]">{client.phone || '—'}</p>
              )}
            </div>

            {editing && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-1.5 bg-[#0D1B2A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  <Save size={14} />
                  {updateMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-sm text-gray-400 hover:text-[#0D1B2A] px-4 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
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

          {/*
            Section « Changer le mot de passe » désactivée.
            Un administrateur ne devrait pas pouvoir définir le mot de passe d'un client.
            L'état et la mutation associés sont commentés plus haut, et l'endpoint
            adminApi.resetClientPassword reste disponible côté API.

          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => { setPwSection(v => !v); setPw(''); setPwSuccess(false) }}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#0D1B2A] hover:bg-gray-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <KeyRound size={15} className="text-gray-400" />
                Changer le mot de passe
              </div>
              <span className="text-gray-300 text-xs">{pwSection ? '▲' : '▼'}</span>
            </button>

            {pwSection && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                {pwSuccess && (
                  <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                    Mot de passe modifié avec succès.
                  </p>
                )}
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Nouveau mot de passe"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition pr-10"
                  />
                  <button
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <button
                  onClick={() => passwordMutation.mutate()}
                  disabled={!pw || passwordMutation.isPending}
                  className="w-full bg-[#0D1B2A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-40"
                >
                  {passwordMutation.isPending ? 'Modification…' : 'Modifier le mot de passe'}
                </button>
              </div>
            )}
          </div>
          */}

          {/* Historique des commandes */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Historique des commandes</h3>
            {isLoading ? (
              <p className="text-sm text-gray-400 text-center py-4">Chargement...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Aucune commande.</p>
            ) : (
              <div className="bg-gray-50 rounded-xl px-4 pt-1 pb-1 max-h-52 overflow-y-auto">
                {orders.map(o => <OrderRow key={o.id} order={o} />)}
              </div>
            )}
          </div>

          {/* Suppression */}
          <div className="border border-red-100 rounded-xl overflow-hidden">
            <button
              onClick={() => { setShowDeleteConfirm(true); setDeleteError('') }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition cursor-pointer"
            >
              <Trash2 size={15} />
              Supprimer le compte
            </button>
            {deleteError && (
              <p className="px-4 pb-3 text-xs text-red-500">{deleteError}</p>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="Supprimer le client"
          message={`Supprimer définitivement ${client.firstName} ${client.lastName} ? Cette action est irréversible.`}
          confirmLabel={deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
