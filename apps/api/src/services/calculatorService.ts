import { prisma } from '@bel-energy/database'

export interface ApplianceData {
  name: string
  powerWatts: number
  hoursPerDay: number
  quantity: number
  dutyCycle?: number // 0-1, factor de uso (ej: 0.8 = 80% del tiempo)
}

export interface ConsumptionProfile {
  monthlyKwh: number
  peakDemand: number
  criticalLoad: number
  appliances: ApplianceData[]
}

export interface CalculationResult {
  monthlyKwh: number
  peakDemand: number
  criticalLoad: number
  recommendedSystem: {
    capacityKw: number
    batteryCapacityKwh: number
    estimatedCost: number
    paybackYears: number
  }
  economicAnalysis: {
    currentMonthlyBill: number
    projectedMonthlyBill: number
    monthlySavings: number
    annualSavings: number
    totalInvestment: number
    roi: number
  }
  productsRecommended: Array<{
    id: string
    name: string
    category: string
    quantity: number
    unitPrice: number
  }>
}

export class CalculatorService {
  // Factores de corrección por ubicación y temporada
  private readonly SEASONAL_FACTOR = 1.2 // Venezuela tropical
  private readonly EFFICIENCY_LOSS = 0.85 // 85% eficiencia del sistema
  private readonly SOLAR_IRRADIATION = 5.5 // kWh/m²/día promedio Venezuela

  // Tarifas eléctricas promedio Venezuela (2024)
  private readonly ELECTRICITY_RATE = 0.08 // USD/kWh
  private readonly DIESEL_GENERATOR_COST = 0.25 // USD/kWh

  async calculateConsumption(appliances: ApplianceData[]): Promise<ConsumptionProfile> {
    let totalDailyKwh = 0
    let peakDemand = 0
    let criticalLoad = 0

    for (const appliance of appliances) {
      // Cálculo de consumo diario por electrodoméstico
      const dailyConsumption = this.calculateApplianceConsumption(appliance)
      totalDailyKwh += dailyConsumption

      // Demanda pico (potencia máxima)
      const applianceDemand = appliance.powerWatts * (appliance.quantity || 1) / 1000 // kW
      peakDemand += applianceDemand

      // Carga crítica (equipos esenciales)
      if (this.isCriticalAppliance(appliance.name)) {
        criticalLoad += applianceDemand
      }
    }

    // Consumo mensual con factores de corrección
    const monthlyKwh = totalDailyKwh * 30 * this.SEASONAL_FACTOR

    return {
      monthlyKwh: Math.round(monthlyKwh * 100) / 100,
      peakDemand: Math.round(peakDemand * 100) / 100,
      criticalLoad: Math.round(criticalLoad * 100) / 100,
      appliances
    }
  }

  async generateRecommendation(profile: ConsumptionProfile): Promise<CalculationResult> {
    // Sistema recomendado basado en consumo
    const recommendedCapacity = this.calculateRecommendedCapacity(profile.monthlyKwh)
    const batteryCapacity = this.calculateBatteryCapacity(profile.criticalLoad)

    // Análisis económico
    const currentMonthlyBill = profile.monthlyKwh * this.ELECTRICITY_RATE
    const systemCost = this.estimateSystemCost(recommendedCapacity, batteryCapacity)
    const annualGeneration = this.calculateAnnualGeneration(recommendedCapacity)
    const annualSavings = Math.min(annualGeneration * this.ELECTRICITY_RATE, currentMonthlyBill * 12)
    const paybackYears = systemCost / annualSavings

    // Productos recomendados
    const productsRecommended = await this.getRecommendedProducts(recommendedCapacity, batteryCapacity)

    return {
      monthlyKwh: profile.monthlyKwh,
      peakDemand: profile.peakDemand,
      criticalLoad: profile.criticalLoad,
      recommendedSystem: {
        capacityKw: recommendedCapacity,
        batteryCapacityKwh: batteryCapacity,
        estimatedCost: systemCost,
        paybackYears: Math.round(paybackYears * 100) / 100
      },
      economicAnalysis: {
        currentMonthlyBill: Math.round(currentMonthlyBill * 100) / 100,
        projectedMonthlyBill: Math.round((currentMonthlyBill - annualSavings/12) * 100) / 100,
        monthlySavings: Math.round((annualSavings/12) * 100) / 100,
        annualSavings: Math.round(annualSavings * 100) / 100,
        totalInvestment: systemCost,
        roi: Math.round((annualSavings / systemCost) * 100 * 100) / 100
      },
      productsRecommended
    }
  }

  private calculateApplianceConsumption(appliance: ApplianceData): number {
    const dutyCycle = appliance.dutyCycle || 1.0
    const dailyConsumption = (appliance.powerWatts * appliance.hoursPerDay * dutyCycle * appliance.quantity) / 1000
    return dailyConsumption
  }

