import { useState, useEffect } from 'react'
import { Settings, Save, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'

export default function ParametresPage() {
  const queryClient = useQueryClient()
  const { data: config } = useQuery({ queryKey: ['settings'], queryFn: () => adminApi.getSettings().then(r => r.data) })

  const [basePrice, setBasePrice] = useState('7.5')
  const [pricePerKm, setPricePerKm] = useState('0.90')
  const [largePackageSurcharge, setLargePackageSurcharge] = useState('8')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (config) {
      setBasePrice(String(config.basePrice))
      setPricePerKm(String(config.pricePerKm))
      setLargePackageSurcharge(String(config.largePackageSurcharge))
    }
  }, [config])

  const mutation = useMutation({
    mutationFn: () => adminApi.updateSettings(Number(basePrice), Number(pricePerKm), Number(largePackageSurcharge)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#0D1B2A] mb-6">Paramètres</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-100">
          <Settings size={20} className="text-[#0D1B2A]" />
          <h3 className="font-bold text-[#0D1B2A] text-lg">Tarification</h3>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-3 gap-6 mb-3">
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">Prix de base (€)</label>
              <input
                type="number" step="0.01" value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#CCFF00] transition"
              />
              <p className="text-xs text-gray-400 mt-1">Tarif fixe pour les 5 premiers km</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">Prix par km (€)</label>
              <input
                type="number" step="0.01" value={pricePerKm}
                onChange={(e) => setPricePerKm(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#CCFF00] transition"
              />
              <p className="text-xs text-gray-400 mt-1">Appliqué au-delà de 5 km</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0D1B2A] mb-2">Supplément Grand colis (€)</label>
              <input
                type="number" step="0.01" value={largePackageSurcharge}
                onChange={(e) => setLargePackageSurcharge(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#0D1B2A] outline-none focus:ring-2 focus:ring-[#CCFF00] transition"
              />
              <p className="text-xs text-gray-400 mt-1">Ajouté au prix S/M, toutes distances</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Formule : 0-5 km = prix de base fixe · au-delà = prix de base + (prix/km × distance) · colis Grand = + supplément, quelle que soit la distance.
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5">
              <AlertCircle size={15} className="text-orange-500 shrink-0" />
              <p className="text-sm text-orange-600">Les modifications s'appliquent immédiatement.</p>
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex items-center gap-2 bg-[#CCFF00] text-[#0D1B2A] font-bold px-6 py-3 rounded-xl hover:brightness-95 active:scale-[0.98] transition disabled:opacity-60"
            >
              <Save size={16} />
              {mutation.isPending ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
