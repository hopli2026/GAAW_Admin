import api from './axios'
import type { AdminOrder, AdminDriver, AdminClient, DashboardStats, PricingConfig, DriverDocument } from '../types'

export const adminApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; role: string; user: { id: number; email: string; firstName: string; lastName: string; role: string } }>(
      '/auth/login', { email, password }
    ),

  getProfile: () => api.get<{ id: number; firstName: string; lastName: string; email: string; role: string }>('/admin/profile'),
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string }) =>
    api.put<{ id: number; firstName: string; lastName: string; email: string; role: string }>('/admin/profile', data),
  updateProfilePassword: (password: string) =>
    api.patch('/admin/profile/password', { password }),

  getDashboard: () => api.get<DashboardStats>('/admin/dashboard'),

  getOrders: () => api.get<AdminOrder[]>('/admin/orders'),
  getOrder: (id: number) => api.get<AdminOrder>(`/admin/orders/${id}`),
  cancelOrder: (id: number) => api.patch(`/admin/orders/${id}/cancel`),
  getDriverOrders: (driverId: number) => api.get<AdminOrder[]>(`/admin/drivers/${driverId}/orders`),
  getDriverDocuments: (driverId: number) => api.get<DriverDocument[]>(`/admin/drivers/${driverId}/documents`),
  getClientOrders: (clientId: number) => api.get<AdminOrder[]>(`/admin/clients/${clientId}/orders`),

  getDrivers: () => api.get<AdminDriver[]>('/admin/drivers'),
  getDriver: (id: number) => api.get<AdminDriver>(`/admin/drivers/${id}`),
  updateDriver: (id: number, data: { firstName?: string; lastName?: string; email?: string; phone?: string }) =>
    api.put<AdminDriver>(`/admin/drivers/${id}`, data),
  resetDriverPassword: (id: number, password: string) =>
    api.patch(`/admin/drivers/${id}/password`, { password }),
  validateDriver: (id: number) => api.patch(`/admin/drivers/${id}/validate`),
  suspendDriver: (id: number) => api.patch(`/admin/drivers/${id}/suspend`),
  requestResubmission: (id: number) => api.patch(`/admin/drivers/${id}/request-resubmission`),
  deleteDriver: (id: number) => api.delete(`/admin/drivers/${id}`),

  getClients: () => api.get<AdminClient[]>('/admin/clients'),
  getClient: (id: number) => api.get<AdminClient>(`/admin/clients/${id}`),
  updateClient: (id: number, data: { firstName?: string; lastName?: string; email?: string; phone?: string }) =>
    api.put<AdminClient>(`/admin/clients/${id}`, data),
  resetClientPassword: (id: number, password: string) =>
    api.patch(`/admin/clients/${id}/password`, { password }),
  blockClient: (id: number) => api.patch(`/admin/clients/${id}/block`),
  unblockClient: (id: number) => api.patch(`/admin/clients/${id}/unblock`),
  deleteClient: (id: number) => api.delete(`/admin/clients/${id}`),

  getAdminNotifications: () => api.get<any[]>('/admin/notifications'),
  markAllAdminNotificationsRead: () => api.patch('/admin/notifications/read-all'),

  getSettings: () => api.get<PricingConfig>('/admin/settings'),
  updateSettings: (basePrice: number, pricePerKm: number) =>
    api.put<PricingConfig>('/admin/settings', { basePrice, pricePerKm }),
}
