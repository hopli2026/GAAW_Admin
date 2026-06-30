import { useState } from 'react'
import { X, Truck, CheckCircle, XCircle, Euro, Pencil, Save, KeyRound, Eye, EyeOff } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  onUpdated?: (updated: AdminDriver) => void
}

function OrderRow({ order }: { order: AdminOrder }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D1B2A]">ORD-{order.id}</p>
        <p className="text-xs text-gray-400 truncate">{order.pickupAddress.split(',')[0]} → {order.deliveryAddress.split(',')[0]}</p>
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

export default function DriverDetailModal({ driver, onClose, onUpdated }: Props) {
  const queryClient = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    firstName: driver.firstName ?? '',
    lastName:  driver.lastName  ?? '',
    email:     driver.email     ?? '',
    phone:     driver.phone     ?? '',
  })

  const [pwSection, setPwSection] = useState(false)
  const [pw, setPw]               = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['driver-orders', driver.id],
    queryFn: () => adminApi.getDriverOrders(driver.id).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateDriver(driver.id, form),
    onSuccess: (res) => {
      const updated = res.data
      queryClient.setQueryData<AdminDriver[]>(['drivers'], old =>
        old ? old.map(d => d.id === updated.id ? updated : d) : old
      )
      onUpdated?.(updated)
      setEditing(false)
    },
  })

  const passwordMutation = useMutation({
    mutationFn: () => adminApi.resetDriverPassword(driver.id, pw),
    onSuccess: () => {
      setPw('')
      setPwSection(false)
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 3000)
    },
  })

  const delivered = orders.filter(o => o.status === 'DELIVERED').length
  const displayFirst = editing ? form.firstName : (driver.firstName ?? '')
  const displayLast  = editing ? form.lastName  : (driver.lastName  ?? '')
  const initials = `${displayFirst[0] ?? ''}${displayLast[0] ?? ''}`.toUpperCase()

  const cancelEdit = () => {
    setEditing(false)
    setForm({
      firstName: driver.firstName ?? '',
      lastName:  driver.lastName  ?? '',
      email:     driver.email     ?? '',
      phone:     driver.phone     ?? '',
    })
  }

  const statusBadge = () => {
    if (driver.driverStatus === 'ACTIVE')    return <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-600">VALIDÉ</span>
    if (driver.driverStatus === 'SUSPENDED') return <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-500">SUSPENDU</span>
    return <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-600">EN ATTENTE</span>
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0D1B2A] flex items-center justify-center text-[#CCFF00] font-bold text-lg">
              {initials || '?'}
            </div>
            <div>
              <h2 className="font-bold text-[#0D1B2A] text-lg">
                {`${displayFirst} ${displayLast}`.trim() || '—'}
              </h2>
              <p className="text-sm text-gray-400">{editing ? form.email : (driver.email ?? '—')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge()}
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

          {/* Infos éditables */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Prénom</label>
                {editing ? (
                  <input type="text" value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                  />
                ) : (
                  <p className="text-sm font-semibold text-[#0D1B2A]">{driver.firstName || '—'}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nom</label>
                {editing ? (
                  <input type="text" value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                  />
                ) : (
                  <p className="text-sm font-semibold text-[#0D1B2A]">{driver.lastName || '—'}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              {editing ? (
                <input type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                />
              ) : (
                <p className="text-sm font-semibold text-[#0D1B2A]">{driver.email || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Téléphone</label>
              {editing ? (
                <input type="tel" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                />
              ) : (
                <p className="text-sm font-semibold text-[#0D1B2A]">{driver.phone || '—'}</p>
              )}
            </div>
            {!editing && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Véhicule</label>
                <div className="flex items-center gap-1.5">
                  <Truck size={14} className="text-gray-400" />
                  <p className="text-sm font-semibold text-[#0D1B2A]">{driver.vehicleType ?? '—'}</p>
                </div>
              </div>
            )}

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
            <div className="bg-[#0D1B2A] rounded-xl p-4">
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

          {/* Mot de passe */}
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
                  <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
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

          {/* Documents */}
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

          {/* Historique */}
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
