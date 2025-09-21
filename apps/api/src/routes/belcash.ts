import { Router } from 'express'
import { belcashController } from '../controllers/belcashController'

const router = Router()

// GET /api/belcash/score/:userId - Obtener BelScore del usuario
router.get('/score/:userId', belcashController.getBelScore.bind(belcashController))

// POST /api/belcash/simulate - Simular financiamiento
router.post('/simulate', belcashController.simulateFinancing.bind(belcashController))

// GET /api/belcash/options/:userId - Obtener opciones de financiamiento
router.get('/options/:userId', belcashController.getFinancingOptions.bind(belcashController))

// POST /api/belcash/apply - Aplicar por financiamiento
router.post('/apply', belcashController.applyForFinancing.bind(belcashController))

// GET /api/belcash/matrix - Obtener matriz de financiamiento
router.get('/matrix', belcashController.getFinancingMatrix.bind(belcashController))

// POST /api/belcash/update-score - Actualizar BelScore (Admin)
router.post('/update-score', belcashController.updateBelScore.bind(belcashController))

export default router