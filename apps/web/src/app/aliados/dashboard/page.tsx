'use client'

import { useState, useEffect } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@bel-energy/ui'
import {
  User,
  Briefcase,
  DollarSign,
  Star,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Bell,
  X
} from 'lucide-react'
import { useSocket } from '../../../hooks/useSocket'

interface AliadoProfile {
  id: string
  userId: string
  professionalType: string
  licenseNumber?: string
  certifications: any[]
  serviceAreas: string[]
  specializations: string[]
  rating: number
  projectsCompleted: number
  academyLevel: string
  commissionRate: number
  availabilityStatus: string
  portfolio?: any
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

interface Project {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  cliente: {
    user: {
      firstName: string
      lastName: string
    }
  }
  items: any[]
}

interface Commission {
  id: string
  amount: number
  percentage: number
  status: string
  paidAt?: string
  description: string
}

export default function AliadosDashboardPage() {
  const [aliado, setAliado] = useState<AliadoProfile | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [commissions, setCommissions] = useState<{
    commissions: Commission[]
    summary: {
      totalPending: number
      totalPaid: number
      totalEarned: number
    }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'commissions'>('overview')
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/aliados/login'
  }

  // Get user from localStorage
  const [user, setUser] = useState<any>(null)

  // Socket connection for real-time notifications
  const { isConnected, notifications, joinAllyRoom, requestNotificationPermission, markAsRead, clearNotifications } = useSocket(user?.id, user?.userType)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      window.location.href = '/aliados/login'
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.userType !== 'ALIADO') {
      window.location.href = '/'
      return
    }

    setUser(parsedUser)
    loadAliadoData(parsedUser.id)
  }, [])

  // Join ally room when aliado profile is loaded
  useEffect(() => {
    if (aliado?.id && isConnected) {
      joinAllyRoom(aliado.id)
    }
  }, [aliado?.id, isConnected, joinAllyRoom])

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [requestNotificationPermission])

  const loadAliadoData = async (aliadoId: string) => {
    try {
      setLoading(true)

      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }

      // Cargar perfil del aliado
      const profileResponse = await fetch(`/api/aliados/profile/${aliadoId}`, { headers })
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.success) {
          setAliado(profileData.data)
        }
      }

      // Cargar proyectos asignados
      const projectsResponse = await fetch(`/api/aliados/${aliadoId}/projects`, { headers })
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        if (projectsData.success) {
          setProjects(projectsData.data)
        }
      }

      // Cargar comisiones
      const commissionsResponse = await fetch(`/api/aliados/${aliadoId}/commissions`, { headers })
      if (commissionsResponse.ok) {
        const commissionsData = await commissionsResponse.json()
        if (commissionsData.success) {
          setCommissions(commissionsData.data)
        }
      }
    } catch (error) {
      console.error('Error loading aliado data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETADO': return 'text-green-600 bg-green-100'
      case 'EN_PROCESO': return 'text-blue-600 bg-blue-100'
      case 'APROBADO': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETADO': return 'Completado'
      case 'EN_PROCESO': return 'En Proceso'
      case 'APROBADO': return 'Aprobado'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Aliado
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* Notifications Button */}
              <div className="relative">
                <Button
                  onClick={() => setShowNotifications(!showNotifications)}
                  variant="outline"
                  className="relative text-gray-600 hover:text-gray-900"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </Button>

                {/* Connection Status Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} title={isConnected ? 'Conectado' : 'Desconectado'} />
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-gray-600 hover:text-gray-900"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>
          {aliado && (
            <p className="text-lg text-gray-600">
              Bienvenido, {aliado.user.firstName} {aliado.user.lastName}
            </p>
          )}

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute top-20 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                  <div className="flex items-center space-x-2">
                    {notifications.length > 0 && (
                      <Button
                        onClick={clearNotifications}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        Limpiar
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowNotifications(false)}
                      size="sm"
                      variant="ghost"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tienes notificaciones nuevas</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Proyectos
            </button>
            <button
              onClick={() => setActiveTab('commissions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'commissions'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Comisiones
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && aliado && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Profile Card */}
            <Card className="">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Perfil</CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{aliado.professionalType}</div>
                    <div className="text-sm text-gray-600">{aliado.academyLevel}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rating Card */}
            <Card className="">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Rating</CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <div>
                    <div className="text-2xl font-bold">{aliado.rating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">de 5.0</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Completed */}
            <Card className="">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Proyectos</CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <div className="text-2xl font-bold">{aliado.projectsCompleted}</div>
                    <div className="text-sm text-gray-600">completados</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Rate */}
            <Card className="">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Comisión</CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <div className="text-2xl font-bold">{aliado.commissionRate}%</div>
                    <div className="text-sm text-gray-600">por proyecto</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <Card className="">
              <CardHeader className="">
                <CardTitle className="">Proyectos Asignados</CardTitle>
                <CardDescription className="">
                  Lista de proyectos que tienes asignados actualmente
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tienes proyectos asignados actualmente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium">
                              Proyecto #{project.id.slice(-8)}
                            </div>
                            <div className="text-sm text-gray-600">
                              Cliente: {project.cliente?.user?.firstName || 'N/A'}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Monto:</span>
                            <span className="font-medium ml-2">${project.totalAmount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-medium ml-2">
                              {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end mt-4 space-x-2">
                          {project.status === 'APROBADO' && (
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Iniciar Proyecto
                            </Button>
                          )}
                          {project.status === 'EN_PROCESO' && (
                            <Button size="sm" variant="outline">
                              <Clock className="h-4 w-4 mr-1" />
                              Actualizar Progreso
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && commissions && (
          <div className="space-y-6">
            {/* Commission Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
                </CardHeader>
                <CardContent className="">
                  <div className="text-2xl font-bold text-yellow-600">
                    ${commissions.summary.totalPending.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Pagadas</CardTitle>
                </CardHeader>
                <CardContent className="">
                  <div className="text-2xl font-bold text-green-600">
                    ${commissions.summary.totalPaid.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Ganado</CardTitle>
                </CardHeader>
                <CardContent className="">
                  <div className="text-2xl font-bold text-blue-600">
                    ${commissions.summary.totalEarned.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commission List */}
            <Card className="">
              <CardHeader className="">
                <CardTitle className="">Historial de Comisiones</CardTitle>
                <CardDescription className="">
                  Lista completa de tus comisiones por proyecto
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                {commissions.commissions.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tienes comisiones registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {commissions.commissions.map((commission) => (
                      <div key={commission.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium">{commission.description}</div>
                            <div className="text-sm text-gray-600">
                              Comisión: {commission.percentage}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ${commission.amount.toFixed(2)}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              commission.status === 'PAID'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {commission.status === 'PAID' ? 'Pagada' : 'Pendiente'}
                            </div>
                          </div>
                        </div>

                        {commission.paidAt && (
                          <div className="text-sm text-gray-600">
                            Pagada el: {new Date(commission.paidAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader className="">
            <CardTitle className="">Acciones Rápidas</CardTitle>
            <CardDescription className="">
              Funciones comunes para gestionar tu perfil de aliado
            </CardDescription>
          </CardHeader>
          <CardContent className="">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4">
                <Award className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Certificaciones</div>
                  <div className="text-sm text-gray-600">Actualizar credenciales</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <MapPin className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Áreas de Servicio</div>
                  <div className="text-sm text-gray-600">Actualizar cobertura</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <Calendar className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Disponibilidad</div>
                  <div className="text-sm text-gray-600">Cambiar estado</div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4">
                <TrendingUp className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Estadísticas</div>
                  <div className="text-sm text-gray-600">Ver rendimiento</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}