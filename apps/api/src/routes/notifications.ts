import { Router } from 'express'
import { notificationService } from '../services/notificationService'
import { authenticateToken, requireAlly } from '../middleware/auth'

const router = Router()

// GET /api/notifications/:userId - Obtener notificaciones de usuario
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params
    const { limit } = req.query

    // Allow users to get their own notifications, admins can get any
    if (req.user?.userType !== 'ADMIN' && req.user?.id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para ver estas notificaciones'
      })
    }

    const notifications = await notificationService.getUserNotifications(
      userId,
      limit ? parseInt(limit as string) : 50
    )

    res.json({
      success: true,
      data: notifications
    })
  } catch (error) {
    console.error('Error getting notifications:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

// PUT /api/notifications/:id/read - Marcar notificación como leída
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    const notification = await notificationService.markAsRead(id)

    res.json({
      success: true,
      data: notification
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

// POST /api/notifications/send - Enviar notificación (solo admins)
router.post('/send', authenticateToken, async (req, res) => {
  try {
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Solo administradores pueden enviar notificaciones'
      })
    }

    const { userId, title, message, type, category, metadata } = req.body

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId, title y message son requeridos'
      })
    }

    const notification = await notificationService.sendToUser(userId, {
      userId,
      title,
      message,
      type: type || 'info',
      category: category || 'system',
      metadata
    })

    res.json({
      success: true,
      data: notification,
      message: 'Notificación enviada exitosamente'
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

// POST /api/notifications/broadcast - Enviar notificación a todos los aliados
router.post('/broadcast', authenticateToken, async (req, res) => {
  try {
    if (req.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Solo administradores pueden enviar notificaciones broadcast'
      })
    }

    const { title, message, type, category, metadata } = req.body

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'title y message son requeridos'
      })
    }

    // Get all allies
    const { prisma } = await import('@bel-energy/database')
    const allies = await prisma.aliado.findMany({
      include: { user: true }
    })

    // Send to each ally
    const notifications = []
    for (const ally of allies) {
      try {
        const notification = await notificationService.sendToUser(ally.userId, {
          userId: ally.userId,
          title,
          message,
          type: type || 'info',
          category: category || 'system',
          metadata
        })
        notifications.push(notification)
      } catch (error) {
        console.error(`Error sending notification to ally ${ally.id}:`, error)
      }
    }

    res.json({
      success: true,
      data: notifications,
      message: `Notificación enviada a ${notifications.length} aliados`
    })
  } catch (error) {
    console.error('Error broadcasting notification:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

// Test route for sending demo notifications (remove in production)
router.post('/test-send', async (req, res) => {
  try {
    const { userId, title, message, type } = req.body

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId, title y message son requeridos'
      })
    }

    const notification = await notificationService.sendToUser(userId, {
      userId,
      title,
      message,
      type: type || 'info',
      category: 'system'
    })

    res.json({
      success: true,
      data: notification,
      message: 'Notificación de prueba enviada'
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

export default router