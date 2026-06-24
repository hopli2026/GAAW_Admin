import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CoursesPage from './pages/CoursesPage'
import LivreursPage from './pages/LivreursPage'
import ClientsPage from './pages/ClientsPage'
import ParametresPage from './pages/ParametresPage'
import './index.css'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/orders" element={<CoursesPage />} />
              <Route path="/drivers" element={<LivreursPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/settings" element={<ParametresPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
