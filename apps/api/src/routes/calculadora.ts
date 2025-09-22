import { Router } from 'express'
import { prisma } from '@bel-energy/database'

const router = Router()

interface CalculoData {
  datos: {
    ubicacion: string
    tipoVivienda: string
    numeroPersonas: number
    consumoDiario: number
    horasUsoDiario: number
    electrodomesticos: Array<{
      nombre: string
      potencia: number
      horasUso: number
      cantidad: number
    }>
    horasAutonomia: number
    frecuenciaApagones: string
    prioridadRespaldo: string
  }
  resultado: {
    energiaDiariaNecesaria: number
    energiaMensualNecesaria: number
    potenciaPico: number
    horasAutonomia: number
    panelesRecomendados: number
    bateriaRecomendada: number
    inversorRecomendado: string
    costoEstimado: number
    ahorroAnual: number
    roi: number
  }
  fecha: string
}

// POST /api/calculadora/guardar
router.post('/guardar', async (req, res) => {
  try {
    const { datos, resultado, fecha }: CalculoData = req.body

    // Validar datos requeridos
    if (!datos || !resultado) {
      return res.status(400).json({
        success: false,
        error: 'Datos de cálculo incompletos'
      })
    }

    // Crear registro en la base de datos
    const calculo = await prisma.calculoSolar.create({
      data: {
        ubicacion: datos.ubicacion,
        tipoEdificacion: datos.tipoVivienda,
        numeroPersonas: datos.numeroPersonas,
        consumoDiario: datos.consumoDiario,
        horasUsoDiario: datos.horasUsoDiario,
        electrodomesticos: JSON.stringify(datos.electrodomesticos),
        horasAutonomia: datos.horasAutonomia,
        frecuenciaApagones: datos.frecuenciaApagones,
        prioridadRespaldo: datos.prioridadRespaldo,
        energiaDiariaNecesaria: resultado.energiaDiariaNecesaria,
        energiaMensualNecesaria: resultado.energiaMensualNecesaria,
        potenciaPico: resultado.potenciaPico,
        panelesRecomendados: resultado.panelesRecomendados,
        bateriaRecomendada: resultado.bateriaRecomendada,
        inversorRecomendado: resultado.inversorRecomendado,
        costoEstimado: resultado.costoEstimado,
        fechaCalculo: new Date(fecha)
      }
    })

    res.json({
      success: true,
      data: {
        id: calculo.id,
        message: 'Cálculo guardado exitosamente'
      }
    })

  } catch (error) {
    console.error('Error al guardar cálculo:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

// GET /api/calculadora/historial
router.get('/historial', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query

    const calculos = await prisma.calculoSolar.findMany({
      orderBy: {
        fechaCalculo: 'desc'
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    })

    const total = await prisma.calculoSolar.count()

    res.json({
      success: true,
      data: {
        calculos: calculos.map(calculo => ({
          id: calculo.id,
          ubicacion: calculo.ubicacion,
          tipoEdificacion: calculo.tipoEdificacion,
          numeroPersonas: calculo.numeroPersonas,
          energiaDiariaNecesaria: calculo.energiaDiariaNecesaria,
          panelesRecomendados: calculo.panelesRecomendados,
          bateriaRecomendada: calculo.bateriaRecomendada,
          costoEstimado: calculo.costoEstimado,
          fechaCalculo: calculo.fechaCalculo
        })),
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    })

  } catch (error) {
    console.error('Error al obtener historial:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

// GET /api/calculadora/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const calculo = await prisma.calculoSolar.findUnique({
      where: { id }
    })

    if (!calculo) {
      return res.status(404).json({
        success: false,
        error: 'Cálculo no encontrado'
      })
    }

    res.json({
      success: true,
      data: {
        id: calculo.id,
        ubicacion: calculo.ubicacion,
        tipoEdificacion: calculo.tipoEdificacion,
        numeroPersonas: calculo.numeroPersonas,
        consumoDiario: calculo.consumoDiario,
        horasUsoDiario: calculo.horasUsoDiario,
        electrodomesticos: JSON.parse(calculo.electrodomesticos),
        horasAutonomia: calculo.horasAutonomia,
        frecuenciaApagones: calculo.frecuenciaApagones,
        prioridadRespaldo: calculo.prioridadRespaldo,
        energiaDiariaNecesaria: calculo.energiaDiariaNecesaria,
        energiaMensualNecesaria: calculo.energiaMensualNecesaria,
        potenciaPico: calculo.potenciaPico,
        panelesRecomendados: calculo.panelesRecomendados,
        bateriaRecomendada: calculo.bateriaRecomendada,
        inversorRecomendado: calculo.inversorRecomendado,
        costoEstimado: calculo.costoEstimado,
        fechaCalculo: calculo.fechaCalculo
      }
    })

  } catch (error) {
    console.error('Error al obtener cálculo:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

// GET /api/calculadora/estadisticas/resumen
router.get('/estadisticas/resumen', async (req, res) => {
  try {
    const totalCalculos = await prisma.calculoSolar.count()
    const promedioPaneles = await prisma.calculoSolar.aggregate({
      _avg: {
        panelesRecomendados: true
      }
    })
    const promedioCosto = await prisma.calculoSolar.aggregate({
      _avg: {
        costoEstimado: true
      }
    })

    // Ubicaciones más populares
    const ubicacionesPopulares = await prisma.calculoSolar.groupBy({
      by: ['ubicacion'],
      _count: {
        ubicacion: true
      },
      orderBy: {
        _count: {
          ubicacion: 'desc'
        }
      },
      take: 5
    })

    res.json({
      success: true,
      data: {
        totalCalculos,
        promedioPaneles: Math.round(promedioPaneles._avg.panelesRecomendados || 0),
        promedioCosto: Math.round(promedioCosto._avg.costoEstimado || 0),
        ubicacionesPopulares: ubicacionesPopulares.map(u => ({
          ubicacion: u.ubicacion,
          cantidad: u._count.ubicacion
        }))
      }
    })

  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

export default router