  private isCriticalAppliance(name: string): boolean {
    const criticalAppliances = [
      'nevera', 'congelador', 'computadora', 'router', 'seguridad',
      'refrigerator', 'freezer', 'computer', 'modem', 'security'
    ]
    return criticalAppliances.some(critical =>
      name.toLowerCase().includes(critical)
    )
  }

  private calculateRecommendedCapacity(monthlyKwh: number): number {
    // Capacidad necesaria considerando eficiencia y irradiación solar
    const dailyKwh = monthlyKwh / 30
    const requiredCapacity = dailyKwh / (this.SOLAR_IRRADIATION * this.EFFICIENCY_LOSS)

    // Redondear a módulos de 0.5kW
    return Math.ceil(requiredCapacity * 2) / 2
  }

  private calculateBatteryCapacity(criticalLoad: number): number {
    // Capacidad de batería para 24 horas de respaldo
    const autonomyHours = 24
    const depthOfDischarge = 0.8 // 80% DOD recomendado
    const systemVoltage = 48 // V

    const batteryCapacity = (criticalLoad * autonomyHours) / (depthOfDischarge * systemVoltage)
    return Math.ceil(batteryCapacity * 100) / 100
  }

  private estimateSystemCost(capacityKw: number, batteryKwh: number): number {
    // Costos aproximados 2024 (USD)
    const panelCostPerKw = 800 // USD/kW
    const batteryCostPerKwh = 400 // USD/kWh
    const installationCost = 1000 // USD fijo
    const inverterCost = capacityKw * 200 // USD/kW

    const panelsCost = capacityKw * panelCostPerKw
    const batteryCost = batteryKwh * batteryCostPerKwh
    const totalCost = panelsCost + batteryCost + inverterCost + installationCost

    return Math.round(totalCost)
  }

  private calculateAnnualGeneration(capacityKw: number): number {
    // Generación anual considerando irradiación y eficiencia
    const dailyGeneration = capacityKw * this.SOLAR_IRRADIATION * this.EFFICIENCY_LOSS
    return dailyGeneration * 365
  }

  private async getRecommendedProducts(capacityKw: number, batteryKwh: number): Promise<Array<{
    id: string
    name: string
    category: string
    quantity: number
    unitPrice: number
  }>> {
    try {
      // Buscar productos en la base de datos
      const products = await prisma.producto.findMany({
        where: {
          category: {
            in: ['PANEL', 'BATERIA', 'INVERSOR']
          }
        },
        select: {
          id: true,
          name: true,
          category: true,
          priceUSD: true
        }
      })

      // Recomendar productos basados en capacidad necesaria
      const recommendations = []

      // Paneles solares
      const panelProducts = products.filter(p => p.category === 'PANEL')
      if (panelProducts.length > 0) {
        const panelsNeeded = Math.ceil(capacityKw / 0.5) // Asumiendo paneles de 500W
        recommendations.push({
          id: panelProducts[0].id,
          name: panelProducts[0].name,
          category: 'PANEL',
          quantity: panelsNeeded,
          unitPrice: panelProducts[0].priceUSD
        })
      }

      // Baterías
      const batteryProducts = products.filter(p => p.category === 'BATERIA')
      if (batteryProducts.length > 0) {
        const batteriesNeeded = Math.ceil(batteryKwh / 5) // Asumiendo baterías de 5kWh
        recommendations.push({
          id: batteryProducts[0].id,
          name: batteryProducts[0].name,
          category: 'BATERIA',
          quantity: batteriesNeeded,
          unitPrice: batteryProducts[0].priceUSD
        })
      }

      return recommendations
    } catch (error) {
      console.error('Error getting recommended products:', error)
      return []
    }
  }

  // Electrodomésticos comunes con consumos predefinidos
  getCommonAppliances(): ApplianceData[] {
    return [
      { name: 'Nevera', powerWatts: 150, hoursPerDay: 24, quantity: 1, dutyCycle: 0.6 },
      { name: 'Televisor LED 32"', powerWatts: 50, hoursPerDay: 6, quantity: 1 },
      { name: 'Aire acondicionado 12000 BTU', powerWatts: 1200, hoursPerDay: 8, quantity: 1, dutyCycle: 0.7 },
      { name: 'Lavadora', powerWatts: 500, hoursPerDay: 1, quantity: 1 },
      { name: 'Computadora de escritorio', powerWatts: 300, hoursPerDay: 8, quantity: 1 },
      { name: 'Router WiFi', powerWatts: 10, hoursPerDay: 24, quantity: 1 },
      { name: 'Bombillo LED', powerWatts: 9, hoursPerDay: 8, quantity: 10 },
      { name: 'Microondas', powerWatts: 1000, hoursPerDay: 0.5, quantity: 1 },
      { name: 'Licuadora', powerWatts: 500, hoursPerDay: 0.5, quantity: 1 },
      { name: 'Ventilador', powerWatts: 60, hoursPerDay: 12, quantity: 2 }
    ]
  }
}

export const calculatorService = new CalculatorService()