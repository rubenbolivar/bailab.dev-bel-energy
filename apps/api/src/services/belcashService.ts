import { prisma } from '@bel-energy/database'

export interface BelScoreFactors {
  belEnergyHistory: number // 0-100 (40% peso)
  demographicData: number  // 0-100 (20% peso)
  businessReferences: number // 0-100 (20% peso)
  digitalBehavior: number   // 0-100 (20% peso)
}

export interface BelScoreResult {
  score: number // 0-1000
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  factors: BelScoreFactors
  recommendations: string[]
}

export interface FinancingOption {
  installments: number
  interestRate: number
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
  description: string
}

export interface FinancingSimulation {
  principal: number
  belScore: number
  availableOptions: FinancingOption[]
  recommendedOption: FinancingOption
  riskAssessment: string
}

export class BelCashService {
  // Pesos para el cálculo del BelScore
  private readonly WEIGHTS = {
    belEnergyHistory: 0.4,
    demographicData: 0.2,
    businessReferences: 0.2,
    digitalBehavior: 0.2
  }

  // Matriz de financiamiento por rango de BelScore
  private readonly FINANCING_MATRIX = {
    'A': { minScore: 800, maxInstallments: 12, interestRate: 0.00, description: 'Excelente - Financiamiento preferencial' },
    'B': { minScore: 600, maxInstallments: 8, interestRate: 0.05, description: 'Muy bueno - Buenas condiciones' },
    'C': { minScore: 400, maxInstallments: 6, interestRate: 0.10, description: 'Bueno - Condiciones estándar' },
    'D': { minScore: 200, maxInstallments: 4, interestRate: 0.15, description: 'Regular - Condiciones limitadas' },
    'F': { minScore: 0, maxInstallments: 1, interestRate: 0.00, description: 'Bajo - Solo contado' }
  }

  async calculateBelScore(userId: string): Promise<BelScoreResult> {
    // Obtener datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        transacciones: true,
        cliente: {
          include: {
            proyectos: {
              include: {
                transacciones: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      throw new Error('Usuario no encontrado')
    }

    // Calcular factores del BelScore
    const factors: BelScoreFactors = {
      belEnergyHistory: await this.calculateBelEnergyHistory(user),
      demographicData: this.calculateDemographicData(user),
      businessReferences: await this.calculateBusinessReferences(user),
      digitalBehavior: this.calculateDigitalBehavior(user)
    }

    // Calcular BelScore final (0-1000)
    const score = Math.round(
      (factors.belEnergyHistory * 100 * this.WEIGHTS.belEnergyHistory) +
      (factors.demographicData * 100 * this.WEIGHTS.demographicData) +
      (factors.businessReferences * 100 * this.WEIGHTS.businessReferences) +
      (factors.digitalBehavior * 100 * this.WEIGHTS.digitalBehavior)
    )

    // Determinar grado
    const grade = this.getGradeFromScore(score)

    // Generar recomendaciones
    const recommendations = this.generateRecommendations(score, grade)

    return {
      score,
      grade,
      factors,
      recommendations
    }
  }

  async simulateFinancing(principal: number, userId: string): Promise<FinancingSimulation> {
    // Calcular BelScore del usuario
    const belScoreResult = await this.calculateBelScore(userId)

    // Generar opciones de financiamiento disponibles
    const availableOptions = this.generateFinancingOptions(principal, belScoreResult.grade)

    // Recomendar la mejor opción
    const recommendedOption = availableOptions[0] // La primera es la recomendada

    // Evaluar riesgo
    const riskAssessment = this.assessRisk(belScoreResult.score, principal)

    return {
      principal,
      belScore: belScoreResult.score,
      availableOptions,
      recommendedOption,
      riskAssessment
    }
  }

  private async calculateBelEnergyHistory(user: any): Promise<number> {
    let score = 0

    // Historial de transacciones (40% del factor)
    const transactions = user.transacciones || []
    const completedTransactions = transactions.filter((t: any) => t.status === 'COMPLETED')

    if (completedTransactions.length > 0) {
      score += 30 // Tiene transacciones completadas
      score += Math.min(completedTransactions.length * 5, 20) // Hasta 20 puntos por volumen
    }

    // Historial de proyectos (30% del factor)
    const projects = user.cliente?.proyectos || []
    const completedProjects = projects.filter((p: any) => p.status === 'COMPLETADO')

    if (completedProjects.length > 0) {
      score += 20 // Tiene proyectos completados
      score += Math.min(completedProjects.length * 3, 15) // Hasta 15 puntos por proyectos
    }

    // Tiempo como cliente (10% del factor)
    const accountAge = Date.now() - new Date(user.createdAt).getTime()
    const monthsAsCustomer = accountAge / (1000 * 60 * 60 * 24 * 30)

    if (monthsAsCustomer > 12) score += 10
    else if (monthsAsCustomer > 6) score += 7
    else if (monthsAsCustomer > 3) score += 4
    else if (monthsAsCustomer > 1) score += 2

    return Math.min(score, 100)
  }

  private calculateDemographicData(user: any): number {
    let score = 50 // Base neutral

    // Edad (asumiendo que tenemos fecha de nacimiento en el futuro)
    // Por ahora, damos puntos por tener información completa
    if (user.firstName && user.lastName) score += 10
    if (user.phone) score += 10
    if (user.location) score += 15

    // Tipo de cliente
    if (user.userType === 'CLIENTE') score += 10
    else if (user.userType === 'ALIADO') score += 5

    // Código de referido
    if (user.referralCode) score += 5

    return Math.min(score, 100)
  }

  private async calculateBusinessReferences(user: any): Promise<number> {
    // En una implementación real, esto consultaría referencias comerciales
    // Por ahora, simulamos basado en el perfil del usuario

    let score = 30 // Base

    // Si tiene proyectos completados, asumimos buenas referencias
    const projects = user.cliente?.proyectos || []
    const completedProjects = projects.filter((p: any) => p.status === 'COMPLETADO')

    if (completedProjects.length > 0) {
      score += Math.min(completedProjects.length * 10, 40)
    }

    // Si es aliado verificado
    if (user.userType === 'ALIADO') {
      score += 20
    }

    // Si tiene código de referido activo
    if (user.referralCode) {
      score += 10
    }

    return Math.min(score, 100)
  }

  private calculateDigitalBehavior(user: any): number {
    let score = 40 // Base

    // Preferencias configuradas
    if (user.preferences) score += 20

    // Historial de transacciones digitales
    const transactions = user.transacciones || []
    if (transactions.length > 0) {
      score += Math.min(transactions.length * 5, 20)
    }

    // Uso de herramientas (calculadora, etc.)
    // En el futuro podríamos trackear esto
    score += 10

    // Actividad reciente
    const lastActivity = new Date(user.updatedAt)
    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceActivity < 30) score += 10
    else if (daysSinceActivity < 90) score += 5

    return Math.min(score, 100)
  }

  private getGradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 800) return 'A'
    if (score >= 600) return 'B'
    if (score >= 400) return 'C'
    if (score >= 200) return 'D'
    return 'F'
  }

