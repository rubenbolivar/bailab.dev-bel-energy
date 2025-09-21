'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@bel-energy/ui'
import { CreditCard, TrendingUp, Shield, Star, DollarSign, Calendar } from 'lucide-react'

interface BelScoreResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  factors: {
    belEnergyHistory: number
    demographicData: number
    businessReferences: number
    digitalBehavior: number
  }
  recommendations: string[]
}

interface FinancingOption {
  installments: number
  interestRate: number
  monthlyPayment: number
  totalAmount: number
  totalInterest: number
  description: string
}

interface FinancingSimulation {
  principal: number
  belScore: number
  availableOptions: FinancingOption[]
  recommendedOption: FinancingOption
  riskAssessment: string
}

export default function BelCashPage() {
  const [userId, setUserId] = useState('')
  const [principal, setPrincipal] = useState('')
  const [belScore, setBelScore] = useState<BelScoreResult | null>(null)
  const [simulation, setSimulation] = useState<FinancingSimulation | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'score' | 'simulate'>('score')

  const calculateBelScore = async () => {
    if (!userId) {
      alert('Por favor ingrese un ID de usuario')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/belcash/score/${userId}`)
      const data = await response.json()

      if (data.success) {
        setBelScore(data.data)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const simulateFinancing = async () => {
    if (!userId || !principal) {
      alert('Por favor complete todos los campos')
      return
    }

    const amount = parseFloat(principal)
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingrese un monto válido')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/belcash/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          principal: amount,
          userId
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSimulation(data.data)
        setActiveTab('simulate')
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100'
      case 'B': return 'text-blue-600 bg-blue-100'
      case 'C': return 'text-yellow-600 bg-yellow-100'
      case 'D': return 'text-orange-600 bg-orange-100'
      case 'F': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getGradeDescription = (grade: string) => {
    switch (grade) {
      case 'A': return 'Excelente - Financiamiento preferencial'
      case 'B': return 'Muy bueno - Buenas condiciones'
      case 'C': return 'Bueno - Condiciones estándar'
      case 'D': return 'Regular - Condiciones limitadas'
      case 'F': return 'Bajo - Solo contado'
      default: return 'Sin calificar'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <CreditCard className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">
              BelCash - Sistema de Financiamiento
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Evalúa tu BelScore y descubre opciones de financiamiento personalizadas
          </p>
        </div>

        {/* User ID Input */}
        <Card className="mb-8">
          <CardHeader className="">
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              Ingresa tu ID de usuario para acceder a tu perfil BelCash
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="ID de usuario"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={calculateBelScore} disabled={loading}>
                {loading ? 'Cargando...' : 'Calcular BelScore'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* BelScore Results */}
        {belScore && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Tu BelScore
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Score Overview */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-2xl font-bold mb-4 ${getGradeColor(belScore.grade)}`}>
                    {belScore.score}
                  </div>
                  <div className="text-lg font-medium mb-2">BelScore</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(belScore.grade)}`}>
                    Grado {belScore.grade}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {getGradeDescription(belScore.grade)}
                  </div>
                </div>

                {/* Factors Breakdown */}
                <div>
                  <h3 className="font-medium mb-4">Desglose de Factores</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Historial Bel Energy</span>
                      <span className="font-medium">{belScore.factors.belEnergyHistory}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Datos Demográficos</span>
                      <span className="font-medium">{belScore.factors.demographicData}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Referencias Comerciales</span>
                      <span className="font-medium">{belScore.factors.businessReferences}/100</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Comportamiento Digital</span>
                      <span className="font-medium">{belScore.factors.digitalBehavior}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {belScore.recommendations.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Recomendaciones para mejorar tu BelScore:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {belScore.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Financing Simulation */}
        {belScore && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Simulador de Financiamiento
              </CardTitle>
              <CardDescription>
                Simula diferentes opciones de financiamiento basadas en tu BelScore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <Input
                  type="number"
                  placeholder="Monto a financiar (USD)"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                />
                <Button onClick={simulateFinancing} disabled={loading} className="w-full">
                  {loading ? 'Simulando...' : 'Simular Financiamiento'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simulation Results */}
        {simulation && (
          <div className="space-y-6">
            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Evaluación de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-blue-800">{simulation.riskAssessment}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financing Options */}
            <Card>
              <CardHeader>
                <CardTitle>Opciones de Financiamiento Disponibles</CardTitle>
                <CardDescription>
                  Basado en tu BelScore de {simulation.belScore} puntos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {simulation.availableOptions.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${
                        option.installments === simulation.recommendedOption.installments
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium flex items-center">
                            {option.installments} cuotas
                            {option.installments === simulation.recommendedOption.installments && (
                              <span className="ml-2 text-green-600 text-sm">Recomendado</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            ${option.monthlyPayment.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">por mes</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Interés</div>
                          <div className="font-medium">{(option.interestRate * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Total</div>
                          <div className="font-medium">${option.totalAmount.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Intereses</div>
                          <div className="font-medium">${option.totalInterest.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Resumen de la Simulación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${simulation.principal.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Monto solicitado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${simulation.recommendedOption.monthlyPayment.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Cuota mensual recomendada</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      ${simulation.recommendedOption.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total a pagar</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setSimulation(null)}>
                Nueva Simulación
              </Button>
              <Button>
                Solicitar Financiamiento
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}