import api from './axios'
import type { AdminOrder, AdminDriver, AdminClient, DashboardStats, PricingConfig } from '../types'

export const adminApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; role: string; user: { id: number; email: string; firstName: string; lastName: string; role: string } }>(
      '/auth/login', { email, password }
    ),

  getDashboard: () => api.get<DashboardStats>('/admin/dashboard'),

  getOrders: () => api.get<AdminOrder[]>('/admin/orders'),
  getOrder: (id: number) => api.get<AdminOrder>(`/admin/orders/${id}`),
  getDriverOrders: (driverId: number) => api.get<AdminOrder[]>(`/admin/drivers/${driverId}/orders`),
  getClientOrders: (clientId: number) => api.get<AdminOrder[]>(`/admin/clients/${clientId}/orders`),

  getDrivers: () => api.get<AdminDriver[]>('/admin/drivers'),
  getDriver: (id: number) => api.get<AdminDriver>(`/admin/drivers/${id}`),
  validateDriver: (id: number) => api.patch(`/admin/drivers/${id}/validate`),
  suspendDriver: (id: number) => api.patch(`/admin/drivers/${id}/suspend`),

  getClients: () => api.get<AdminClient[]>('/admin/clients'),
  getClient: (id: number) => api.get<AdminClient>(`/admin/clients/${id}`),
  blockClient: (id: number) => api.patch(`/admin/clients/${id}/block`),
  unblockClient: (id: number) => api.patch(`/admin/clients/${id}/unblock`),

  getSettings: () => api.get<PricingConfig>('/admin/settings'),
  updateSettings: (basePrice: number, pricePerKm: number) =>
    api.put<PricingConfig>('/admin/settings', { basePrice, pricePerKm }),
}