  private generateFinancingOptions(principal: number, grade: string): FinancingOption[] {
    const matrix = this.FINANCING_MATRIX[grade as keyof typeof this.FINANCING_MATRIX]
    const options: FinancingOption[] = []

    // Generar opciones desde 1 hasta el máximo de cuotas permitidas
    for (let installments = 1; installments <= matrix.maxInstallments; installments++) {
      const monthlyPayment = this.calculateMonthlyPayment(principal, matrix.interestRate, installments)
      const totalAmount = monthlyPayment * installments
      const totalInterest = totalAmount - principal

      options.push({
        installments,
        interestRate: matrix.interestRate,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        description: matrix.description
      })
    }

    return options
  }

  private calculateMonthlyPayment(principal: number, annualRate: number, installments: number): number {
    if (annualRate === 0) {
      return principal / installments
    }

    const monthlyRate = annualRate / 12
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, installments)) /
           (Math.pow(1 + monthlyRate, installments) - 1)
  }

  private assessRisk(belScore: number, principal: number): string {
    const riskRatio = principal / belScore

    if (belScore >= 800) {
      return 'Muy bajo riesgo - Excelente perfil crediticio'
    } else if (belScore >= 600) {
      return 'Bajo riesgo - Buen perfil crediticio'
    } else if (belScore >= 400) {
      return 'Riesgo moderado - Perfil crediticio aceptable'
    } else if (belScore >= 200) {
      return 'Riesgo alto - Perfil crediticio limitado'
    } else {
      return 'Riesgo muy alto - Se recomienda pago al contado'
    }
  }

  private generateRecommendations(score: number, grade: string): string[] {
    const recommendations: string[] = []

    if (score < 400) {
      recommendations.push('Complete su perfil con más información personal')
      recommendations.push('Considere comenzar con proyectos más pequeños')
      recommendations.push('Participe en la Academia Bel Energy para mejorar su score')
    } else if (score < 600) {
      recommendations.push('Aumente su actividad en la plataforma')
      recommendations.push('Complete proyectos para construir historial')
      recommendations.push('Invite amigos para obtener bonificaciones')
    } else if (score < 800) {
      recommendations.push('Excelente progreso, mantenga la actividad')
      recommendations.push('Considere convertirse en Aliado certificado')
      recommendations.push('Aproveche las mejores tasas de financiamiento')
    } else {
      recommendations.push('¡Perfil excepcional! Disfrute de las mejores condiciones')
      recommendations.push('Considere programas de referidos premium')
      recommendations.push('Acceda a financiamiento sin intereses')
    }

    return recommendations
  }

  // Método para actualizar BelScore manualmente (para admins)
  async updateBelScore(userId: string, manualScore: number, reason: string): Promise<void> {
    // En una implementación real, esto guardaría el cambio en una tabla de auditoría
    console.log(`BelScore updated for user ${userId}: ${manualScore} - Reason: ${reason}`)

    // Aquí podríamos actualizar algún campo en la base de datos
    // Por ahora solo loggeamos
  }
}

export const belcashService = new BelCashService()