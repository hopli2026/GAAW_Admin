import { useState } from 'react'
import { X, Save, KeyRound, Eye, EyeOff } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import { useAuth } from '../context/AuthContext'

interface Props {
  onClose: () => void
}

export default function AdminProfileModal({ onClose }: Props) {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    email:     user?.email     ?? '',
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [pwSection, setPwSection] = useState(false)
  const [pw, setPw]               = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)

  const initials = `${form.firstName[0] ?? ''}${form.lastName[0] ?? ''}`.toUpperCase()

  const updateMutation = useMutation({
    mutationFn: () => adminApi.updateProfile(form),
    onSuccess: (res) => {
      updateUser({ firstName: res.data.firstName, lastName: res.data.lastName, email: res.data.email })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    },
  })

  const passwordMutation = useMutation({
    mutationFn: () => adminApi.updateProfilePassword(pw),
    onSuccess: () => {
      setPw('')
      setPwSection(false)
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 3000)
    },
  })

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#0D1B2A] flex items-center justify-center text-[#CCFF00] font-bold text-lg">
              {initials || 'A'}
            </div>
            <div>
              <h2 className="font-bold text-[#0D1B2A] text-lg">Mon compte</h2>
              <p className="text-xs text-gray-400">{user?.role ?? 'ADMIN'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#0D1B2A] transition cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Infos */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {saveSuccess && (
              <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">Profil mis à jour.</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Prénom</label>
                <input
                  type="text" value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Nom</label>
                <input
                  type="text" value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input
                type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0D1B2A] outline-none focus:border-[#0D1B2A] transition bg-white"
              />
            </div>
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1.5 bg-[#0D1B2A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              {updateMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>

          {/* Mot de passe */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              onClick={() => { setPwSection(v => !v); setPw(''); }}
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
                  <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">Mot de passe modifié avec succès.</p>
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

        </div>
      </div>
    </div>
  )
}
