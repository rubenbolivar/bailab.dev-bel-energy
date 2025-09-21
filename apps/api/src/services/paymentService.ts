import { prisma } from '@bel-energy/database'
import { TransactionStatus, PaymentStatus } from '@bel-energy/database'

export interface PaymentData {
  amount: number
  currency: string
  userId: string
  projectId?: string
  paymentMethod: string
  description: string
  metadata?: any
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  gatewayTransactionId?: string
  status: TransactionStatus
  message: string
  redirectUrl?: string
}

export interface PaymentGateway {
  name: string
  processPayment(data: PaymentData): Promise<PaymentResult>
  refundPayment(transactionId: string, amount: number): Promise<PaymentResult>
  getPaymentStatus(transactionId: string): Promise<TransactionStatus>
}

export class StripeGateway implements PaymentGateway {
  name = 'Stripe'

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    // Simulación de procesamiento con Stripe
    const transactionId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simular éxito/fracaso (90% éxito)
    const success = Math.random() > 0.1

    if (success) {
      // Crear transacción en base de datos
      const transaction = await prisma.transaccion.create({
        data: {
          userId: data.userId,
          proyectoId: data.projectId,
          gatewayTransactionId: transactionId,
          paymentGateway: 'Stripe',
          amount: data.amount,
          currency: data.currency,
          status: 'COMPLETED',
          paymentMethod: data.paymentMethod,
          metadata: {
            ...data.metadata,
            gateway: 'stripe',
            processedAt: new Date().toISOString()
          }
        }
      })

      return {
        success: true,
        transactionId: transaction.id,
        gatewayTransactionId: transactionId,
        status: 'COMPLETED',
        message: 'Pago procesado exitosamente'
      }
    } else {
      return {
        success: false,
        status: 'FAILED',
        message: 'Pago rechazado por el banco'
      }
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<PaymentResult> {
    // Simular reembolso
    await new Promise(resolve => setTimeout(resolve, 500))

    const transaction = await prisma.transaccion.findUnique({
      where: { id: transactionId }
    })

    if (!transaction) {
      return {
        success: false,
        status: 'FAILED',
        message: 'Transacción no encontrada'
      }
    }

    // Crear transacción de reembolso
    const refundTransaction = await prisma.transaccion.create({
      data: {
        userId: transaction.userId,
        proyectoId: transaction.proyectoId,
        gatewayTransactionId: `refund_${transactionId}`,
        paymentGateway: 'Stripe',
        amount: -Math.abs(amount),
        currency: transaction.currency,
        status: 'COMPLETED',
        paymentMethod: 'refund',
        metadata: {
          originalTransactionId: transactionId,
          refundAmount: amount,
          gateway: 'stripe',
          processedAt: new Date().toISOString()
        }
      }
    })

    return {
      success: true,
      transactionId: refundTransaction.id,
      gatewayTransactionId: `refund_${transactionId}`,
      status: 'COMPLETED',
      message: 'Reembolso procesado exitosamente'
    }
  }

  async getPaymentStatus(transactionId: string): Promise<TransactionStatus> {
    const transaction = await prisma.transaccion.findFirst({
      where: { gatewayTransactionId: transactionId }
    })

    return transaction?.status || 'PENDING'
  }
}

export class BanescoGateway implements PaymentGateway {
  name = 'Banesco'

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    // Simulación de procesamiento con Banesco
    const transactionId = `banesco_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await new Promise(resolve => setTimeout(resolve, 1500))

    const success = Math.random() > 0.05 // 95% éxito

    if (success) {
      const transaction = await prisma.transaccion.create({
        data: {
          userId: data.userId,
          proyectoId: data.projectId,
          gatewayTransactionId: transactionId,
          paymentGateway: 'Banesco',
          amount: data.amount,
          currency: data.currency,
          status: 'COMPLETED',
          paymentMethod: data.paymentMethod,
          metadata: {
            ...data.metadata,
            gateway: 'banesco',
            processedAt: new Date().toISOString()
          }
        }
      })

      return {
        success: true,
        transactionId: transaction.id,
        gatewayTransactionId: transactionId,
        status: 'COMPLETED',
        message: 'Pago procesado exitosamente con Banesco'
      }
    } else {
      return {
        success: false,
        status: 'FAILED',
        message: 'Pago rechazado por Banesco'
      }
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 800))

    const transaction = await prisma.transaccion.findUnique({
      where: { id: transactionId }
    })

    if (!transaction) {
      return {
        success: false,
        status: 'FAILED',
        message: 'Transacción no encontrada'
      }
    }

    const refundTransaction = await prisma.transaccion.create({
      data: {
        userId: transaction.userId,
        proyectoId: transaction.proyectoId,
        gatewayTransactionId: `banesco_refund_${transactionId}`,
        paymentGateway: 'Banesco',
        amount: -Math.abs(amount),
        currency: transaction.currency,
        status: 'COMPLETED',
        paymentMethod: 'refund',
        metadata: {
          originalTransactionId: transactionId,
          refundAmount: amount,
          gateway: 'banesco',
          processedAt: new Date().toISOString()
        }
      }
    })

    return {
      success: true,
      transactionId: refundTransaction.id,
      gatewayTransactionId: `banesco_refund_${transactionId}`,
      status: 'COMPLETED',
      message: 'Reembolso procesado exitosamente con Banesco'
    }
  }

  async getPaymentStatus(transactionId: string): Promise<TransactionStatus> {
    const transaction = await prisma.transaccion.findFirst({
      where: { gatewayTransactionId: transactionId }
    })

    return transaction?.status || 'PENDING'
  }
}

export class BinancePayGateway implements PaymentGateway {
  name = 'Binance Pay'

  async processPayment(data: PaymentData): Promise<PaymentResult> {
    // Simulación de procesamiento con Binance Pay (criptomonedas)
    const transactionId = `binance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    await new Promise(resolve => setTimeout(resolve, 2000))

