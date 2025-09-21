'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Users, Star, MapPin, DollarSign, Calendar, CheckCircle, AlertTriangle, Zap, TrendingUp, BarChart3 } from 'lucide-react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: 'outline' | 'default'
}

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'outline' | 'default'
}

interface InputProps {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  type?: string
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
)

const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
)

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, className = '', variant = 'default' }) => {
  const baseClasses = 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md'
  const variantClasses = variant === 'outline'
    ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
    : 'text-white bg-blue-600 hover:bg-blue-700'
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  )
}

const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default' }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const variantClasses = variant === 'outline'
    ? 'border border-gray-300 text-gray-700 bg-white'
    : 'bg-gray-100 text-gray-800'

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  )
}

const Input: React.FC<InputProps> = ({ placeholder, value, onChange, className = '', type = 'text' }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
  />
)

interface Project {
  id: string
  clienteId: string
  projectType: string
  status: string
  financingType: string
  totalAmount: number
  paymentStatus: string
  technicalRequirements: string
  createdAt: string
  cliente: {
    user: {
      firstName: string
      lastName: string
    }
  }
  location?: string
  specialization?: string
}

interface AliadoCandidate {
  id: string
  userId: string
  professionalType: string
  rating: number
  projectsCompleted: number
  academyLevel: string
  commissionRate: number
  serviceAreas: string[]
  specializations: string[]
  user: {
    firstName: string
    lastName: string
    email: string
  }
  score?: number
  factors?: {
    rating: number
    experience: number
    academy: number
    workload: number
    specialization: number
    priority: number
  }
}

