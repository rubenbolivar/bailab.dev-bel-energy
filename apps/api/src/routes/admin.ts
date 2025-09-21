import { Router } from 'express'
import { adminController } from '../controllers/adminController'

const router = Router()

// Dashboard principal
router.get('/dashboard', adminController.getDashboardStats.bind(adminController))

// Datos para gráficos
router.get('/revenue', adminController.getRevenueData.bind(adminController))
router.get('/users-growth', adminController.getUserGrowthData.bind(adminController))
router.get('/projects-distribution', adminController.getProjectDistribution.bind(adminController))

// Rankings y actividad
router.get('/top-aliados', adminController.getTopAliados.bind(adminController))
router.get('/recent-activity', adminController.getRecentActivity.bind(adminController))

// Gestión de datos
router.get('/users', adminController.getUsers.bind(adminController))
router.get('/projects', adminController.getProjects.bind(adminController))
router.get('/products', adminController.getProducts.bind(adminController))

// Estadísticas financieras
router.get('/financial-stats', adminController.getFinancialStats.bind(adminController))

// Operaciones CRUD
router.put('/users/:id/status', adminController.updateUserStatus.bind(adminController))
router.put('/projects/:id/status', adminController.updateProjectStatus.bind(adminController))

router.post('/products', adminController.createProduct.bind(adminController))
router.put('/products/:id', adminController.updateProduct.bind(adminController))
router.delete('/products/:id', adminController.deleteProduct.bind(adminController))

// Reportes
router.get('/reports/summary', adminController.getSummaryReport.bind(adminController))

export default router