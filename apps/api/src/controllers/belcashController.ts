import { Request, Response } from 'express'
import { belcashService } from '../services/belcashService'

export class BelCashController {
  // GET /api/belcash/score/:userId - Obtener BelScore del usuario
  async getBelScore(req: Request, res: Response) {
    try {
      const { userId } = req.params

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario requerido'
        })
      }

      const belScore = await belcashService.calculateBelScore(userId)

      res.json({
        success: true,
        data: belScore
      })
    } catch (error) {
      console.error('Error getting BelScore:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/belcash/simulate - Simular financiamiento
  async simulateFinancing(req: Request, res: Response) {
    try {
      const { principal, userId } = req.body

      if (!principal || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Monto principal y ID de usuario requeridos'
        })
      }

      if (principal <= 0) {
        return res.status(400).json({
          success: false,
          error: 'El monto principal debe ser mayor a cero'
        })
      }

      const simulation = await belcashService.simulateFinancing(principal, userId)

      res.json({
        success: true,
        data: simulation
      })
    } catch (error) {
      console.error('Error simulating financing:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/belcash/options/:userId - Obtener opciones de financiamiento disponibles
  async getFinancingOptions(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { amount } = req.query

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario requerido'
        })
      }

      const principal = amount ? parseFloat(amount as string) : 1000 // Monto por defecto

      if (isNaN(principal) || principal <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Monto inválido'
        })
      }

      const simulation = await belcashService.simulateFinancing(principal, userId)

      res.json({
        success: true,
        data: {
          belScore: simulation.belScore,
          availableOptions: simulation.availableOptions,
          recommendedOption: simulation.recommendedOption
        }
      })
    } catch (error) {
      console.error('Error getting financing options:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/belcash/apply - Aplicar por financiamiento
  async applyForFinancing(req: Request, res: Response) {
    try {
      const { userId, principal, installments, financingType } = req.body

      if (!userId || !principal || !installments) {
        return res.status(400).json({
          success: false,
          error: 'Datos incompletos para la solicitud'
        })
      }

      // Calcular BelScore para validar elegibilidad
      const belScore = await belcashService.calculateBelScore(userId)

      // Simular financiamiento para obtener detalles
      const simulation = await belcashService.simulateFinancing(principal, userId)

      // Verificar si la opción solicitada está disponible
      const requestedOption = simulation.availableOptions.find(
        opt => opt.installments === installments
      )

      if (!requestedOption) {
        return res.status(400).json({
          success: false,
          error: 'Opción de financiamiento no disponible para este perfil'
        })
      }

      // Aquí podríamos crear una solicitud de financiamiento en la base de datos
      // Por ahora retornamos la información de la solicitud
      const application = {
        id: `fin_${Date.now()}`,
        userId,
        principal,
        installments,
        financingType: financingType || 'BELCASH',
        belScore: belScore.score,
        monthlyPayment: requestedOption.monthlyPayment,
        totalAmount: requestedOption.totalAmount,
        interestRate: requestedOption.interestRate,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        riskAssessment: simulation.riskAssessment
      }

      res.json({
        success: true,
        data: application,
        message: 'Solicitud de financiamiento creada exitosamente'
      })
    } catch (error) {
      console.error('Error applying for financing:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/belcash/matrix - Obtener matriz de financiamiento
  async getFinancingMatrix(req: Request, res: Response) {
    try {
      // Retornar la matriz de financiamiento pública
      const matrix = {
        'A': { minScore: 800, maxInstallments: 12, interestRate: 0.00, description: 'Excelente - Financiamiento preferencial' },
        'B': { minScore: 600, maxInstallments: 8, interestRate: 0.05, description: 'Muy bueno - Buenas condiciones' },
        'C': { minScore: 400, maxInstallments: 6, interestRate: 0.10, description: 'Bueno - Condiciones estándar' },
        'D': { minScore: 200, maxInstallments: 4, interestRate: 0.15, description: 'Regular - Condiciones limitadas' },
        'F': { minScore: 0, maxInstallments: 1, interestRate: 0.00, description: 'Bajo - Solo contado' }
      }

      res.json({
        success: true,
        data: matrix
      })
    } catch (error) {
      console.error('Error getting financing matrix:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/belcash/update-score (Admin only)
  async updateBelScore(req: Request, res: Response) {
    try {
      const { userId, score, reason } = req.body

      if (!userId || score === undefined || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Datos incompletos para actualizar BelScore'
        })
      }

      if (score < 0 || score > 1000) {
        return res.status(400).json({
          success: false,
          error: 'BelScore debe estar entre 0 y 1000'
        })
      }

      await belcashService.updateBelScore(userId, score, reason)

      res.json({
        success: true,
        message: 'BelScore actualizado exitosamente'
      })
    } catch (error) {
      console.error('Error updating BelScore:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }
}

export const belcashController = new BelCashController()