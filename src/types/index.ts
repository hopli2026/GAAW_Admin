export interface UserSummary {
  id: number
  firstName: string
  lastName: string
  phone: string
  vehicleType?: string | null
}

export interface AdminOrder {
  id: number
  status: string
  pickupAddress: string
  deliveryAddress: string
  distanceKm: number
  price: number
  amountToCollect: number
  packageSize: string
  paymentMethod: string
  createdAt: string
  updatedAt: string
  client: UserSummary
  driver: UserSummary | null
  pickupPhotoUrl?: string | null
}

export interface DriverDocument {
  type: string
  fileUrl: string
  uploadedAt: string
}

export interface AdminDriver {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  vehicleType: string | null
  driverStatus: string
  walletBalance: number
  blocked: boolean
}

export interface AdminClient {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  blocked: boolean
}

export interface DashboardStats {
  ordersToday: number
  activeDrivers: number
  totalDrivers: number
  pendingDrivers: number
  totalClients: number
  revenueToday: number
}

export interface PricingConfig {
  id: number
  basePrice: number
  pricePerKm: number
}

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
}
