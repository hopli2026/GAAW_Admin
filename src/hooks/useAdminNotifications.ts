import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { adminApi } from '../api/admin'

export interface AdminNotification {
  id: string
  type: string
  driverId?: number
  driverName?: string
  message: string
  timestamp: number
  read: boolean
}

const WS_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api')
  .replace(/^http/, 'ws')
  .replace('/api', '/ws')

function fromApi(n: any): AdminNotification {
  return {
    id: String(n.id),
    type: n.type,
    driverId: n.driverId,
    driverName: n.driverName,
    message: n.message,
    timestamp: n.createdAt ? new Date(n.createdAt).getTime() : Date.now(),
    read: n.read ?? n.isRead ?? false,
  }
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    adminApi.getAdminNotifications()
      .then(r => setNotifications(r.data.map(fromApi)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/admin/notifications', (frame) => {
          const payload = JSON.parse(frame.body)
          setNotifications(prev => [{
            id: String(payload.id ?? `${Date.now()}`),
            type: payload.type,
            driverId: payload.driverId,
            driverName: payload.driverName,
            message: payload.message,
            timestamp: payload.createdAt ? new Date(payload.createdAt).getTime() : Date.now(),
            read: false,
          }, ...prev])
        })
      },
    })

    client.activate()
    clientRef.current = client
    return () => { client.deactivate() }
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    adminApi.markAllAdminNotificationsRead().catch(() => {})
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, unreadCount, markAllRead }
}
