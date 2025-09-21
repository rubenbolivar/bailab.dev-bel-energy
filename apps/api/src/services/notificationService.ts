import { io } from '../server'
import { prisma } from '@bel-energy/database'

export interface NotificationData {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'project' | 'payment' | 'system' | 'academy' | 'ally'
  metadata?: any
  createdAt: Date
}

export class NotificationService {
  // Send real-time notification to specific user
  async sendToUser(userId: string, notification: Omit<NotificationData, 'id' | 'createdAt'>) {
    const notificationData: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }

    // Send via Socket.io to user room
    io.to(`user_${userId}`).emit('notification', notificationData)

    // Store in database
    await this.storeNotification(notificationData)

    console.log(`📤 Notification sent to user ${userId}: ${notification.title}`)
    return notificationData
  }

  // Send notification to ally
  async sendToAlly(allyId: string, notification: Omit<NotificationData, 'id' | 'createdAt' | 'userId'>) {
    // Get userId from allyId
    const ally = await prisma.aliado.findUnique({
      where: { id: allyId },
      select: { userId: true }
    })

    if (!ally) {
      throw new Error('Ally not found')
    }

    return this.sendToUser(ally.userId, {
      ...notification,
      userId: ally.userId
    })
  }

  // Send notification to all admins
  async sendToAdmins(notification: Omit<NotificationData, 'id' | 'createdAt' | 'userId'>) {
    const notificationData: NotificationData = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'admin_broadcast',
      createdAt: new Date()
    }

    // Send to admin room
    io.to('admin_room').emit('notification', notificationData)

    console.log(`📤 Admin notification sent: ${notification.title}`)
    return notificationData
  }

  // Project assignment notifications
  async notifyProjectAssigned(projectId: string, allyId: string) {
    try {
      // Get project and ally details
      const project = await prisma.proyecto.findUnique({
        where: { id: projectId },
        include: {
          cliente: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        }
      })

      if (!project) return

      const clientName = `${project.cliente.user.firstName} ${project.cliente.user.lastName}`

      await this.sendToAlly(allyId, {
        title: '🎯 Proyecto Asignado',
        message: `Se te ha asignado el proyecto de ${clientName} por $${project.totalAmount.toLocaleString()}`,
        type: 'success',
        category: 'project',
        metadata: {
          projectId,
          clientName,
          amount: project.totalAmount,
          action: 'view_project'
        }
      })
    } catch (error) {
      console.error('Error sending project assignment notification:', error)
    }
  }

  // Commission payment notifications
  async notifyCommissionPaid(allyId: string, amount: number, projectId?: string) {
    await this.sendToAlly(allyId, {
      title: '💰 Comisión Pagada',
      message: `Se ha pagado una comisión de $${amount.toLocaleString()} a tu cuenta`,
      type: 'success',
      category: 'payment',
      metadata: {
        amount,
        projectId,
        action: 'view_commissions'
      }
    })
  }

  // System notifications
  async notifySystemUpdate(userId: string, title: string, message: string) {
    await this.sendToUser(userId, {
      userId,
      title: `🔧 ${title}`,
      message,
      type: 'info',
      category: 'system'
    })
  }

  // Academy notifications
  async notifyAcademyProgress(userId: string, courseName: string, progress: number) {
    await this.sendToUser(userId, {
      userId,
      title: '📚 Progreso en Academia',
      message: `Has completado ${progress}% del curso "${courseName}"`,
      type: 'info',
      category: 'academy',
      metadata: {
        courseName,
        progress,
        action: 'continue_course'
      }
    })
  }

  // Auto-assignment notifications for admins
  async notifyAutoAssignment(projectId: string, allyName: string, score: number) {
    await this.sendToAdmins({
      title: '🤖 Asignación Automática Exitosa',
      message: `Proyecto ${projectId.slice(-6)} asignado automáticamente a ${allyName} (Score: ${score.toFixed(1)})`,
      type: 'success',
      category: 'system',
      metadata: {
        projectId,
        allyName,
        score,
        action: 'view_project'
      }
    })
  }

  // Failed auto-assignment notifications
  async notifyAutoAssignmentFailed(projectId: string) {
    await this.sendToAdmins({
      title: '⚠️ Asignación Automática Fallida',
      message: `No se pudo asignar automáticamente el proyecto ${projectId.slice(-6)}. Requiere asignación manual.`,
      type: 'warning',
      category: 'system',
      metadata: {
        projectId,
        action: 'manual_assign'
      }
    })
  }

  // Store notification in database for persistence
  private async storeNotification(notification: NotificationData) {
    try {
      await prisma.notificacion.create({
        data: {
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type.toUpperCase() as any,
          category: notification.category.toUpperCase() as any,
          metadata: notification.metadata || {},
          createdAt: notification.createdAt
        }
      })
    } catch (error) {
      console.error('Error storing notification:', error)
    }
  }

  // Get user notifications from database
  async getUserNotifications(userId: string, limit: number = 50) {
    return await prisma.notificacion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    return await prisma.notificacion.update({
      where: { id: notificationId },
      data: { read: true }
    })
  }
}

export const notificationService = new NotificationService()