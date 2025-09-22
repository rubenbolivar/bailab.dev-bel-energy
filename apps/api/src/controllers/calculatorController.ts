import { Request, Response } from 'express'
import { calculatorService, ApplianceData, CalculationResult } from '../services/calculatorService'

export class CalculatorController {
  // GET /api/calculator/appliances
  async getCommonAppliances(req: Request, res: Response) {
    try {
      const appliances = calculatorService.getCommonAppliances()
      res.json({
        success: true,
        data: appliances
      })
    } catch (error) {
      console.error('Error getting common appliances:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/calculator/calculate
  async calculateConsumption(req: Request, res: Response) {
    try {
      const { appliances }: { appliances: ApplianceData[] } = req.body

      if (!appliances || !Array.isArray(appliances)) {
        return res.status(400).json({
          success: false,
          error: 'Lista de electrodomésticos requerida'
        })
      }

      // Validar estructura de appliances
      for (const appliance of appliances) {
        if (!appliance.name || !appliance.powerWatts || !appliance.hoursPerDay) {
          return res.status(400).json({
            success: false,
            error: 'Cada electrodoméstico debe tener nombre, potencia y horas de uso'
          })
        }
      }

      const profile = await calculatorService.calculateConsumption(appliances)
      const result = await calculatorService.generateRecommendation(profile)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Error calculating consumption:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/calculator/save
  async saveCalculation(req: Request, res: Response) {
    try {
      const { calculation, userId }: { calculation: CalculationResult; userId?: string } = req.body

      if (!calculation) {
        return res.status(400).json({
          success: false,
          error: 'Datos de cálculo requeridos'
        })
      }

      // Aquí podríamos guardar el cálculo en la base de datos
      // Por ahora solo retornamos confirmación
      const savedCalculation = {
        id: `calc_${Date.now()}`,
        userId: userId || null,
        calculation,
        createdAt: new Date().toISOString()
      }

      res.json({
        success: true,
        data: savedCalculation,
        message: 'Cálculo guardado exitosamente'
      })
    } catch (error) {
      console.error('Error saving calculation:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/calculator/history/:userId
  async getCalculationHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'ID de usuario requerido'
        })
      }

      // Aquí podríamos obtener el historial de cálculos del usuario
      // Por ahora retornamos un array vacío
      const history: any[] = []

      res.json({
        success: true,
        data: history
      })
    } catch (error) {
      console.error('Error getting calculation history:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/calculator/quick-calc
  async quickCalculation(req: Request, res: Response) {
    try {
      const { householdSize, houseType, location }: {
        householdSize: number;
        houseType: 'small' | 'medium' | 'large';
        location: string;
      } = req.body

      if (!householdSize || !houseType) {
        return res.status(400).json({
          success: false,
          error: 'Tamaño del hogar y tipo de casa requeridos'
        })
      }

      // Cálculo rápido basado en perfiles predefinidos
      const quickAppliances = this.getQuickAppliances(householdSize, houseType)
      const profile = await calculatorService.calculateConsumption(quickAppliances)
      const result = await calculatorService.generateRecommendation(profile)

      res.json({
        success: true,
        data: {
          ...result,
          profile: {
            householdSize,
            houseType,
            location,
            appliances: quickAppliances
          }
        }
      })
    } catch (error) {
      console.error('Error in quick calculation:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  private getQuickAppliances(householdSize: number, houseType: 'small' | 'medium' | 'large'): ApplianceData[] {
    const baseAppliances: ApplianceData[] = [
      { name: 'Nevera', powerWatts: 150, hoursPerDay: 24, quantity: 1, dutyCycle: 0.6 },
      { name: 'Router WiFi', powerWatts: 10, hoursPerDay: 24, quantity: 1 },
    ]

    const householdAppliances: ApplianceData[] = []

    // Añadir electrodomésticos basados en tamaño del hogar
    if (householdSize >= 1) {
      householdAppliances.push(
        { name: 'Televisor LED', powerWatts: 50, hoursPerDay: 6, quantity: 1 },
        { name: 'Computadora', powerWatts: 300, hoursPerDay: 8, quantity: 1 }
      )
    }

    if (householdSize >= 2) {
      householdAppliances.push(
        { name: 'Lavadora', powerWatts: 500, hoursPerDay: 1, quantity: 1 },
        { name: 'Microondas', powerWatts: 1000, hoursPerDay: 0.5, quantity: 1 }
      )
    }

    if (householdSize >= 3) {
      householdAppliances.push(
        { name: 'Aire acondicionado', powerWatts: 1200, hoursPerDay: 8, quantity: 1, dutyCycle: 0.7 }
      )
    }

    // Añadir electrodomésticos basados en tipo de casa
    if (houseType === 'medium') {
      householdAppliances.push(
        { name: 'Bombillos LED', powerWatts: 9, hoursPerDay: 8, quantity: 15 }
      )
    } else if (houseType === 'large') {
      householdAppliances.push(
        { name: 'Bombillos LED', powerWatts: 9, hoursPerDay: 8, quantity: 25 },
        { name: 'Ventiladores', powerWatts: 60, hoursPerDay: 12, quantity: 3 }
      )
    }

    return [...baseAppliances, ...householdAppliances]
  }
}

export const calculatorController = new CalculatorController()