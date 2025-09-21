import { prisma } from '@bel-energy/database'
import { UserType, ProjectStatus, TransactionStatus } from '@bel-energy/database'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  completedProjects: number
  totalRevenue: number
  monthlyRevenue: number
  averageProjectValue: number
  conversionRate: number
}

export interface RevenueData {
  month: string
  revenue: number
  projects: number
  transactions: number
}

export interface UserGrowthData {
  month: string
  newUsers: number
  activeUsers: number
  totalUsers: number
}

export interface ProjectDistribution {
  status: string
  count: number
  percentage: number
}

export interface TopAliado {
  id: string
  name: string
  rating: number
  projectsCompleted: number
  totalRevenue: number
  specialization: string
}

export interface RecentActivity {
  id: string
  type: 'project' | 'user' | 'payment' | 'aliado'
  description: string
  timestamp: Date
  user?: string
  amount?: number
}

export class AdminService {
  // Estadísticas principales del dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    // Usuarios totales
    const totalUsers = await prisma.user.count()

    // Usuarios activos (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    // Proyectos
    const totalProjects = await prisma.proyecto.count()
    const completedProjects = await prisma.proyecto.count({
      where: { status: 'COMPLETADO' }
    })

    // Ingresos totales
    const allTransactions = await prisma.transaccion.findMany({
      where: { status: 'COMPLETED' }
    })
    const totalRevenue = allTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Ingresos del mes actual
    const currentMonth = new Date()
    currentMonth.setDate(1)
    const monthlyTransactions = await prisma.transaccion.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: currentMonth
        }
      }
    })
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Valor promedio de proyecto
    const averageProjectValue = totalProjects > 0 ? totalRevenue / totalProjects : 0

    // Tasa de conversión (proyectos completados / total proyectos)
    const conversionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0

    return {
      totalUsers,
      activeUsers,
      totalProjects,
      completedProjects,
      totalRevenue,
      monthlyRevenue,
      averageProjectValue,
      conversionRate
    }
  }

  // Datos de ingresos por mes (últimos 12 meses)
  async getRevenueData(): Promise<RevenueData[]> {
    const revenueData: RevenueData[] = []

    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      date.setDate(1)

      const nextMonth = new Date(date)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      const transactions = await prisma.transaccion.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        }
      })

      const projects = await prisma.proyecto.findMany({
        where: {
          status: 'COMPLETADO',
          updatedAt: {
            gte: date,
            lt: nextMonth
          }
        }
      })

      revenueData.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        revenue: transactions.reduce((sum, t) => sum + t.amount, 0),
        projects: projects.length,
        transactions: transactions.length
      })
    }

    return revenueData
  }

  // Crecimiento de usuarios
  async getUserGrowthData(): Promise<UserGrowthData[]> {
    const growthData: UserGrowthData[] = []
    let cumulativeUsers = 0

    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      date.setDate(1)

      const nextMonth = new Date(date)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      const newUsers = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextMonth
          }
        }
      })

      const activeUsers = await prisma.user.count({
        where: {
          updatedAt: {
            gte: date,
            lt: nextMonth
          }
        }
      })

      cumulativeUsers += newUsers

      growthData.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        newUsers,
        activeUsers,
        totalUsers: cumulativeUsers
      })
    }

    return growthData
  }

  // Distribución de proyectos por estado
  async getProjectDistribution(): Promise<ProjectDistribution[]> {
    const projectStatuses = Object.values(ProjectStatus)
    const distribution: ProjectDistribution[] = []

    const totalProjects = await prisma.proyecto.count()

    for (const status of projectStatuses) {
      const count = await prisma.proyecto.count({
        where: { status }
      })

      distribution.push({
        status,
        count,
        percentage: totalProjects > 0 ? (count / totalProjects) * 100 : 0
      })
    }

    return distribution
  }

  // Top aliados por rendimiento
  async getTopAliados(limit: number = 10): Promise<TopAliado[]> {
    const aliados = await prisma.aliado.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        proyectos: {
          where: { status: 'COMPLETADO' },
          include: {
            transacciones: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { projectsCompleted: 'desc' }
      ],
      take: limit
    })

    return aliados.map(aliado => ({
      id: aliado.id,
      name: `${aliado.user.firstName} ${aliado.user.lastName}`,
      rating: aliado.rating,
      projectsCompleted: aliado.projectsCompleted,
      totalRevenue: aliado.proyectos.reduce((sum, project) =>
        sum + project.transacciones.reduce((tSum, t) => tSum + t.amount, 0), 0
      ),
      specialization: aliado.specializations.join(', ')
    }))
  }

  // Actividad reciente
  async getRecentActivity(limit: number = 20): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = []

    // Proyectos recientes
    const recentProjects = await prisma.proyecto.findMany({
      include: {
        cliente: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        aliado: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    })

    recentProjects.forEach(project => {
      activities.push({
        id: `project_${project.id}`,
        type: 'project',
        description: `Proyecto ${project.status.toLowerCase()}: ${project.cliente?.user?.firstName || 'Cliente'} - ${project.aliado?.user?.firstName || 'Aliado'}`,
        timestamp: project.updatedAt,
        user: project.cliente?.user?.firstName
      })
    })

    // Usuarios recientes
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    recentUsers.forEach(user => {
      activities.push({
        id: `user_${user.id}`,
        type: 'user',
        description: `Nuevo usuario registrado: ${user.firstName} ${user.lastName}`,
        timestamp: user.createdAt,
        user: `${user.firstName} ${user.lastName}`
      })
    })

    // Transacciones recientes
    const recentTransactions = await prisma.transaccion.findMany({
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      },
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    recentTransactions.forEach(transaction => {
      activities.push({
        id: `payment_${transaction.id}`,
        type: 'payment',
        description: `Pago completado: ${transaction.user.firstName} ${transaction.user.lastName}`,
        timestamp: transaction.createdAt,
        user: `${transaction.user.firstName} ${transaction.user.lastName}`,
        amount: transaction.amount
      })
    })

    // Ordenar por timestamp descendente
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Gestión de usuarios
  async getUsers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { firstName: { contains: search, mode: 'insensitive' as const } },
        { lastName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        status: true,
        belScore: true,
        createdAt: true,
        updatedAt: true,
        cliente: {
          select: {
            customerType: true
          }
        },
        aliado: {
          select: {
            professionalType: true,
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.user.count({ where })

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Gestión de proyectos
  async getProjects(page: number = 1, limit: number = 20, status?: ProjectStatus) {
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const projects = await prisma.proyecto.findMany({
      where,
      include: {
        cliente: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        aliado: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        },
        items: {
          include: {
            producto: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.proyecto.count({ where })

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Gestión de productos
  async getProducts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit

    const products = await prisma.producto.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.producto.count()

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Estadísticas de finanzas
  async getFinancialStats() {
    const totalRevenue = await prisma.transaccion.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    })

    const monthlyRevenue = await prisma.transaccion.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { amount: true }
    })

    const pendingPayments = await prisma.transaccion.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true }
    })

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      pendingPayments: pendingPayments._sum.amount || 0
    }
  }

  // Actualizar estado de usuario
  async updateUserStatus(userId: string, status: 'ACTIVO' | 'INACTIVO') {
    return await prisma.user.update({
      where: { id: userId },
      data: { status }
    })
  }

  // Actualizar estado de proyecto
  async updateProjectStatus(projectId: string, status: ProjectStatus) {
    return await prisma.proyecto.update({
      where: { id: projectId },
      data: { status }
    })
  }

  // Crear producto
  async createProduct(data: {
    sku: string
    name: string
    category: string
    description: string
    priceUSD: number
    stockQuantity: number
  }) {
    return await prisma.producto.create({
      data: {
        sku: data.sku,
        name: data.name,
        category: data.category as any,
        description: data.description,
        priceUSD: data.priceUSD,
        stockQuantity: data.stockQuantity,
        specifications: {},
        images: [],
        priceWithFinancing: data.priceUSD,
        targetAudience: [],
        compatibleProducts: [],
        installationRequired: true,
        warrantyYears: 5,
        minOrderQuantity: 1,
        diyDifficulty: null
      }
    })
  }

  // Actualizar producto
  async updateProduct(productId: string, data: Partial<{
    name: string
    description: string
    priceUSD: number
    stockQuantity: number
  }>) {
    return await prisma.producto.update({
      where: { id: productId },
      data
    })
  }

  // Eliminar producto
  async deleteProduct(productId: string) {
    return await prisma.producto.delete({
      where: { id: productId }
    })
  }
}

export const adminService = new AdminService()