import { useState, useRef, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Search, Bell, Settings, LogOut, FileText } from 'lucide-react'
import Sidebar from './Sidebar'
import AdminProfileModal from './AdminProfileModal'
import { useAuth } from '../context/AuthContext'
import { useAdminNotifications } from '../hooks/useAdminNotifications'
import type { AdminNotification } from '../hooks/useAdminNotifications'

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
  const [bellOpen, setBellOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  const { notifications, unreadCount, markAllRead } = useAdminNotifications()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => { setBellOpen(v => !v); if (!bellOpen) markAllRead() }}
                className="relative p-1 cursor-pointer"
              >
                <Bell size={20} className="text-gray-400 hover:text-[#0D1B2A] transition" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-[#0D1B2A]">Notifications</p>
                    {notifications.length > 0 && (
                      <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-[#0D1B2A] cursor-pointer">
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">Aucune notification</p>
                    ) : (
                      notifications.map((n: AdminNotification) => (
                        <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${n.read ? '' : 'bg-blue-50/50'}`}>
                          <div className="w-8 h-8 rounded-full bg-[#0D1B2A] flex items-center justify-center shrink-0 mt-0.5">
                            <FileText size={14} className="text-[#CCFF00]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0D1B2A]">{n.message}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(n.timestamp).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                          {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
