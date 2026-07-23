import { useState } from 'react'
import {
  X, Truck, CheckCircle, XCircle, Euro, Pencil, Save, KeyRound,
  Eye, EyeOff, FileText, ExternalLink, Trash2, RefreshCw, AlertCircle,
  User, FolderOpen, Clock, Settings2,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import type { AdminDriver, AdminOrder, DriverDocument } from '../types'
import ConfirmModal from './ui/ConfirmModal'

const VEHICLE_LABELS: Record<string, string> = {
  BICYCLE: 'Vélo',
  SCOOTER: 'Scooter',
  CAR: 'Voiture',
}

const DOC_LABELS: Record<string, string> = {
  ID_CARD_FRONT:        "Carte d'identité (Recto)",
  ID_CARD_BACK:         "Carte d'identité (Verso)",
  DRIVER_LICENSE_FRONT: 'Permis de conduire (Recto)',
  DRIVER_LICENSE_BACK:  'Permis de conduire (Verso)',
  VEHICLE_REGISTRATION: 'Carte grise',
  VEHICLE_INSURANCE:    'Assurance véhicule',
}

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '')

function toAbsoluteUrl(url: string) {
  if (!url) return url
  if (url.startsWith('http')) return url
  return `${API_ORIGIN}${url}`
}

function isImage(url: string) {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext ?? '')
}

function DocumentCard({ doc }: { doc: DriverDocument }) {
  const [expanded, setExpanded] = useState(false)
  const label = DOC_LABELS[doc.type] ?? doc.type
  const absUrl = toAbsoluteUrl(doc.fileUrl)
  const image = isImage(doc.fileUrl)
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-gray-400" />
          <span className="text-sm font-semibold text-[#0D1B2A]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={absUrl} target="_blank" rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#0D1B2A] transition" title="Ouvrir dans un nouvel onglet">
            <ExternalLink size={14} />
          </a>
          {image && (
            <button onClick={() => setExpanded(v => !v)}
              className="text-xs font-semibold text-[#0D1B2A] hover:underline cursor-pointer">
              {expanded ? 'Masquer' : 'Voir'}
            </button>
          )}
        </div>
      </div>
      {expanded && image && <img src={absUrl} alt={label} className="w-full object-contain max-h-64 bg-black/5" />}
    </div>
  )
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  DELIVERED:   'bg-green-100 text-green-600',
  CANCELLED:   'bg-red-100 text-red-500',
  IN_DELIVERY: 'bg-blue-100 text-blue-500',
  SEARCHING:   'bg-yellow-100 text-yellow-600',
}

function OrderRow({ order }: { order: AdminOrder }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0D1B2A]">COURSE-{order.id}</p>
        <p className="text-xs text-gray-400 truncate">
          {order.pickupAddress.split(',')[0]} → {order.deliveryAddress.split(',')[0]}
        </p>
        <p className="text-xs text-gray-300 mt-0.5">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-[#0D1B2A]">{order.price?.toFixed(2) ?? '0.00'}€</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ORDER_STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {order.status}
        </span>
      </div>
    </div>
  )
}

type Tab = 'infos' | 'documents' | 'courses' | 'actions'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'infos',     label: 'Infos',      icon: User },
  { id: 'documents', label: 'Documents',  icon: FolderOpen },
  { id: 'courses',   label: 'Courses',    icon: Clock },
  { id: 'actions',   label: 'Actions',    icon: Settings2 },
]

interface Props {
  driver: AdminDriver
  onClose: () => void
  onUpdated?: (updated: AdminDriver) => void
  onDeleted?: () => void
}