    const success = Math.random() > 0.03 // 97% éxito

    if (success) {
      const transaction = await prisma.transaccion.create({
        data: {
          userId: data.userId,
          proyectoId: data.projectId,
          gatewayTransactionId: transactionId,
          paymentGateway: 'Binance Pay',
          amount: data.amount,
          currency: data.currency,
          status: 'COMPLETED',
          paymentMethod: data.paymentMethod,
          metadata: {
            ...data.metadata,
            gateway: 'binance_pay',
            cryptoCurrency: 'USDT',
            network: 'BSC',
            processedAt: new Date().toISOString()
          }
        }
      })

      return {
        success: true,
        transactionId: transaction.id,
        gatewayTransactionId: transactionId,
        status: 'COMPLETED',
        message: 'Pago con criptomonedas procesado exitosamente'
      }
    } else {
      return {
        success: false,
        status: 'FAILED',
        message: 'Pago con criptomonedas fallido'
      }
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<PaymentResult> {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const transaction = await prisma.transaccion.findUnique({
      where: { id: transactionId }
    })

    if (!transaction) {
      return {
        success: false,
        status: 'FAILED',
        message: 'Transacción no encontrada'
      }
    }

    const refundTransaction = await prisma.transaccion.create({
      data: {
        userId: transaction.userId,
        proyectoId: transaction.proyectoId,
        gatewayTransactionId: `binance_refund_${transactionId}`,
        paymentGateway: 'Binance Pay',
        amount: -Math.abs(amount),
        currency: transaction.currency,
        status: 'COMPLETED',
        paymentMethod: 'refund',
        metadata: {
          originalTransactionId: transactionId,
          refundAmount: amount,
          gateway: 'binance_pay',
          cryptoCurrency: 'USDT',
          processedAt: new Date().toISOString()
        }
      }
    })

    return {
      success: true,
      transactionId: refundTransaction.id,
      gatewayTransactionId: `binance_refund_${transactionId}`,
      status: 'COMPLETED',
      message: 'Reembolso de criptomonedas procesado exitosamente'
    }
  }

  async getPaymentStatus(transactionId: string): Promise<TransactionStatus> {
    const transaction = await prisma.transaccion.findFirst({
      where: { gatewayTransactionId: transactionId }
    })

    return transaction?.status || 'PENDING'
  }
}

export class PaymentService {
  private gateways: Map<string, PaymentGateway> = new Map()

