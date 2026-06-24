import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import Sidebar from './Sidebar'

const pageTitles: Record<string, string> = {
  '/': 'Tableau de bord',
  '/orders': 'Courses',
  '/drivers': 'Livreurs',
  '/clients': 'Clients',
  '/settings': 'Paramètres',
}

export default function Layout() {
  const token = localStorage.getItem('token')
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Admin'

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
            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-sm font-semibold text-[#0D1B2A] leading-tight">Admin</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#0D1B2A] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
