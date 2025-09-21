import { Request, Response } from 'express'
import { adminService } from '../services/adminService'
import { ProjectStatus } from '@bel-energy/database'

export class AdminController {
  // GET /api/admin/dashboard - Estadísticas principales del dashboard
  async getDashboardStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getDashboardStats()
      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error getting dashboard stats:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/revenue - Datos de ingresos por mes
  async getRevenueData(req: Request, res: Response) {
    try {
      const revenueData = await adminService.getRevenueData()
      res.json({
        success: true,
        data: revenueData
      })
    } catch (error) {
      console.error('Error getting revenue data:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/users-growth - Crecimiento de usuarios
  async getUserGrowthData(req: Request, res: Response) {
    try {
      const growthData = await adminService.getUserGrowthData()
      res.json({
        success: true,
        data: growthData
      })
    } catch (error) {
      console.error('Error getting user growth data:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/projects-distribution - Distribución de proyectos
  async getProjectDistribution(req: Request, res: Response) {
    try {
      const distribution = await adminService.getProjectDistribution()
      res.json({
        success: true,
        data: distribution
      })
    } catch (error) {
      console.error('Error getting project distribution:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/top-aliados - Top aliados por rendimiento
  async getTopAliados(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
      const topAliados = await adminService.getTopAliados(limit)
      res.json({
        success: true,
        data: topAliados
      })
    } catch (error) {
      console.error('Error getting top aliados:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/recent-activity - Actividad reciente
  async getRecentActivity(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
      const activities = await adminService.getRecentActivity(limit)
      res.json({
        success: true,
        data: activities
      })
    } catch (error) {
      console.error('Error getting recent activity:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/users - Gestión de usuarios con paginación
  async getUsers(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
      const search = req.query.search as string

      const result = await adminService.getUsers(page, limit, search)
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Error getting users:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/projects - Gestión de proyectos con paginación
  async getProjects(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
      const status = req.query.status as ProjectStatus

      const result = await adminService.getProjects(page, limit, status)
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Error getting projects:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/products - Gestión de productos con paginación
  async getProducts(req: Request, res: Response) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20

      const result = await adminService.getProducts(page, limit)
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      console.error('Error getting products:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/financial-stats - Estadísticas financieras
  async getFinancialStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getFinancialStats()
      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error getting financial stats:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // PUT /api/admin/users/:id/status - Actualizar estado de usuario
  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status || !['ACTIVO', 'INACTIVO'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido'
        })
      }

      const user = await adminService.updateUserStatus(id, status)
      res.json({
        success: true,
        data: user,
        message: 'Estado de usuario actualizado exitosamente'
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // PUT /api/admin/projects/:id/status - Actualizar estado de proyecto
  async updateProjectStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Estado requerido'
        })
      }

      const project = await adminService.updateProjectStatus(id, status)
      res.json({
        success: true,
        data: project,
        message: 'Estado de proyecto actualizado exitosamente'
      })
    } catch (error) {
      console.error('Error updating project status:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/admin/products - Crear producto
  async createProduct(req: Request, res: Response) {
    try {
      const { sku, name, category, description, priceUSD, stockQuantity } = req.body

      if (!sku || !name || !category || !description || !priceUSD || stockQuantity === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Todos los campos son requeridos'
        })
      }

      const product = await adminService.createProduct({
        sku,
        name,
        category,
        description,
        priceUSD: parseFloat(priceUSD),
        stockQuantity: parseInt(stockQuantity)
      })

      res.status(201).json({
        success: true,
        data: product,
        message: 'Producto creado exitosamente'
      })
    } catch (error) {
      console.error('Error creating product:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // PUT /api/admin/products/:id - Actualizar producto
  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params
      const updateData = req.body

      const product = await adminService.updateProduct(id, updateData)
      res.json({
        success: true,
        data: product,
        message: 'Producto actualizado exitosamente'
      })
    } catch (error) {
      console.error('Error updating product:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // DELETE /api/admin/products/:id - Eliminar producto
  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params

      await adminService.deleteProduct(id)
      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/admin/reports/summary - Reporte resumen
  async getSummaryReport(req: Request, res: Response) {
    try {
      const [
        dashboardStats,
        revenueData,
        userGrowthData,
        projectDistribution,
        topAliados,
        financialStats
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRevenueData(),
        adminService.getUserGrowthData(),
        adminService.getProjectDistribution(),
        adminService.getTopAliados(5),
        adminService.getFinancialStats()
      ])

      const report = {
        generatedAt: new Date().toISOString(),
        dashboardStats,
        revenueData,
        userGrowthData,
        projectDistribution,
        topAliados,
        financialStats
      }

      res.json({
        success: true,
        data: report
      })
    } catch (error) {
      console.error('Error generating summary report:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }
}

export const adminController = new AdminController()