  constructor() {
    this.gateways.set('stripe', new StripeGateway())
    this.gateways.set('banesco', new BanescoGateway())
    this.gateways.set('binance_pay', new BinancePayGateway())
  }

  async processPayment(gatewayName: string, data: PaymentData): Promise<PaymentResult> {
    const gateway = this.gateways.get(gatewayName.toLowerCase())

    if (!gateway) {
      return {
        success: false,
        status: 'FAILED',
        message: `Gateway ${gatewayName} no soportado`
      }
    }

    try {
      const result = await gateway.processPayment(data)

      // Actualizar estado del proyecto si existe
      if (result.success && data.projectId) {
        await this.updateProjectPaymentStatus(data.projectId, result.success)
      }

      return result
    } catch (error) {
      console.error(`Error processing payment with ${gatewayName}:`, error)
      return {
        success: false,
        status: 'FAILED',
        message: 'Error interno del servidor'
      }
    }
  }

  async refundPayment(gatewayName: string, transactionId: string, amount: number): Promise<PaymentResult> {
    const gateway = this.gateways.get(gatewayName.toLowerCase())

    if (!gateway) {
      return {
        success: false,
        status: 'FAILED',
        message: `Gateway ${gatewayName} no soportado`
      }
    }

    try {
      return await gateway.refundPayment(transactionId, amount)
    } catch (error) {
      console.error(`Error refunding payment with ${gatewayName}:`, error)
      return {
        success: false,
        status: 'FAILED',
        message: 'Error interno del servidor'
      }
    }
  }

  async getPaymentStatus(gatewayName: string, transactionId: string): Promise<TransactionStatus> {
    const gateway = this.gateways.get(gatewayName.toLowerCase())

    if (!gateway) {
      throw new Error(`Gateway ${gatewayName} no soportado`)
    }

    return await gateway.getPaymentStatus(transactionId)
  }

  async getTransactionHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit

    const transactions = await prisma.transaccion.findMany({
      where: { userId },
      include: {
        proyecto: {
          include: {
            cliente: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.transaccion.count({ where: { userId } })

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async getPaymentStats() {
    const totalTransactions = await prisma.transaccion.count()
    const completedTransactions = await prisma.transaccion.count({
      where: { status: 'COMPLETED' }
    })

    const totalAmount = await prisma.transaccion.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    })

    const monthlyAmount = await prisma.transaccion.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    })

    return {
      totalTransactions,
      completedTransactions,
      successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0,
      totalAmount: totalAmount._sum.amount || 0,
      monthlyAmount: monthlyAmount._sum.amount || 0
    }
  }

  private async updateProjectPaymentStatus(projectId: string, paymentSuccess: boolean) {
    const project = await prisma.proyecto.findUnique({
      where: { id: projectId },
      include: { transacciones: true }
    })

    if (!project) return

    // Calcular total pagado
    const totalPaid = project.transacciones
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0)

    // Actualizar estado del proyecto basado en pagos
    let newStatus: PaymentStatus = 'PENDIENTE'

    if (totalPaid >= project.totalAmount) {
      newStatus = 'COMPLETADO'
    } else if (totalPaid > 0) {
      newStatus = 'PARCIAL'
    }

    await prisma.proyecto.update({
      where: { id: projectId },
      data: { paymentStatus: newStatus }
    })
  }

  getAvailableGateways(): string[] {
    return Array.from(this.gateways.keys())
  }

  getGatewayInfo(gatewayName: string) {
    const gateway = this.gateways.get(gatewayName.toLowerCase())
    return gateway ? {
      name: gateway.name,
      supported: true
    } : null
  }
}

export const paymentService = new PaymentService()