interface AssignmentStats {
  totalProjects: number
  autoAssignedProjects: number
  manualAssignedProjects: number
  averageAssignmentScore: number
  successRate: number
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [candidates, setCandidates] = useState<AliadoCandidate[]>([])
  const [assignmentStats, setAssignmentStats] = useState<AssignmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCandidates, setShowCandidates] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [specializationFilter, setSpecializationFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')

  useEffect(() => {
    loadProjects()
    loadAssignmentStats()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, statusFilter, specializationFilter, locationFilter])

  const loadProjects = async () => {
    try {
      // For demo purposes, we'll create some sample projects
      const sampleProjects: Project[] = [
        {
          id: 'proj_001',
          clienteId: 'client_001',
          projectType: 'CON_INSTALACION',
          status: 'COTIZADO',
          financingType: 'CONTADO',
          totalAmount: 5000,
          paymentStatus: 'PENDIENTE',
          technicalRequirements: 'Instalación completa de sistema solar 5kW con batería',
          createdAt: new Date().toISOString(),
          cliente: {
            user: {
              firstName: 'Ana',
              lastName: 'López'
            }
          },
          location: 'Caracas',
          specialization: 'RESIDENCIAL'
        },
        {
          id: 'proj_002',
          clienteId: 'client_002',
          projectType: 'CON_INSTALACION',
          status: 'APROBADO',
          financingType: 'CUOTAS',
          totalAmount: 8000,
          paymentStatus: 'PARCIAL',
          technicalRequirements: 'Sistema comercial 8kW con inversor trifásico',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          cliente: {
            user: {
              firstName: 'Carlos',
              lastName: 'Martínez'
            }
          },
          location: 'Valencia',
          specialization: 'COMERCIAL'
        }
      ]
      setProjects(sampleProjects)
      setLoading(false)
    } catch (error) {
      console.error('Error loading projects:', error)
      setLoading(false)
    }
  }

  const loadAssignmentStats = async () => {
    try {
      const response = await fetch('/api/aliados/assignment-stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setAssignmentStats(data.data)
        }
      }
    } catch (error) {
      console.error('Error loading assignment stats:', error)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.cliente.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.cliente.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    if (specializationFilter !== 'all') {
      filtered = filtered.filter(project => project.specialization === specializationFilter)
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(project => project.location === locationFilter)
    }

    setFilteredProjects(filtered)
  }

  const loadCandidatesForProject = async (project: Project) => {
    try {
      // Simulate loading candidates with scores
      const sampleCandidates: AliadoCandidate[] = [
        {
          id: 'aliado_001',
          userId: 'user_001',
          professionalType: 'INGENIERO',
          rating: 4.8,
          projectsCompleted: 15,
          academyLevel: 'AVANZADO',
          commissionRate: 8.5,
          serviceAreas: ['Caracas', 'Maracaibo'],
          specializations: ['RESIDENCIAL', 'COMERCIAL'],
          user: {
            firstName: 'María',
            lastName: 'González',
            email: 'maria@belenergy.com'
          },
          score: 93.8,
          factors: {
            rating: 28.8,
            experience: 25,
            academy: 15,
            workload: 12,
            specialization: 10,
            priority: 3
          }
        },
        {
          id: 'aliado_002',
          userId: 'user_002',
          professionalType: 'CONSTRUCTOR',
          rating: 4.2,
          projectsCompleted: 8,
          academyLevel: 'INTERMEDIO',
          commissionRate: 12,
          serviceAreas: ['Valencia', 'Maracay'],
          specializations: ['COMERCIAL', 'INDUSTRIAL'],
          user: {
            firstName: 'Miguel',
            lastName: 'García',
            email: 'miguel@belenergy.com'
          },
          score: 76.4,
          factors: {
            rating: 25.2,
            experience: 16,
            academy: 10,
            workload: 15,
            specialization: 5,
            priority: 3
          }
        }
      ]
      setCandidates(sampleCandidates)
      setSelectedProject(project)
      setShowCandidates(true)
    } catch (error) {
      console.error('Error loading candidates:', error)
    }
  }

  const handleAutoAssign = async (project: Project) => {
    setAutoAssigning(true)
    try {
      const response = await fetch('/api/aliados/auto-assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          projectType: project.projectType,
          location: project.location,
          specialization: project.specialization,
          budget: project.totalAmount,
          priority: 'HIGH'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert(`✅ Proyecto asignado automáticamente a ${data.data.bestMatch.user.firstName} ${data.data.bestMatch.user.lastName}`)
          loadProjects() // Refresh projects
        }
      }
    } catch (error) {
      console.error('Error auto-assigning project:', error)
      alert('❌ Error al asignar proyecto automáticamente')
    } finally {
      setAutoAssigning(false)
    }
  }

  const handleManualAssign = async (project: Project, aliado: AliadoCandidate) => {
    try {
      const response = await fetch('/api/aliados/assign-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          aliadoId: aliado.id,
          priority: 'HIGH',
          notes: 'Asignación manual por administrador'
        })
      })

      if (response.ok) {
        alert(`✅ Proyecto asignado manualmente a ${aliado.user.firstName} ${aliado.user.lastName}`)
        loadProjects() // Refresh projects
        setShowCandidates(false)
      }
    } catch (error) {
      console.error('Error manually assigning project:', error)
      alert('❌ Error al asignar proyecto manualmente')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COTIZADO': return 'bg-yellow-100 text-yellow-800'
      case 'APROBADO': return 'bg-blue-100 text-blue-800'
      case 'EN_PROCESO': return 'bg-purple-100 text-purple-800'
      case 'COMPLETADO': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COTIZADO': return 'Cotizado'
      case 'APROBADO': return 'Aprobado'
      case 'EN_PROCESO': return 'En Proceso'
      case 'COMPLETADO': return 'Completado'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Proyectos</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Asignación automática y manual de proyectos a aliados
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={loadAssignmentStats}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Actualizar Estadísticas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Stats */}
      {assignmentStats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                    <p className="text-2xl font-bold text-gray-900">{assignmentStats.totalProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Zap className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Auto-Asignados</p>
                    <p className="text-2xl font-bold text-gray-900">{assignmentStats.autoAssignedProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Manuales</p>
                    <p className="text-2xl font-bold text-gray-900">{assignmentStats.manualAssignedProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Score Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{assignmentStats.averageAssignmentScore.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa Éxito</p>
                    <p className="text-2xl font-bold text-gray-900">{assignmentStats.successRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los Estados</option>
                <option value="COTIZADO">Cotizado</option>
                <option value="APROBADO">Aprobado</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="COMPLETADO">Completado</option>
              </select>

              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="RESIDENCIAL">Residencial</option>
                <option value="COMERCIAL">Comercial</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="AGRO">Agro</option>
              </select>

              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="Caracas">Caracas</option>
                <option value="Valencia">Valencia</option>
                <option value="Maracaibo">Maracaibo</option>
                <option value="Maracay">Maracay</option>
              </select>

              <Button onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setSpecializationFilter('all')
                setLocationFilter('all')
              }} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Proyecto #{project.id.slice(-6)}
                      </h3>
                      <Badge className={getStatusColor(project.status)}>
                        {getStatusText(project.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {project.cliente.user.firstName} {project.cliente.user.lastName}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {project.location || 'Sin ubicación'}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        ${project.totalAmount.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-700">
                      {project.technicalRequirements}
                    </p>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    {project.status === 'COTIZADO' && (
                      <>
                        <Button
                          onClick={() => handleAutoAssign(project)}
                          disabled={autoAssigning}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {autoAssigning ? 'Asignando...' : 'Auto-Asignar'}
                        </Button>

                        <button
                          onClick={() => loadCandidatesForProject(project)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Ver Candidatos
                        </button>
                      </>
                    )}

                    {project.status === 'APROBADO' && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Asignado
                      </Badge>
                    )}

                    {project.status === 'EN_PROCESO' && (
                      <Badge className="bg-purple-100 text-purple-800">
                        En Ejecución
                      </Badge>
                    )}

                    {project.status === 'COMPLETADO' && (
                      <Badge className="bg-green-100 text-green-800">
                        Completado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron proyectos
            </h3>
            <p className="text-gray-600">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Candidates Modal */}
      {showCandidates && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Candidatos para Proyecto #{selectedProject.id.slice(-6)}
                </h3>
                <button
                  onClick={() => setShowCandidates(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Selecciona un aliado para asignar manualmente este proyecto
              </p>

              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-semibold">
                              {candidate.user.firstName} {candidate.user.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {candidate.professionalType} • {candidate.academyLevel}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium">{candidate.rating}</span>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {candidate.projectsCompleted} proyectos
                          </span>
                        </div>

                        {candidate.score && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Score: {candidate.score.toFixed(1)}/100</strong>
                            {candidate.factors && (
                              <div className="text-xs mt-1">
                                Rating: +{candidate.factors.rating.toFixed(1)} |
                                Exp: +{candidate.factors.experience} |
                                Academia: +{candidate.factors.academy} |
                                Carga: +{candidate.factors.workload}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleManualAssign(selectedProject, candidate)}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Asignar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}