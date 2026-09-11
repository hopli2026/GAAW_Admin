import { useState } from 'react'
import { X, MapPin, Package, CreditCard, Calendar, XCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AdminOrder } from '../types'
import { adminApi } from '../api/admin'
import { useToast } from '../context/ToastContext'
import ConfirmModal from './ui/ConfirmModal'
import gaawLogo from '../assets/gaaw-logo.png'

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '')

function toAbsoluteUrl(url: string) {
  if (!url) return url
  return url.startsWith('http') ? url : `${API_ORIGIN}${url}`
}

const VEHICLE_LABELS: Record<string, string> = {
  BICYCLE: 'Vélo',
  SCOOTER: 'Scooter',
  CAR: 'Voiture',
}

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

const CANCELLABLE = ['SEARCHING', 'AWAITING_PAYMENT', 'ACCEPTED', 'ARRIVED_PICKUP', 'IN_DELIVERY']

interface Props {
  order: AdminOrder
  onClose: () => void
  onCancelled?: (id: number) => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-[#0D1B2A]">{value}</span>
    </div>
  )
}

export default function CourseDetailModal({ order, onClose, onCancelled }: Props) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [confirmCancel, setConfirmCancel] = useState(false)
  // La photo est stockée sur le disque local du backend, qui est éphémère sur Render :
  // l'URL peut rester en base alors que le fichier a disparu. Sans ce drapeau, on
  // afficherait une icône d'image cassée sans explication.
  const [pickupPhotoMissing, setPickupPhotoMissing] = useState(false)
  const [deliveryPhotoMissing, setDeliveryPhotoMissing] = useState(false)

  const cancelMutation = useMutation({
    mutationFn: () => adminApi.cancelOrder(order.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      onCancelled?.(order.id)
      toast('Course annulée')
      setConfirmCancel(false)
    },
    onError: () => toast("Impossible d'annuler cette course", 'error'),
  })

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  function renderPhotoCard(label: string, url: string | null | undefined, missing: boolean, setMissing: (v: boolean) => void) {
    return (
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{label}</h3>
        {url && !missing ? (
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <img
              src={toAbsoluteUrl(url)}
              alt={label}
              onError={() => setMissing(true)}
              className="w-full object-contain max-h-72 bg-black/5"
            />
            <div className="flex items-center justify-end px-3 py-2 bg-gray-50">
              <a
                href={toAbsoluteUrl(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#0D1B2A] hover:underline flex items-center gap-1"
              >
                <MapPin size={11} /> Ouvrir en grand
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-8 gap-2 px-4 text-center">
            <img src={gaawLogo} alt="GAAW" className="w-12 h-12 opacity-20" />
            {missing ? (
              <>
                <p className="text-sm text-gray-400">Photo introuvable sur le serveur</p>
                <p className="text-xs text-gray-300">
                  Le fichier a été perdu lors d'un redéploiement. Les photos ne sont pas
                  encore stockées de façon durable.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-300">Aucune photo disponible</p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0D1B2A] flex items-center justify-center">
                <Package size={18} className="text-[#CCFF00]" />
              </div>
              <div>
                <h2 className="font-bold text-[#0D1B2A] text-lg">COURSE-{order.id}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              {CANCELLABLE.includes(order.status) && (
                <button
                  onClick={() => setConfirmCancel(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 px-3 py-1 rounded-xl hover:bg-red-50 transition cursor-pointer"
                >
                  <XCircle size={13} /> Annuler
                </button>
              )}
              <button onClick={onClose} className="text-gray-400 hover:text-[#0D1B2A] transition cursor-pointer">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Itinéraire */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Itinéraire</h3>
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                <div className="flex items-start gap-3 mb-4">
                  <div className="absolute left-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Départ</p>
                    <p className="text-sm font-semibold text-[#0D1B2A]">{order.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="absolute left-0 bottom-0 w-4 h-4 rounded-full bg-orange-400 border-2 border-white shadow" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Destination</p>
                    <p className="text-sm font-semibold text-[#0D1B2A]">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Client / Livreur */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-semibold mb-2">Client</p>
                <p className="font-bold text-[#0D1B2A] text-sm">{order.client ? `${order.client.firstName ?? ''} ${order.client.lastName ?? ''}` : 'Compte supprimé'}</p>
                <p className="text-xs text-gray-400">{order.client?.phone ?? '—'}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-semibold mb-2">Livreur</p>
                {order.driver ? (
                  <>
                    <p className="font-bold text-[#0D1B2A] text-sm">{order.driver.firstName} {order.driver.lastName}</p>
                    <p className="text-xs text-gray-400">{order.driver.phone}</p>
                    {order.driver.vehicleType && (
                      <p className="text-xs text-gray-400">{VEHICLE_LABELS[order.driver.vehicleType] ?? order.driver.vehicleType}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">Non assigné</p>
                )}
              </div>
            </div>

            {/* Tarification */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CreditCard size={13} /> Tarification
              </h3>
              <div className="bg-gray-50 rounded-xl px-4 pt-2 pb-1">
                <Row label="Distance" value={order.distanceKm != null ? `${order.distanceKm.toFixed(1)} km` : '—'} />
                <Row label="Mode de paiement" value={order.paymentMethod ?? '—'} />
                <Row label="Taille colis" value={order.packageSize ?? '—'} />
                <Row label="À collecter" value={order.amountToCollect != null ? `${order.amountToCollect.toFixed(2)}€` : '—'} />
                <div className="flex items-center justify-between py-3 mt-1 border-t border-gray-200">
                  <span className="font-bold text-[#0D1B2A]">Total course</span>
                  <span className="font-bold text-xl text-[#0D1B2A]">{order.price != null ? order.price.toFixed(2) : '0.00'}€</span>
                </div>
              </div>
            </div>

            {/* Photos : retrait vs livraison, pour comparaison en cas de litige */}
            <div className="grid grid-cols-2 gap-3">
              {renderPhotoCard('Photo au retrait', order.pickupPhotoUrl, pickupPhotoMissing, setPickupPhotoMissing)}
              {renderPhotoCard('Photo à la livraison', order.deliveryPhotoUrl, deliveryPhotoMissing, setDeliveryPhotoMissing)}
            </div>
          </div>
        </div>
      </div>

      {confirmCancel && (
        <ConfirmModal
          title="Annuler la course ?"
          message={`La course COURSE-${order.id} sera marquée comme annulée. Cette action est irréversible.`}
          confirmLabel={cancelMutation.isPending ? 'Annulation…' : 'Oui, annuler'}
          onConfirm={() => cancelMutation.mutate()}
          onCancel={() => setConfirmCancel(false)}
        />
      )}
    </>
  )
}
