import { Router } from 'express'
import { calculatorController } from '../controllers/calculatorController'

const router = Router()

// GET /api/calculator/appliances - Obtener electrodomésticos comunes
router.get('/appliances', calculatorController.getCommonAppliances.bind(calculatorController))

// POST /api/calculator/calculate - Calcular consumo y generar recomendación
router.post('/calculate', calculatorController.calculateConsumption.bind(calculatorController))

// POST /api/calculator/save - Guardar cálculo
router.post('/save', calculatorController.saveCalculation.bind(calculatorController))

// GET /api/calculator/history/:userId - Obtener historial de cálculos
router.get('/history/:userId', calculatorController.getCalculationHistory.bind(calculatorController))

// POST /api/calculator/quick-calc - Cálculo rápido basado en perfil
router.post('/quick-calc', calculatorController.quickCalculation.bind(calculatorController))

export default router