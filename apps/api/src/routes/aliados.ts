import { Router } from 'express'
import { aliadosController } from '../controllers/aliadosController'
import { authenticateToken, requireAlly } from '../middleware/auth'

const router = Router()

// POST /api/aliados/register - Registrar nuevo aliado
router.post('/register', aliadosController.registerAliado.bind(aliadosController))

// GET /api/aliados/profile/:id - Obtener perfil del aliado
router.get('/profile/:id', authenticateToken, requireAlly, aliadosController.getAliadoProfile.bind(aliadosController))

// GET /api/aliados/search - Buscar aliados por especialización
router.get('/search', authenticateToken, aliadosController.searchAliados.bind(aliadosController))

// POST /api/aliados/assign-project - Asignar proyecto a aliado
router.post('/assign-project', authenticateToken, aliadosController.assignProject.bind(aliadosController))

// POST /api/aliados/complete-project - Completar proyecto
router.post('/complete-project', authenticateToken, requireAlly, aliadosController.completeProject.bind(aliadosController))

// GET /api/aliados/:id/projects - Obtener proyectos asignados
router.get('/:id/projects', authenticateToken, requireAlly, aliadosController.getAssignedProjects.bind(aliadosController))

// GET /api/aliados/:id/commissions - Obtener comisiones del aliado
router.get('/:id/commissions', authenticateToken, requireAlly, aliadosController.getCommissions.bind(aliadosController))

// PUT /api/aliados/:id/certifications - Actualizar certificaciones
router.put('/:id/certifications', authenticateToken, requireAlly, aliadosController.updateCertifications.bind(aliadosController))

// PUT /api/aliados/:id/academy-level - Actualizar nivel de academia
router.put('/:id/academy-level', authenticateToken, requireAlly, aliadosController.updateAcademyLevel.bind(aliadosController))

// GET /api/aliados/available - Buscar aliados disponibles
router.get('/available', authenticateToken, aliadosController.findAvailableAliados.bind(aliadosController))

// PUT /api/aliados/:id/availability - Actualizar disponibilidad
router.put('/:id/availability', authenticateToken, requireAlly, aliadosController.updateAvailability.bind(aliadosController))

// GET /api/aliados/stats - Estadísticas generales de aliados
router.get('/stats', aliadosController.getAliadosStats.bind(aliadosController))

// POST /api/aliados/auto-assign - Asignación automática de proyectos
router.post('/auto-assign', authenticateToken, aliadosController.autoAssignProject.bind(aliadosController))

// GET /api/aliados/assignment-stats - Estadísticas de asignación
router.get('/assignment-stats', authenticateToken, aliadosController.getAssignmentStats.bind(aliadosController))

export default router