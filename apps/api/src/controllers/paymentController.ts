import { Request, Response } from 'express'
import { paymentService } from '../services/paymentService'

export class PaymentController {
  // POST /api/payments/process - Procesar pago
  async processPayment(req: Request, res: Response) {
    try {
      const {
        gateway,
        amount,
        currency,
        userId,
        projectId,
        paymentMethod,
        description,
        metadata
      } = req.body

      if (!gateway || !amount || !currency || !userId || !paymentMethod) {
        return res.status(400).json({
          success: false,
          error: 'Datos de pago incompletos'
        })
      }

      const result = await paymentService.processPayment(gateway, {
        amount: parseFloat(amount),
        currency,
        userId,
        projectId,
        paymentMethod,
        description: description || 'Pago de proyecto',
        metadata
      })

      if (result.success) {
        res.json({
          success: true,
          data: result,
          message: 'Pago procesado exitosamente'
        })
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        })
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/payments/refund - Procesar reembolso
  async refundPayment(req: Request, res: Response) {
    try {
      const { gateway, transactionId, amount } = req.body

      if (!gateway || !transactionId || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Datos de reembolso incompletos'
        })
      }

      const result = await paymentService.refundPayment(gateway, transactionId, parseFloat(amount))

      if (result.success) {
        res.json({
          success: true,
          data: result,
          message: 'Reembolso procesado exitosamente'
        })
      } else {
        res.status(400).json({
          success: false,
          error: result.message
        })
      }
    } catch (error) {
      console.error('Error processing refund:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/payments/status/:gateway/:transactionId - Obtener estado de pago
  async getPaymentStatus(req: Request, res: Response) {
    try {
      const { gateway, transactionId } = req.params

      const status = await paymentService.getPaymentStatus(gateway, transactionId)

      res.json({
        success: true,
        data: { status }
      })
    } catch (error) {
      console.error('Error getting payment status:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/payments/history/:userId - Historial de transacciones
  async getTransactionHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20

      const result = await paymentService.getTransactionHistory(userId, page, limit)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Error getting transaction history:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/payments/stats - Estadísticas de pagos
  async getPaymentStats(req: Request, res: Response) {
    try {
      const stats = await paymentService.getPaymentStats()

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error getting payment stats:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/payments/gateways - Gateways disponibles
  async getAvailableGateways(req: Request, res: Response) {
    try {
      const gateways = paymentService.getAvailableGateways()
      const gatewayInfo = gateways.map(gateway => ({
        name: gateway,
        info: paymentService.getGatewayInfo(gateway)
      }))

      res.json({
        success: true,
        data: gatewayInfo
      })
    } catch (error) {
      console.error('Error getting available gateways:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/payments/webhook/:gateway - Webhook para confirmaciones
  async handleWebhook(req: Request, res: Response) {
    try {
      const { gateway } = req.params
      const webhookData = req.body

      console.log(`Webhook received from ${gateway}:`, webhookData)

      // Aquí procesaríamos el webhook según el gateway
      // Por ahora, solo confirmamos recepción

      res.json({
        success: true,
        message: `Webhook de ${gateway} procesado correctamente`
      })
    } catch (error) {
      console.error('Error handling webhook:', error)
      res.status(500).json({
        success: false,
        error: 'Error procesando webhook'
      })
    }
  }

  // POST /api/payments/simulate - Simular pago (solo para desarrollo)
  async simulatePayment(req: Request, res: Response) {
    try {
      const {
        gateway,
        amount,
        currency,
        userId,
        projectId,
        paymentMethod,
        description
      } = req.body

      if (!gateway || !amount || !currency || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Datos de simulación incompletos'
        })
      }

      // Simular procesamiento con delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simular resultado (90% éxito)
      const success = Math.random() > 0.1

      if (success) {
        const result = await paymentService.processPayment(gateway, {
          amount: parseFloat(amount),
          currency,
          userId,
          projectId,
          paymentMethod: paymentMethod || 'simulated',
          description: description || 'Pago simulado',
          metadata: { simulated: true }
        })

        res.json({
          success: true,
          data: result,
          message: 'Pago simulado procesado exitosamente'
        })
      } else {
        res.status(400).json({
          success: false,
          error: 'Pago simulado rechazado'
        })
      }
    } catch (error) {
      console.error('Error simulating payment:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/payments/exchange-rates - Tasas de cambio
  async getExchangeRates(req: Request, res: Response) {
    try {
      // Simular tasas de cambio (en producción usaríamos una API real)
      const rates = {
        USD: 1,
        VES: 35.5,
        EUR: 0.85,
        USDT: 1,
        timestamp: new Date().toISOString()
      }

      res.json({
        success: true,
        data: rates
      })
    } catch (error) {
      console.error('Error getting exchange rates:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/payments/convert - Convertir moneda
  async convertCurrency(req: Request, res: Response) {
    try {
      const { amount, fromCurrency, toCurrency } = req.body

      if (!amount || !fromCurrency || !toCurrency) {
        return res.status(400).json({
          success: false,
          error: 'Datos de conversión incompletos'
        })
      }

      // Tasas de cambio simuladas
      const rates = {
        USD: 1,
        VES: 35.5,
        EUR: 0.85,
        USDT: 1
      }

      const fromRate = rates[fromCurrency as keyof typeof rates]
      const toRate = rates[toCurrency as keyof typeof rates]

      if (!fromRate || !toRate) {
        return res.status(400).json({
          success: false,
          error: 'Moneda no soportada'
        })
      }

      const convertedAmount = (parseFloat(amount) / fromRate) * toRate

      res.json({
        success: true,
        data: {
          originalAmount: parseFloat(amount),
          convertedAmount,
          fromCurrency,
          toCurrency,
          exchangeRate: toRate / fromRate,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error converting currency:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }
}

export const paymentController = new PaymentController()