export default function DriverDetailModal({ driver, onClose, onUpdated, onDeleted }: Props) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('infos')
  const [editing, setEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [showResubmitConfirm, setShowResubmitConfirm] = useState(false)
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

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['driver-orders', driver.id],
    queryFn: () => adminApi.getDriverOrders(driver.id).then(r => r.data),
  })
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['driver-documents', driver.id],
    queryFn: () => adminApi.getDriverDocuments(driver.id).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateDriver(driver.id, form),
    onSuccess: (res) => {
      const updated = res.data
      queryClient.setQueryData<AdminDriver[]>(['drivers'], old =>
        old ? old.map(d => d.id === updated.id ? updated : d) : old)
      onUpdated?.(updated)
      setEditing(false)
    },
  })
  const passwordMutation = useMutation({
    mutationFn: () => adminApi.resetDriverPassword(driver.id, pw),
    onSuccess: () => { setPw(''); setPwSection(false); setPwSuccess(true); setTimeout(() => setPwSuccess(false), 3000) },
  })
  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteDriver(driver.id),
    onSuccess: () => {
      queryClient.setQueryData<AdminDriver[]>(['drivers'], old =>
        old ? old.filter(d => d.id !== driver.id) : old)
      onDeleted?.()
    },
    onError: (e: any) => {
      setDeleteError(e?.response?.data?.message ?? 'Erreur lors de la suppression.')
      setShowDeleteConfirm(false)
    },
  })
  const resubmissionMutation = useMutation({
    mutationFn: () => adminApi.requestResubmission(driver.id),
    onSuccess: () => {
      const updated = { ...driver, driverStatus: 'PENDING_VERIFICATION' as const, blocked: false }
      queryClient.setQueryData<AdminDriver[]>(['drivers'], old =>
        old ? old.map(d => d.id === driver.id ? updated : d) : old)
      onUpdated?.(updated)
      setShowResubmitConfirm(false)
    },
  })

  const delivered   = orders.filter(o => o.status === 'DELIVERED').length
  const displayFirst = editing ? form.firstName : (driver.firstName ?? '')
  const displayLast  = editing ? form.lastName  : (driver.lastName  ?? '')
  const initials     = `${displayFirst[0] ?? ''}${displayLast[0] ?? ''}`.toUpperCase()
  const cashOwed     = driver.cashCommissionOwed ?? 0

  const cancelEdit = () => {
    setEditing(false)
    setForm({ firstName: driver.firstName ?? '', lastName: driver.lastName ?? '', email: driver.email ?? '', phone: driver.phone ?? '' })
  }

  const statusBadge = () => {
    if (driver.driverStatus === 'ACTIVE')    return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-600">VALIDÉ</span>
    if (driver.driverStatus === 'SUSPENDED') return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-500">SUSPENDU</span>
    return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-600">EN ATTENTE</span>
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="w-12 h-12 rounded-full bg-[#0D1B2A] flex items-center justify-center text-[#CCFF00] font-bold text-lg shrink-0">
            {initials || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-[#0D1B2A] text-lg leading-tight">
                {`${displayFirst} ${displayLast}`.trim() || '—'}
              </h2>
              {statusBadge()}
            </div>
            <p className="text-sm text-gray-400 truncate">{driver.email ?? '—'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#0D1B2A] transition cursor-pointer shrink-0">
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0 px-2">
          {TABS.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                  active
                    ? 'border-[#0D1B2A] text-[#0D1B2A]'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto">

          {/* ── INFOS ── */}
          {activeTab === 'infos' && (
            <div className="p-6 space-y-6">

              {/* Champs */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Coordonnées</p>
                  {!editing && (
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-[#0D1B2A] transition cursor-pointer">
                      <Pencil size={12} /> Modifier
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Prénom</label>
                    {editing
                      ? <input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B2A] bg-white" />
                      : <p className="text-sm font-semibold text-[#0D1B2A]">{driver.firstName || '—'}</p>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Nom</label>
                    {editing
                      ? <input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B2A] bg-white" />
                      : <p className="text-sm font-semibold text-[#0D1B2A]">{driver.lastName || '—'}</p>}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  {editing
                    ? <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B2A] bg-white" />
                    : <p className="text-sm font-semibold text-[#0D1B2A]">{driver.email || '—'}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Téléphone</label>
                  {editing
                    ? <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B2A] bg-white" />
                    : <p className="text-sm font-semibold text-[#0D1B2A]">{driver.phone || '—'}</p>}
                </div>
                {!editing && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Véhicule</label>
                    <div className="flex items-center gap-1.5">
                      <Truck size={14} className="text-gray-400" />
                      <p className="text-sm font-semibold text-[#0D1B2A]">
                        {(driver.vehicleType && VEHICLE_LABELS[driver.vehicleType]) ?? driver.vehicleType ?? '—'}
                      </p>
                    </div>
                  </div>
                )}
                {editing && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
                      className="flex items-center gap-1.5 bg-[#0D1B2A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50">
                      <Save size={14} />
                      {updateMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                    <button onClick={cancelEdit}
                      className="text-sm text-gray-400 hover:text-[#0D1B2A] px-4 py-2 rounded-xl border border-gray-200 transition cursor-pointer">
                      Annuler
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Financier</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0D1B2A] rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Wallet (gains)</p>
                    <div className="flex items-center gap-1">
                      <Euro size={14} className="text-[#CCFF00]" />
                      <p className="font-bold text-white text-xl">{driver.walletBalance.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className={`rounded-xl p-4 ${cashOwed > 0 ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-400 mb-1">Commission espèces due</p>
                    <div className="flex items-center gap-1">
                      {cashOwed > 0 && <AlertCircle size={14} className="text-orange-400 shrink-0" />}
                      <p className={`font-bold text-xl ${cashOwed > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
                        {cashOwed.toFixed(2)}€
                      </p>
                    </div>
                    {cashOwed > 0 && (
                      <p className="text-xs text-orange-400 mt-1">Déduit du prochain virement</p>
                    )}
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Courses livrées</p>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={14} className="text-green-500" />
                      <p className="font-bold text-[#0D1B2A] text-xl">{delivered}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Total courses</p>
                    <div className="flex items-center gap-1">
                      <XCircle size={14} className="text-gray-400" />
                      <p className="font-bold text-[#0D1B2A] text-xl">{orders.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sécurité</p>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <button onClick={() => { setPwSection(v => !v); setPw(''); setPwSuccess(false) }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#0D1B2A] hover:bg-gray-50 transition cursor-pointer">
                    <div className="flex items-center gap-2">
                      <KeyRound size={15} className="text-gray-400" />
                      Changer le mot de passe
                    </div>
                    <span className="text-gray-300 text-xs">{pwSection ? '▲' : '▼'}</span>
                  </button>
                  {pwSection && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                      {pwSuccess && <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">Mot de passe modifié avec succès.</p>}
                      <div className="relative">
                        <input type={showPw ? 'text' : 'password'} placeholder="Nouveau mot de passe" value={pw}
                          onChange={e => setPw(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0D1B2A] pr-10" />
                        <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <button onClick={() => passwordMutation.mutate()} disabled={!pw || passwordMutation.isPending}
                        className="w-full bg-[#0D1B2A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-40">
                        {passwordMutation.isPending ? 'Modification…' : 'Modifier le mot de passe'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {activeTab === 'documents' && (
            <div className="p-6">
              {docsLoading ? (
                <p className="text-sm text-gray-400 text-center py-12">Chargement…</p>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                  <FolderOpen size={40} className="mb-3" />
                  <p className="text-sm font-semibold">Aucun document soumis</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc: DriverDocument) => <DocumentCard key={doc.type} doc={doc} />)}
                </div>
              )}
            </div>
          )}

          {/* ── COURSES ── */}
          {activeTab === 'courses' && (
            <div className="p-6">
              {ordersLoading ? (
                <p className="text-sm text-gray-400 text-center py-12">Chargement…</p>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                  <Clock size={40} className="mb-3" />
                  <p className="text-sm font-semibold">Aucune course</p>
                </div>
              ) : (
                <div>
                  {orders.map(o => <OrderRow key={o.id} order={o} />)}
                </div>
              )}
            </div>
          )}

          {/* ── ACTIONS ── */}
          {activeTab === 'actions' && (
            <div className="p-6 space-y-4">

              {driver.driverStatus !== 'PENDING_VERIFICATION' && (
                <div className="border border-orange-100 rounded-xl overflow-hidden">
                  <button onClick={() => setShowResubmitConfirm(true)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-orange-500 hover:bg-orange-50 transition cursor-pointer">
                    <RefreshCw size={16} />
                    <div className="text-left">
                      <p>Demander une re-soumission de documents</p>
                      <p className="text-xs font-normal text-orange-400 mt-0.5">Passe le statut en "En attente" et notifie le livreur</p>
                    </div>
                  </button>
                </div>
              )}

              <div className="border border-red-100 rounded-xl overflow-hidden">
                <button onClick={() => { setShowDeleteConfirm(true); setDeleteError('') }}
                  className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-red-500 hover:bg-red-50 transition cursor-pointer">
                  <Trash2 size={16} />
                  <div className="text-left">
                    <p>Supprimer le compte</p>
                    <p className="text-xs font-normal text-red-400 mt-0.5">Action irréversible — les commandes sont anonymisées</p>
                  </div>
                </button>
                {deleteError && <p className="px-5 pb-4 text-xs text-red-500">{deleteError}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {showResubmitConfirm && (
        <ConfirmModal
          title="Demander une re-soumission ?"
          message={`Le livreur ${driver.firstName} ${driver.lastName} recevra une notification pour re-soumettre ses documents. Son statut passera en attente.`}
          confirmLabel={resubmissionMutation.isPending ? 'Envoi…' : 'Confirmer'}
          onConfirm={() => resubmissionMutation.mutate()}
          onCancel={() => setShowResubmitConfirm(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Supprimer le livreur"
          message={`Supprimer définitivement ${driver.firstName} ${driver.lastName} ? Cette action est irréversible.`}
          confirmLabel={deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  )
}
