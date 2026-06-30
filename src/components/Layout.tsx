import { useState, useRef, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Search, Bell, Settings, LogOut } from 'lucide-react'
import Sidebar from './Sidebar'
import AdminProfileModal from './AdminProfileModal'
import { useAuth } from '../context/AuthContext'

const pageTitles: Record<string, string> = {
  '/': 'Tableau de bord',
  '/orders': 'Courses',
  '/drivers': 'Livreurs',
  '/clients': 'Clients',
  '/settings': 'Paramètres',
}

export default function Layout() {
  const token = localStorage.getItem('token')
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Admin'

  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  if (!token) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
          <h1 className="text-base font-semibold text-[#0D1B2A] shrink-0 w-36">{title}</h1>

          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5 max-w-sm mx-auto">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent outline-none text-sm text-gray-500 w-full"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="relative">
              <Bell size={20} className="text-gray-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </div>

            {/* Avatar + dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#0D1B2A] leading-tight">{user ? `${user.firstName} ${user.lastName}` : 'Admin'}</p>
                  <p className="text-xs text-gray-400">{user?.role ?? 'Super Admin'}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#0D1B2A] flex items-center justify-center shrink-0 hover:opacity-80 transition">
                  <span className="text-[#CCFF00] text-sm font-bold">{user?.firstName?.[0] ?? 'A'}</span>
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-semibold text-[#0D1B2A] truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); setProfileOpen(true) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0D1B2A] hover:bg-gray-50 transition cursor-pointer"
                  >
                    <Settings size={15} className="text-gray-400" />
                    Paramètres du compte
                  </button>
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button
                      onClick={() => { setMenuOpen(false); logout() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut size={15} />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {profileOpen && <AdminProfileModal onClose={() => setProfileOpen(false)} />}
    </div>
  )
}
