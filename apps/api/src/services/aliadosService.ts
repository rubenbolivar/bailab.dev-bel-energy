import { prisma } from '@bel-energy/database'
import { ProfessionalType, Specialization, AvailabilityStatus, AcademyLevel } from '@bel-energy/database'
import { notificationService } from './notificationService'

export interface AliadoProfile {
  id: string
  userId: string
  professionalType: ProfessionalType
  licenseNumber?: string
  certifications: any[]
  serviceAreas: string[]
  specializations: Specialization[]
  rating: number
  projectsCompleted: number
  academyLevel: AcademyLevel
  commissionRate: number
  availabilityStatus: AvailabilityStatus
  portfolio?: any
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

export interface ProjectAssignment {
  id: string
  projectId: string
  aliadoId: string
  assignedAt: Date
  status: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  estimatedCompletion: Date
  notes?: string
}

export interface CommissionRecord {
  id: string
  aliadoId: string
  projectId: string
  amount: number
  percentage: number
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  paidAt?: Date
  description: string
}

export class AliadosService {
  // Registro de nuevo aliado
  async registerAliado(data: {
    userId: string
    professionalType: ProfessionalType
    licenseNumber?: string
    serviceAreas: string[]
    specializations: Specialization[]
    commissionRate: number
    portfolio?: any
  }): Promise<AliadoProfile> {
    const aliado = await prisma.aliado.create({
      data: {
        userId: data.userId,
        professionalType: data.professionalType,
        licenseNumber: data.licenseNumber,
        serviceAreas: data.serviceAreas,
        specializations: data.specializations,
        commissionRate: data.commissionRate,
        portfolio: data.portfolio,
        certifications: [],
        academyLevel: 'BASICO',
        availabilityStatus: 'DISPONIBLE'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return aliado as AliadoProfile
  }

  // Obtener perfil completo del aliado
  async getAliadoProfile(aliadoId: string): Promise<AliadoProfile | null> {
    const aliado = await prisma.aliado.findUnique({
      where: { id: aliadoId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        proyectos: {
          include: {
            cliente: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return aliado as AliadoProfile | null
  }

  // Obtener perfil del aliado por userId
  async getAliadoProfileByUserId(userId: string): Promise<AliadoProfile | null> {
    const aliado = await prisma.aliado.findUnique({
      where: { userId: userId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        proyectos: {
          include: {
            cliente: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return aliado as AliadoProfile | null
  }

  // Obtener aliados por especialización y ubicación
  async findAliadosBySpecialization(
    specialization: Specialization,
    serviceArea: string,
    limit: number = 10
  ): Promise<AliadoProfile[]> {
    const aliados = await prisma.aliado.findMany({
      where: {
        specializations: {
          has: specialization
        },
        serviceAreas: {
          has: serviceArea
        },
        availabilityStatus: 'DISPONIBLE'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { projectsCompleted: 'desc' }
      ],
      take: limit
    })

    return aliados as AliadoProfile[]
  }

  // Asignar proyecto a aliado
  async assignProjectToAliado(
    projectId: string,
    aliadoId: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM',
    notes?: string
  ): Promise<ProjectAssignment> {
    // Verificar que el aliado esté disponible
    const aliado = await prisma.aliado.findUnique({
      where: { id: aliadoId }
    })

    if (!aliado || aliado.availabilityStatus !== 'DISPONIBLE') {
      throw new Error('Aliado no disponible para asignación')
    }

    // Crear asignación
    const assignment = await prisma.proyecto.update({
      where: { id: projectId },
      data: {
        aliladoId: aliadoId,
        status: 'APROBADO'
      }
    })

    // Actualizar estado del aliado
    await prisma.aliado.update({
      where: { id: aliadoId },
      data: {
        availabilityStatus: 'OCUPADO'
      }
    })

    const assignmentResult = {
      id: `assignment_${Date.now()}`,
      projectId,
      aliadoId,
      assignedAt: new Date(),
      status: 'ASSIGNED',
      priority,
      estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      notes
    }

    // Enviar notificación en tiempo real al aliado
    try {
      await notificationService.notifyProjectAssigned(projectId, aliadoId)
    } catch (error) {
      console.error('Error sending project assignment notification:', error)
    }

    return assignmentResult
  }

  // Completar proyecto y calcular comisión
  async completeProject(
    projectId: string,
    aliadoId: string,
    finalRating?: number,
    notes?: string
  ): Promise<CommissionRecord> {
    // Obtener información del proyecto
    const project = await prisma.proyecto.findUnique({
      where: { id: projectId },
      include: {
        aliado: true,
        cliente: {
          include: {
            user: {
              select: {
                firstName: true
              }
            }
          }
        },
        transacciones: true
      }
    })

    if (!project || project.aliladoId !== aliadoId) {
      throw new Error('Proyecto no encontrado o no asignado a este aliado')
    }

    // Calcular monto total del proyecto
    const totalAmount = project.transacciones
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0)

    // Calcular comisión
    const commissionAmount = totalAmount * (project.aliado!.commissionRate / 100)

    // Crear registro de comisión
    const commission: CommissionRecord = {
      id: `commission_${Date.now()}`,
      aliadoId,
      projectId,
      amount: commissionAmount,
      percentage: project.aliado!.commissionRate,
      status: 'PENDING',
      description: `Comisión por proyecto ${project.id}`
    }

    // Actualizar proyecto
    await prisma.proyecto.update({
      where: { id: projectId },
      data: {
        status: 'COMPLETADO',
        completionDate: new Date()
      }
    })

    // Actualizar estadísticas del aliado
    await prisma.aliado.update({
      where: { id: aliadoId },
      data: {
        projectsCompleted: {
          increment: 1
        },
        availabilityStatus: 'DISPONIBLE',
        rating: finalRating || project.aliado!.rating
      }
    })

    return commission
  }

  // Obtener proyectos asignados al aliado
  async getAssignedProjects(aliadoId: string): Promise<any[]> {
    const projects = await prisma.proyecto.findMany({
      where: {
        aliladoId: aliadoId,
        status: {
          in: ['APROBADO', 'EN_PROCESO']
        }
      },
      include: {
        cliente: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        items: {
          include: {
            producto: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return projects
  }

  // Obtener comisiones del aliado
  async getCommissions(aliadoId: string): Promise<CommissionRecord[]> {
    // En una implementación real, tendríamos una tabla de comisiones
    // Por ahora, simulamos datos
    const aliado = await prisma.aliado.findUnique({
      where: { id: aliadoId },
      include: {
        proyectos: {
          where: {
            status: 'COMPLETADO'
          }
        }
      }
    })

    if (!aliado) return []

    // Simular comisiones basadas en proyectos completados
    const commissions: CommissionRecord[] = aliado.proyectos.map(project => ({
      id: `commission_${project.id}`,
      aliadoId,
      projectId: project.id,
      amount: project.totalAmount * (aliado.commissionRate / 100),
      percentage: aliado.commissionRate,
      status: Math.random() > 0.5 ? 'PAID' : 'PENDING',
      paidAt: Math.random() > 0.5 ? new Date() : undefined,
      description: `Comisión por proyecto ${project.id}`
    }))

    return commissions
  }

  // Actualizar certificaciones del aliado
  async updateCertifications(
    aliadoId: string,
    certifications: any[]
  ): Promise<AliadoProfile> {
    const aliado = await prisma.aliado.update({
      where: { id: aliadoId },
      data: {
        certifications
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return aliado as AliadoProfile
  }

  // Actualizar nivel de academia
  async updateAcademyLevel(
    aliadoId: string,
    newLevel: AcademyLevel
  ): Promise<AliadoProfile> {
    const aliado = await prisma.aliado.update({
      where: { id: aliadoId },
      data: {
        academyLevel: newLevel
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return aliado as AliadoProfile
  }

  // Buscar aliados disponibles para un proyecto
  async findAvailableAliados(
    specialization: Specialization,
    serviceArea: string,
    maxDistance: number = 50
  ): Promise<AliadoProfile[]> {
    const aliados = await prisma.aliado.findMany({
      where: {
        specializations: {
          has: specialization
        },
        serviceAreas: {
          has: serviceArea
        },
        availabilityStatus: 'DISPONIBLE',
        academyLevel: {
          in: ['INTERMEDIO', 'AVANZADO', 'EXPERTO']
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { projectsCompleted: 'desc' },
        { academyLevel: 'desc' }
      ],
      take: 5
    })

    return aliados as AliadoProfile[]
  }

  // Calcular rating promedio del aliado
  async calculateAverageRating(aliadoId: string): Promise<number> {
    // En una implementación real, tendríamos una tabla de ratings por proyecto
    // Por ahora, devolvemos el rating actual
    const aliado = await prisma.aliado.findUnique({
      where: { id: aliadoId },
      select: { rating: true }
    })

    return aliado?.rating || 0
  }

  // Actualizar estado de disponibilidad
  async updateAvailabilityStatus(
    aliadoId: string,
    status: AvailabilityStatus
  ): Promise<AliadoProfile> {
    const aliado = await prisma.aliado.update({
      where: { id: aliadoId },
      data: {
        availabilityStatus: status
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    })

    return aliado as AliadoProfile
  }

  // Algoritmo de asignación automática inteligente
  async autoAssignProject(projectData: {
    projectType: string
    location: string
    specialization: Specialization
    budget: number
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  }): Promise<{
    bestMatch: AliadoProfile | null
    candidates: AliadoProfile[]
    assignment: ProjectAssignment | null
  }> {
    const { projectType, location, specialization, budget, priority } = projectData

    // 1. Buscar candidatos iniciales por especialización y ubicación
    const candidates = await prisma.aliado.findMany({
      where: {
        specializations: {
          has: specialization
        },
        serviceAreas: {
          has: location
        },
        availabilityStatus: 'DISPONIBLE'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        proyectos: {
          where: {
            status: {
              in: ['APROBADO', 'EN_PROCESO']
            }
          }
        }
      }
    })

    if (candidates.length === 0) {
      return {
        bestMatch: null,
        candidates: [],
        assignment: null
      }
    }

    // 2. Calcular puntuación para cada candidato
    const scoredCandidates = await Promise.all(
      candidates.map(async (aliado) => {
        let score = 0
        const maxScore = 100

        // Factor 1: Rating (30% del score)
        const ratingScore = (aliado.rating / 5) * 30
        score += ratingScore

        // Factor 2: Experiencia (25% del score)
        const experienceScore = Math.min(aliado.projectsCompleted * 2, 25)
        score += experienceScore

        // Factor 3: Nivel de academia (20% del score)
        const academyLevels = { BASICO: 0, INTERMEDIO: 10, AVANZADO: 15, EXPERTO: 20 }
        const academyScore = academyLevels[aliado.academyLevel] || 0
        score += academyScore

        // Factor 4: Carga de trabajo (15% del score)
        const currentProjects = aliado.proyectos.length
        const workloadScore = Math.max(15 - currentProjects * 3, 0)
        score += workloadScore

        // Factor 5: Tipo de proyecto (10% del score)
        const specializationMatch = aliado.specializations.includes(specialization) ? 10 : 0
        score += specializationMatch

        // Factor 6: Prioridad del proyecto (bonus)
        const priorityBonus = priority === 'URGENT' ? 5 : priority === 'HIGH' ? 3 : 0
        score += priorityBonus

        return {
          aliado: aliado as AliadoProfile,
          score: Math.min(score, maxScore),
          factors: {
            rating: ratingScore,
            experience: experienceScore,
            academy: academyScore,
            workload: workloadScore,
            specialization: specializationMatch,
            priority: priorityBonus
          }
        }
      })
    )

    // 3. Ordenar por puntuación descendente
    scoredCandidates.sort((a, b) => b.score - a.score)

    // 4. Seleccionar el mejor candidato
    const bestCandidate = scoredCandidates[0]

    if (!bestCandidate || bestCandidate.score < 40) {
      // Umbral mínimo de 40 puntos para asignación automática
      return {
        bestMatch: null,
        candidates: scoredCandidates.map(c => c.aliado),
        assignment: null
      }
    }

    return {
      bestMatch: bestCandidate.aliado,
      candidates: scoredCandidates.map(c => c.aliado),
      assignment: null // Se asignará cuando se confirme
    }
  }

  // Asignar proyecto automáticamente
  async assignProjectAutomatically(projectData: {
    projectId: string
    projectType: string
    location: string
    specialization: Specialization
    budget: number
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  }): Promise<{
    success: boolean
    assignment?: ProjectAssignment
    bestMatch?: AliadoProfile
    message: string
  }> {
    try {
      const { projectId, ...assignmentData } = projectData

      // Ejecutar algoritmo de asignación
      const result = await this.autoAssignProject(assignmentData)

      if (!result.bestMatch) {
        // Notificar a administradores sobre asignación fallida
        try {
          await notificationService.notifyAutoAssignmentFailed(projectId)
        } catch (error) {
          console.error('Error sending auto-assignment failed notification:', error)
        }

        return {
          success: false,
          message: 'No se encontró un aliado adecuado para este proyecto'
        }
      }

      // Asignar el proyecto al mejor candidato
      const assignment = await this.assignProjectToAliado(
        projectId,
        result.bestMatch.id,
        assignmentData.priority,
        'Asignación automática basada en algoritmo inteligente'
      )

      // Notificar a administradores sobre asignación exitosa
      try {
        // Calcular score aproximado (esto es una simplificación)
        const score = 85 // Score promedio para asignaciones exitosas
        await notificationService.notifyAutoAssignment(
          projectId,
          `${result.bestMatch.user.firstName} ${result.bestMatch.user.lastName}`,
          score
        )
      } catch (error) {
        console.error('Error sending auto-assignment success notification:', error)
      }

      return {
        success: true,
        assignment,
        bestMatch: result.bestMatch,
        message: `Proyecto asignado automáticamente a ${result.bestMatch.user.firstName} ${result.bestMatch.user.lastName}`
      }
    } catch (error) {
      console.error('Error in automatic project assignment:', error)
      return {
        success: false,
        message: 'Error al asignar proyecto automáticamente'
      }
    }
  }

  // Obtener estadísticas de asignación automática
  async getAssignmentStats(): Promise<{
    totalProjects: number
    autoAssignedProjects: number
    manualAssignedProjects: number
    averageAssignmentScore: number
    successRate: number
  }> {
    // En una implementación real, tendríamos una tabla de asignaciones
    // Por ahora, devolvemos estadísticas simuladas
    return {
      totalProjects: 150,
      autoAssignedProjects: 120,
      manualAssignedProjects: 30,
      averageAssignmentScore: 78.5,
      successRate: 85.2
    }
  }
}

export const aliadosService = new AliadosService()