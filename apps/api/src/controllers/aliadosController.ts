import { Request, Response } from 'express'
import { aliadosService } from '../services/aliadosService'
import { ProfessionalType, Specialization, AvailabilityStatus, AcademyLevel } from '@bel-energy/database'

export class AliadosController {
  // POST /api/aliados/register - Registrar nuevo aliado
  async registerAliado(req: Request, res: Response) {
    try {
      const {
        userId,
        professionalType,
        licenseNumber,
        serviceAreas,
        specializations,
        commissionRate,
        portfolio
      } = req.body

      if (!userId || !professionalType || !serviceAreas || !specializations || !commissionRate) {
        return res.status(400).json({
          success: false,
          error: 'Datos incompletos para registro de aliado'
        })
      }

      const aliado = await aliadosService.registerAliado({
        userId,
        professionalType,
        licenseNumber,
        serviceAreas,
        specializations,
        commissionRate,
        portfolio
      })

      res.status(201).json({
        success: true,
        data: aliado,
        message: 'Aliado registrado exitosamente'
      })
    } catch (error) {
      console.error('Error registering aliado:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/aliados/profile/:id - Obtener perfil del aliado
  async getAliadoProfile(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id

      // Allow admins to view any profile, but allies can only view their own
      if (req.user?.userType !== 'ADMIN' && userId !== id) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver este perfil'
        })
      }

      // Find aliado by userId instead of aliado id
      const aliado = await aliadosService.getAliadoProfileByUserId(id)

      if (!aliado) {
        return res.status(404).json({
          success: false,
          error: 'Aliado no encontrado'
        })
      }

      res.json({
        success: true,
        data: aliado
      })
    } catch (error) {
      console.error('Error getting aliado profile:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/aliados/search - Buscar aliados por especialización
  async searchAliados(req: Request, res: Response) {
    try {
      const { specialization, serviceArea, limit } = req.query

      if (!specialization || !serviceArea) {
        return res.status(400).json({
          success: false,
          error: 'Especialización y área de servicio requeridas'
        })
      }

      const aliados = await aliadosService.findAliadosBySpecialization(
        specialization as Specialization,
        serviceArea as string,
        limit ? parseInt(limit as string) : 10
      )

      res.json({
        success: true,
        data: aliados,
        count: aliados.length
      })
    } catch (error) {
      console.error('Error searching aliados:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/aliados/assign-project - Asignar proyecto a aliado
  async assignProject(req: Request, res: Response) {
    try {
      const { projectId, aliadoId, priority, notes } = req.body

      if (!projectId || !aliadoId) {
        return res.status(400).json({
          success: false,
          error: 'ID de proyecto y aliado requeridos'
        })
      }

      const assignment = await aliadosService.assignProjectToAliado(
        projectId,
        aliadoId,
        priority || 'MEDIUM',
        notes
      )

      res.json({
        success: true,
        data: assignment,
        message: 'Proyecto asignado exitosamente'
      })
    } catch (error) {
      console.error('Error assigning project:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/aliados/complete-project - Completar proyecto
  async completeProject(req: Request, res: Response) {
    try {
      const { projectId, aliadoId, rating, notes } = req.body

      if (!projectId || !aliadoId) {
        return res.status(400).json({
          success: false,
          error: 'ID de proyecto y aliado requeridos'
        })
      }

      const commission = await aliadosService.completeProject(
        projectId,
        aliadoId,
        rating,
        notes
      )

      res.json({
        success: true,
        data: commission,
        message: 'Proyecto completado exitosamente'
      })
    } catch (error) {
      console.error('Error completing project:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/aliados/:id/projects - Obtener proyectos asignados
  async getAssignedProjects(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id

      // Allow admins to view any projects, but allies can only view their own
      if (req.user?.userType !== 'ADMIN' && userId !== id) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver estos proyectos'
        })
      }

      const projects = await aliadosService.getAssignedProjects(id)

      res.json({
        success: true,
        data: projects,
        count: projects.length
      })
    } catch (error) {
      console.error('Error getting assigned projects:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/aliados/:id/commissions - Obtener comisiones del aliado
  async getCommissions(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = req.user?.id

      // Allow admins to view any commissions, but allies can only view their own
      if (req.user?.userType !== 'ADMIN' && userId !== id) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para ver estas comisiones'
        })
      }

      const commissions = await aliadosService.getCommissions(id)

      const totalPending = commissions
        .filter(c => c.status === 'PENDING')
        .reduce((sum, c) => sum + c.amount, 0)

      const totalPaid = commissions
        .filter(c => c.status === 'PAID')
        .reduce((sum, c) => sum + c.amount, 0)

      res.json({
        success: true,
        data: {
          commissions,
          summary: {
            totalPending,
            totalPaid,
            totalEarned: totalPending + totalPaid
          }
        }
      })
    } catch (error) {
      console.error('Error getting commissions:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // PUT /api/aliados/:id/certifications - Actualizar certificaciones
  async updateCertifications(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { certifications } = req.body
      const userId = req.user?.id

      // Only allow allies to update their own certifications
      if (userId !== id) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para actualizar estas certificaciones'
        })
      }

      if (!Array.isArray(certifications)) {
        return res.status(400).json({
          success: false,
          error: 'Certificaciones debe ser un array'
        })
      }

      const aliado = await aliadosService.updateCertifications(id, certifications)

      res.json({
        success: true,
        data: aliado,
        message: 'Certificaciones actualizadas exitosamente'
      })
    } catch (error) {
      console.error('Error updating certifications:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // PUT /api/aliados/:id/academy-level - Actualizar nivel de academia
  async updateAcademyLevel(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { academyLevel } = req.body
      const userId = req.user?.id

      // Only allow allies to update their own academy level
      if (userId !== id) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para actualizar este nivel de academia'
        })
      }

      if (!academyLevel) {
        return res.status(400).json({
          success: false,
          error: 'Nivel de academia requerido'
        })
      }

      const aliado = await aliadosService.updateAcademyLevel(id, academyLevel)

      res.json({
        success: true,
        data: aliado,
        message: 'Nivel de academia actualizado exitosamente'
      })
    } catch (error) {
      console.error('Error updating academy level:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/aliados/available - Buscar aliados disponibles
  async findAvailableAliados(req: Request, res: Response) {
    try {
      const { specialization, serviceArea, maxDistance } = req.query

      if (!specialization || !serviceArea) {
        return res.status(400).json({
          success: false,
          error: 'Especialización y área de servicio requeridas'
        })
      }

      const aliados = await aliadosService.findAvailableAliados(
        specialization as Specialization,
        serviceArea as string,
        maxDistance ? parseInt(maxDistance as string) : 50
      )

      res.json({
        success: true,
        data: aliados,
        count: aliados.length
      })
    } catch (error) {
      console.error('Error finding available aliados:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // PUT /api/aliados/:id/availability - Actualizar disponibilidad
  async updateAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status } = req.body
      const userId = req.user?.id

      // Only allow allies to update their own availability
      if (userId !== id) {
        return res.status(403).json({
          success: false,
          error: 'No tienes permisos para actualizar esta disponibilidad'
        })
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Estado de disponibilidad requerido'
        })
      }

      const aliado = await aliadosService.updateAvailabilityStatus(id, status)

      res.json({
        success: true,
        data: aliado,
        message: 'Disponibilidad actualizada exitosamente'
      })
    } catch (error) {
      console.error('Error updating availability:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/aliados/stats - Estadísticas generales de aliados
  async getAliadosStats(req: Request, res: Response) {
    try {
      // En una implementación real, calcularíamos estadísticas de la base de datos
      const stats = {
        totalAliados: 0,
        aliadosActivos: 0,
        proyectosCompletados: 0,
        ratingPromedio: 0,
        comisionesPagadas: 0,
        distribucionPorTipo: {
          INGENIERO: 0,
          ARQUITECTO: 0,
          CONSTRUCTOR: 0,
          TECNICO: 0
        },
        distribucionPorEspecializacion: {
          RESIDENCIAL: 0,
          COMERCIAL: 0,
          INDUSTRIAL: 0,
          AGRO: 0
        }
      }

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error getting aliados stats:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // POST /api/aliados/auto-assign - Asignación automática de proyectos
  async autoAssignProject(req: Request, res: Response) {
    try {
      const {
        projectId,
        projectType,
        location,
        specialization,
        budget,
        priority = 'MEDIUM'
      } = req.body

      if (!projectId || !projectType || !location || !specialization) {
        return res.status(400).json({
          success: false,
          error: 'Datos incompletos para asignación automática'
        })
      }

      const result = await aliadosService.assignProjectAutomatically({
        projectId,
        projectType,
        location,
        specialization,
        budget: budget || 0,
        priority
      })

      if (result.success) {
        res.json({
          success: true,
          data: {
            assignment: result.assignment,
            bestMatch: result.bestMatch
          },
          message: result.message
        })
      } else {
        res.status(404).json({
          success: false,
          error: result.message
        })
      }
    } catch (error) {
      console.error('Error in auto assignment:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }

  // GET /api/aliados/assignment-stats - Estadísticas de asignación
  async getAssignmentStats(req: Request, res: Response) {
    try {
      const stats = await aliadosService.getAssignmentStats()

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      console.error('Error getting assignment stats:', error)
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      })
    }
  }
}

export const aliadosController = new AliadosController()