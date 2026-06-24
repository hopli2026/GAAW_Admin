import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Truck, Users, Settings, LogOut } from 'lucide-react'
import gaawLogo from '../assets/gaaw-logo.png'

const links = [
  { to: '/', label: 'Tableau de bord', Icon: LayoutDashboard },
  { to: '/orders', label: 'Courses', Icon: Package },
  { to: '/drivers', label: 'Livreurs', Icon: Truck },
  { to: '/clients', label: 'Clients', Icon: Users },
  { to: '/settings', label: 'Paramètres', Icon: Settings },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-2.5 border-b border-gray-50">
        <img src={gaawLogo} alt="GAAW" className="w-10 h-10 rounded-xl object-cover shrink-0" />
        <span className="font-bold text-[#0D1B2A] text-sm">
          GAAW <span className="font-normal text-gray-500">Admin</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-[#F4FFB8] text-[#0D1B2A] font-semibold'
                  : 'text-gray-400 hover:text-[#0D1B2A] hover:bg-gray-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-[#0D1B2A]' : 'text-gray-400'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-5 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-[#0D1B2A] w-full rounded-xl hover:bg-gray-50 transition"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
