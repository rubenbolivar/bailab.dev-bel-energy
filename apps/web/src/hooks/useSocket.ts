import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface NotificationData {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'project' | 'payment' | 'system' | 'academy' | 'ally'
  metadata?: any
  createdAt: string
}

export const useSocket = (userId?: string, userType?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    // Create socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)

      // Join user-specific room
      newSocket.emit('join-user-room', userId)

      // Join role-specific rooms
      if (userType === 'ALIADO') {
        // For allies, we need to get the ally ID
        // This will be handled when we have the ally profile
      } else if (userType === 'ADMIN') {
        newSocket.emit('join-admin-room')
      }
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    // Notification events
    newSocket.on('notification', (notification: NotificationData) => {
      console.log('Received notification:', notification)

      // Add to notifications state
      setNotifications(prev => [notification, ...prev])

      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }

      // You could also show a toast notification here
      // For now, we'll just log it
    })

    // Cleanup on unmount
    return () => {
      newSocket.close()
      socketRef.current = null
    }
  }, [userId, userType])

  // Method to join ally room (called when we have ally profile)
  const joinAllyRoom = (allyId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-ally-room', allyId)
      console.log(`Joined ally room: ${allyId}`)
    }
  }

  // Method to request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Method to clear notifications
  const clearNotifications = () => {
    setNotifications([])
  }

  // Method to mark notification as read (you could call an API here)
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return {
    socket,
    isConnected,
    notifications,
    joinAllyRoom,
    requestNotificationPermission,
    clearNotifications,
    markAsRead
  }
}