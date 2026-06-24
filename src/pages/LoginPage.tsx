import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Mail } from 'lucide-react'
import gaawLogo from '../assets/gaaw-logo.png'
import { adminApi } from '../api/admin'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await adminApi.login(email, password)
      if (data.role !== 'ADMIN') {
        setError('Accès réservé aux administrateurs')
        return
      }
      setAuth(data.token, {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.role,
      })
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#0D1B2A] px-8 py-12 flex flex-col items-center gap-5">
          <img src={gaawLogo} alt="GAAW" className="w-24 h-24 rounded-2xl object-cover" />
          <h1 className="text-white text-2xl font-bold tracking-tight">Administration GAAW</h1>
        </div>

        <div className="bg-white px-8 py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[#0D1B2A] text-sm font-medium mb-2">Email</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3.5 gap-3 focus-within:ring-2 focus-within:ring-[#CCFF00] transition">
                <Mail size={18} className="text-gray-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gaaw.com"
                  required
                  className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#0D1B2A] text-sm font-medium mb-2">Mot de passe</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3.5 gap-3 focus-within:ring-2 focus-within:ring-[#CCFF00] transition">
                <Lock size={18} className="text-gray-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="shrink-0">
                  {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-[#CCFF00] text-[#0D1B2A] font-bold py-4 rounded-2xl hover:brightness-95 active:scale-[0.98] transition text-base disabled:opacity-60 mt-1"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-6">© 2026 GAAW Delivery Systems</p>
        </div>
      </div>
    </div>
  )
}
