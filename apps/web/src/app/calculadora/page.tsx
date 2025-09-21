'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CalculatorData {
  // Paso 1: Información básica
  ubicacion: string
  tipoEdificacion: 'casa' | 'apartamento' | 'oficina' | 'local_comercial'
  numeroPersonas: number

  // Paso 2: Consumo eléctrico
  consumoDiario: number
  horasUsoDiario: number
  electrodomesticos: Electrodomestico[]

  // Paso 3: Necesidades de respaldo
  horasAutonomia: number
  frecuenciaApagones: 'diario' | 'semanal' | 'mensual' | 'raro'
  prioridadRespaldo: 'bajo' | 'medio' | 'alto' | 'critico'
}

interface Electrodomestico {
  nombre: string
  potencia: number
  horasUso: number
  cantidad: number
}

interface ResultadoCalculo {
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
  productosDetallados?: {
    inversor: any
    bateria: any
    panel: any
    cantidades: {
      paneles: number
      baterias: number
    }
  }
}

const UBICACIONES_VENEZUELA = [
  { id: 'caracas', nombre: 'Caracas', irradiacion: 5.2, factor: 1.0 },
  { id: 'maracaibo', nombre: 'Maracaibo', irradiacion: 5.8, factor: 1.1 },
  { id: 'valencia', nombre: 'Valencia', irradiacion: 4.9, factor: 0.95 },
  { id: 'barquisimeto', nombre: 'Barquisimeto', irradiacion: 5.4, factor: 1.05 },
  { id: 'maracay', nombre: 'Maracay', irradiacion: 4.7, factor: 0.9 },
  { id: 'ciudad_bolivar', nombre: 'Ciudad Bolívar', irradiacion: 6.0, factor: 1.15 },
  { id: 'san_cristobal', nombre: 'San Cristóbal', irradiacion: 4.4, factor: 0.85 },
  { id: 'barcelona', nombre: 'Barcelona', irradiacion: 5.2, factor: 1.0 }
]

// Función para detectar equipos que requieren 220V
const equipos220V = [
  'Aire Acondicionado',
  'Horno Eléctrico',
  'Horno Industrial',
  'Plancha Industrial',
  'Cafetera Industrial',
  'Batidora Industrial',
  'Licuadora Industrial',
  'Exprimidor Industrial',
  'Máquina de Helados',
  'Congelador Comercial',
  'Aire Acondicionado Split',
  'Aire Acondicionado Comercial',
  'Aire Acondicionado Central'
]

const tieneEquipos220V = (electrodomesticos: any[]) => {
  return electrodomesticos.some(electro =>
    equipos220V.some(equipo220V =>
      electro.nombre.toLowerCase().includes(equipo220V.toLowerCase())
    )
  )
}

// Productos Bel Energy Catatumbo - Información real del catálogo
const PRODUCTOS_BEL_ENERGY = {
  inversores: [
    {
      modelo: 'CATATUMBO CB-3000W',
      potencia: 3000, // W
      precioCompraDirecta: 1481, // USD
      precioGeneral: 2221, // USD
      maxPaneles: 2500, // W
      bateriaRecomendada: 'CB-LP1624100',
      voltajeSalida: '110/120 VAC',
      arranqueMotor: '1.5 HP',
      descripcion: 'Inversor 3000W con cargador 40A, onda sinusoidal pura - 110/120V'
    },
    {
      modelo: 'CATATUMBO CB-6000W',
      potencia: 6000, // W
      precioCompraDirecta: 2700, // USD
      precioGeneral: 4050, // USD
      maxPaneles: 5000, // W
      bateriaRecomendada: 'CB-LP1648200',
      voltajeSalida: '110/120-220/240 VAC',
      arranqueMotor: '3 HP',
      descripcion: 'Inversor 6000W con cargador 40A, onda sinusoidal pura - 110/120/220/240V'
    }
  ],
  baterias: [
    {
      modelo: 'CB-LP1624100',
      capacidad: 2560, // Wh
      voltaje: 25.6, // V
      precioCompraDirecta: Math.round(800 * 0.6), // 60% = 480 USD
      descripcion: 'Batería LiFePO4 2560Wh, 6000 ciclos de vida'
    },
    {
      modelo: 'CB-LP1648200',
      capacidad: 10240, // Wh
      voltaje: 51.2, // V
      precioCompraDirecta: Math.round(3200 * 0.6), // 60% = 1920 USD
      descripcion: 'Batería LiFePO4 10240Wh, 6000 ciclos de vida'
    }
  ],
  paneles: [
    {
      modelo: 'CATATUMBO CB-41V 620W',
      potencia: 620, // W
      precioCompraDirecta: 198, // USD
      precioGeneral: 297, // USD
      descripcion: 'Panel solar monocristalino 620W de alta eficiencia'
    }
  ]
}

// Función para obtener electrodomésticos según tipo de edificación
const getElectrodomesticosPorTipo = (tipoEdificacion: string) => {
  const equiposResidenciales = [
    { nombre: 'Refrigerador', potencia: 150, horasUso: 24, categoria: 'refrigeracion' },
    { nombre: 'Aire Acondicionado 12000 BTU', potencia: 1200, horasUso: 8, categoria: 'climatizacion' },
    { nombre: 'Aire Acondicionado 18000 BTU', potencia: 1800, horasUso: 8, categoria: 'climatizacion' },
    { nombre: 'Aire Acondicionado 24000 BTU', potencia: 2400, horasUso: 8, categoria: 'climatizacion' },
    { nombre: 'Televisor LED 32"', potencia: 50, horasUso: 6, categoria: 'entretenimiento' },
    { nombre: 'Televisor LED 55"', potencia: 80, horasUso: 6, categoria: 'entretenimiento' },
    { nombre: 'Computadora de Escritorio', potencia: 300, horasUso: 8, categoria: 'computacion' },
    { nombre: 'Laptop', potencia: 65, horasUso: 8, categoria: 'computacion' },
    { nombre: 'Lavadora', potencia: 500, horasUso: 1, categoria: 'lavanderia' },
    { nombre: 'Secadora', potencia: 2500, horasUso: 1, categoria: 'lavanderia' },
    { nombre: 'Microondas', potencia: 1000, horasUso: 0.5, categoria: 'cocina' },
    { nombre: 'Horno Eléctrico', potencia: 1500, horasUso: 1, categoria: 'cocina' },
    { nombre: 'Ventilador de Pie', potencia: 75, horasUso: 12, categoria: 'climatizacion' },
    { nombre: 'Aspiradora', potencia: 1200, horasUso: 0.5, categoria: 'limpieza' },
    { nombre: 'Bombillo LED', potencia: 10, horasUso: 12, categoria: 'iluminacion' },
    { nombre: 'Bombillo LED Inteligente', potencia: 12, horasUso: 12, categoria: 'iluminacion' }
  ]

  const equiposOficina = [
    { nombre: 'Aire Acondicionado Split 12000 BTU', potencia: 1200, horasUso: 8, categoria: 'climatizacion' },
    { nombre: 'Aire Acondicionado Split 18000 BTU', potencia: 1800, horasUso: 8, categoria: 'climatizacion' },
    { nombre: 'Aire Acondicionado Split 24000 BTU', potencia: 2400, horasUso: 8, categoria: 'climatizacion' },
    { nombre: 'Computadora de Escritorio', potencia: 300, horasUso: 8, categoria: 'computacion' },
    { nombre: 'Laptop', potencia: 65, horasUso: 8, categoria: 'computacion' },
    { nombre: 'Impresora', potencia: 500, horasUso: 2, categoria: 'oficina' },
    { nombre: 'Fotocopiadora', potencia: 1500, horasUso: 4, categoria: 'oficina' },
    { nombre: 'Router WiFi', potencia: 15, horasUso: 24, categoria: 'redes' },
    { nombre: 'Servidor', potencia: 500, horasUso: 24, categoria: 'servidores' },
    { nombre: 'Cafetera Eléctrica', potencia: 800, horasUso: 4, categoria: 'cocina' },
    { nombre: 'Microondas', potencia: 1000, horasUso: 1, categoria: 'cocina' },
    { nombre: 'Refrigerador Ejecutivo', potencia: 200, horasUso: 24, categoria: 'refrigeracion' },
    { nombre: 'Iluminación LED', potencia: 30, horasUso: 10, categoria: 'iluminacion' },
    { nombre: 'Ventilador de Techo', potencia: 100, horasUso: 8, categoria: 'climatizacion' },
    { nombre: 'Aire Acondicionado Central', potencia: 3000, horasUso: 8, categoria: 'climatizacion' }
  ]

  const equiposComerciales = [
    { nombre: 'Aire Acondicionado Comercial 18000 BTU', potencia: 1800, horasUso: 12, categoria: 'climatizacion' },
    { nombre: 'Aire Acondicionado Comercial 24000 BTU', potencia: 2400, horasUso: 12, categoria: 'climatizacion' },
    { nombre: 'Aire Acondicionado Comercial 36000 BTU', potencia: 3600, horasUso: 12, categoria: 'climatizacion' },
    { nombre: 'Refrigerador Comercial', potencia: 800, horasUso: 24, categoria: 'refrigeracion' },
    { nombre: 'Congelador Comercial', potencia: 1000, horasUso: 24, categoria: 'refrigeracion' },
    { nombre: 'Horno Industrial', potencia: 3000, horasUso: 6, categoria: 'cocina' },
    { nombre: 'Plancha Industrial', potencia: 2000, horasUso: 4, categoria: 'cocina' },
    { nombre: 'Licuadora Industrial', potencia: 800, horasUso: 2, categoria: 'cocina' },
    { nombre: 'Cafetera Industrial', potencia: 1500, horasUso: 8, categoria: 'cocina' },
    { nombre: 'Computadora POS', potencia: 150, horasUso: 12, categoria: 'punto_venta' },
    { nombre: 'Sistema de Punto de Venta', potencia: 300, horasUso: 12, categoria: 'punto_venta' },
    { nombre: 'Iluminación LED Comercial', potencia: 50, horasUso: 12, categoria: 'iluminacion' },
    { nombre: 'Ventilador Industrial', potencia: 200, horasUso: 12, categoria: 'climatizacion' },
    { nombre: 'Máquina de Helados', potencia: 600, horasUso: 8, categoria: 'equipos_especiales' },
    { nombre: 'Exprimidor Industrial', potencia: 400, horasUso: 4, categoria: 'cocina' },
    { nombre: 'Batidora Industrial', potencia: 800, horasUso: 3, categoria: 'cocina' }
  ]

  switch (tipoEdificacion) {
    case 'casa':
    case 'apartamento':
      return equiposResidenciales
    case 'oficina':
      return equiposOficina
    case 'local_comercial':
      return equiposComerciales
    default:
      return equiposResidenciales
  }
}

export default function CalculadoraPage() {
  const router = useRouter()
  const [pasoActual, setPasoActual] = useState(1)
  const [datos, setDatos] = useState<CalculatorData>({
    ubicacion: '',
    tipoEdificacion: 'casa',
    numeroPersonas: 1,
    consumoDiario: 0,
    horasUsoDiario: 0,
    electrodomesticos: [],
    horasAutonomia: 24,
    frecuenciaApagones: 'semanal',
    prioridadRespaldo: 'medio'
  })
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null)
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const actualizarDatos = (campo: keyof CalculatorData, valor: any) => {
    setDatos(prev => ({ ...prev, [campo]: valor }))
  }

  const agregarElectrodomestico = (electrodomestico: Electrodomestico) => {
    setDatos(prev => ({
      ...prev,
      electrodomesticos: [...prev.electrodomesticos, electrodomestico]
    }))
  }

  const removerElectrodomestico = (index: number) => {
    setDatos(prev => ({
      ...prev,
      electrodomesticos: prev.electrodomesticos.filter((_, i) => i !== index)
    }))
  }

  const calcularConsumoTotal = () => {
    return datos.electrodomesticos.reduce((total, item) => {
      return total + (item.potencia * item.horasUso * item.cantidad)
    }, 0)
  }

  const calcularSistema = async () => {
    setCargando(true)

    try {
      const ubicacionData = UBICACIONES_VENEZUELA.find(u => u.id === datos.ubicacion)
      const factorUbicacion = ubicacionData?.factor || 1.0
      const irradiacionDiaria = ubicacionData?.irradiacion || 5.2

      const consumoDiario = calcularConsumoTotal()
      const energiaMensual = consumoDiario * 30 * factorUbicacion

      // Cálculos basados en productos Bel Energy Catatumbo
      const eficienciaSistema = 0.85 // 85% eficiencia total del sistema
      const energiaDiariaNecesaria = consumoDiario / eficienciaSistema
      const energiaDiariaConAutonomia = energiaDiariaNecesaria * (datos.horasAutonomia / irradiacionDiaria)

      const potenciaPico = Math.max(...datos.electrodomesticos.map(e => e.potencia * e.cantidad))

      // Verificar si hay equipos que requieren 220V
      const requiere220V = tieneEquipos220V(datos.electrodomesticos)

      // Seleccionar inversor apropiado
      let inversorSeleccionado
      if (requiere220V) {
        // Si hay equipos de 220V, FORZAR el uso del CB-6000W
        inversorSeleccionado = PRODUCTOS_BEL_ENERGY.inversores[1] // CB-6000W
      } else if (potenciaPico <= 2500) {
        inversorSeleccionado = PRODUCTOS_BEL_ENERGY.inversores[0] // CB-3000W
      } else {
        inversorSeleccionado = PRODUCTOS_BEL_ENERGY.inversores[1] // CB-6000W
      }

      // Calcular paneles necesarios (620W cada uno)
      const panel620W = PRODUCTOS_BEL_ENERGY.paneles[0]
      let panelesRecomendados = Math.ceil(energiaDiariaConAutonomia / panel620W.potencia)

      // Asegurar mínimo de paneles para un sistema viable
      panelesRecomendados = Math.max(panelesRecomendados, 2)

      // Limitar por capacidad máxima del inversor
      const maxPanelesPorInversor = Math.floor(inversorSeleccionado.maxPaneles / panel620W.potencia)
      panelesRecomendados = Math.min(panelesRecomendados, maxPanelesPorInversor)

      // Seleccionar batería apropiada
      let bateriaSeleccionada
      const energiaBateriaNecesaria = energiaDiariaNecesaria * datos.horasAutonomia

      if (energiaBateriaNecesaria <= 2560) {
        bateriaSeleccionada = PRODUCTOS_BEL_ENERGY.baterias[0] // CB-LP1624100
      } else {
        bateriaSeleccionada = PRODUCTOS_BEL_ENERGY.baterias[1] // CB-LP1648200
      }

      // Calcular baterías necesarias
      let bateriasRecomendadas = Math.ceil(energiaBateriaNecesaria / bateriaSeleccionada.capacidad)
      bateriasRecomendadas = Math.max(bateriasRecomendadas, 1)

      // Calcular costo total usando precios de compra directa
      const costoPaneles = panelesRecomendados * panel620W.precioCompraDirecta
      const costoBaterias = bateriasRecomendadas * bateriaSeleccionada.precioCompraDirecta
      const costoInversor = inversorSeleccionado.precioCompraDirecta
      const costoInstalacion = 300 // Costo aproximado de instalación

      const costoEstimado = costoPaneles + costoBaterias + costoInversor + costoInstalacion

      const resultado: ResultadoCalculo = {
        energiaDiariaNecesaria,
        energiaMensualNecesaria: energiaMensual,
        potenciaPico,
        horasAutonomia: datos.horasAutonomia,
        panelesRecomendados,
        bateriaRecomendada: bateriasRecomendadas,
        inversorRecomendado: inversorSeleccionado.modelo,
        costoEstimado,
        ahorroAnual: 0, // No enfatizar ahorros económicos en Venezuela
        roi: 0,
        productosDetallados: {
          inversor: inversorSeleccionado,
          bateria: bateriaSeleccionada,
          panel: panel620W,
          cantidades: {
            paneles: panelesRecomendados,
            baterias: bateriasRecomendadas
          }
        }
      }

      setResultado(resultado)

      // Guardar cálculo en backend
      await guardarCalculo(resultado)

    } catch (error) {
      console.error('Error al calcular:', error)
    } finally {
      setCargando(false)
    }
  }

  const guardarCalculo = async (resultado: ResultadoCalculo) => {
    setGuardando(true)
    try {
      const response = await fetch('http://localhost:3001/api/calculadora/guardar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          datos,
          resultado,
          fecha: new Date().toISOString()
        })
      })

      if (!response.ok) {
        console.warn('No se pudo guardar el cálculo en el backend')
      }
    } catch (error) {
      console.warn('Error al guardar cálculo:', error)
    } finally {
      setGuardando(false)
    }
  }

  const siguientePaso = () => {
    if (pasoActual < 4) {
      setPasoActual(pasoActual + 1)
    }
  }

  const pasoAnterior = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1)
    }
  }

  const reiniciarCalculadora = () => {
    setDatos({
      ubicacion: '',
      tipoEdificacion: 'casa',
      numeroPersonas: 1,
      consumoDiario: 0,
      horasUsoDiario: 0,
      electrodomesticos: [],
      horasAutonomia: 24,
      frecuenciaApagones: 'semanal',
      prioridadRespaldo: 'medio'
    })
    setResultado(null)
    setPasoActual(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏠 Calculadora Solar Bel Energy
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Sistema personalizado con productos Catatumbo - Tu independencia energética en Venezuela
          </p>

          {/* Progress Bar */}
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${pasoActual >= 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                📍 Ubicación
              </span>
              <span className={`text-sm ${pasoActual >= 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                ⚡ Consumo
              </span>
              <span className={`text-sm ${pasoActual >= 3 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                🔋 Respaldo
              </span>
              <span className={`text-sm ${pasoActual >= 4 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                📊 Resultados
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(pasoActual / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Calculator Content */}
        <div className="max-w-4xl mx-auto">
          {pasoActual === 1 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📍 Paso 1: Información Básica
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación en Venezuela
                  </label>
                  <select
                    value={datos.ubicacion}
                    onChange={(e) => actualizarDatos('ubicacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar ubicación</option>
                    {UBICACIONES_VENEZUELA.map((ubicacion) => (
                      <option key={ubicacion.id} value={ubicacion.id}>
                        {ubicacion.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Edificación
                  </label>
                  <select
                    value={datos.tipoEdificacion}
                    onChange={(e) => actualizarDatos('tipoEdificacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="oficina">Oficina</option>
                    <option value="local_comercial">Local Comercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Personas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={datos.numeroPersonas}
                    onChange={(e) => actualizarDatos('numeroPersonas', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={siguientePaso}
                  disabled={!datos.ubicacion}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {pasoActual === 2 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                ⚡ Paso 2: Consumo Eléctrico
              </h2>

              {/* Electrodomésticos predefinidos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Agregar Electrodomésticos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {getElectrodomesticosPorTipo(datos.tipoEdificacion).map((electro, index) => (
                    <button
                      key={index}
                      onClick={() => agregarElectrodomestico({ ...electro, cantidad: 1 })}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                    >
                      <div className="font-medium">{electro.nombre}</div>
                      <div className="text-xs text-gray-600">{electro.potencia}W</div>
                      <div className="text-xs text-blue-600 mt-1">{electro.categoria}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de electrodomésticos agregados */}
              {datos.electrodomesticos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Electrodomésticos Agregados
                  </h3>
                  <div className="space-y-3">
                    {datos.electrodomesticos.map((electro, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{electro.nombre}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {electro.potencia}W × {electro.horasUso}h × {electro.cantidad} = {(electro.potencia * electro.horasUso * electro.cantidad).toFixed(0)}Wh/día
                          </span>
                        </div>
                        <button
                          onClick={() => removerElectrodomestico(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-900">
                      Consumo Total: {calcularConsumoTotal().toFixed(0)} Wh/día
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  onClick={pasoAnterior}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={siguientePaso}
                  disabled={datos.electrodomesticos.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {pasoActual === 3 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🔋 Paso 3: Necesidades de Respaldo
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas de Autonomía Deseadas
                  </label>
                  <select
                    value={datos.horasAutonomia}
                    onChange={(e) => actualizarDatos('horasAutonomia', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={2}>2 horas (respaldo básico para emergencias)</option>
                    <option value={4}>4 horas (respaldo estándar para situaciones moderadas)</option>
                    <option value={6}>6 horas (respaldo extendido para cobertura prolongada)</option>
                    <option value={12}>12 horas (medio día de autonomía completa)</option>
                    <option value={24}>24 horas (día completo de respaldo total)</option>
                    <option value={48}>48 horas (dos días de autonomía garantizada)</option>
                    <option value={72}>72 horas (tres días de respaldo ininterrumpido)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Apagones en tu zona
                  </label>
                  <select
                    value={datos.frecuenciaApagones}
                    onChange={(e) => actualizarDatos('frecuenciaApagones', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="raro">Raro (menos de 1 vez al mes)</option>
                    <option value="mensual">Mensual (1-4 veces al mes)</option>
                    <option value="semanal">Semanal (1-7 veces a la semana)</option>
                    <option value="diario">Diario (varios apagones al día)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad de Respaldo Eléctrico
                  </label>
                  <select
                    value={datos.prioridadRespaldo}
                    onChange={(e) => actualizarDatos('prioridadRespaldo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bajo">Bajo (solo iluminación y dispositivos básicos)</option>
                    <option value="medio">Medio (electrodomésticos esenciales)</option>
                    <option value="alto">Alto (todos los electrodomésticos)</option>
                    <option value="critico">Crítico (sistemas médicos o negocios)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={pasoAnterior}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => {
                    siguientePaso()
                    calcularSistema()
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Calcular Sistema →
                </button>
              </div>
            </div>
          )}

          {pasoActual === 4 && (
            <div className="space-y-6">
              {cargando ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Calculando tu sistema solar personalizado...</p>
                </div>
              ) : resultado ? (
                <>
                  {/* Resultados principales */}
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      🎯 Tu Sistema Solar Personalizado
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {resultado.energiaDiariaNecesaria.toFixed(0)}Wh
                        </div>
                        <div className="text-sm text-blue-700">Energía Diaria Necesaria</div>
                      </div>

                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl mb-2">🔋</div>
                        <div className="text-2xl font-bold text-green-900">
                          {resultado.horasAutonomia}h
                        </div>
                        <div className="text-sm text-green-700">Horas de Autonomía</div>
                      </div>

                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-3xl mb-2">☀️</div>
                        <div className="text-2xl font-bold text-yellow-900">
                          {resultado.panelesRecomendados} × 620W
                        </div>
                        <div className="text-sm text-yellow-700">Paneles Catatumbo</div>
                      </div>

                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl mb-2">💰</div>
                        <div className="text-2xl font-bold text-purple-900">
                          ${resultado.costoEstimado.toLocaleString()}
                        </div>
                        <div className="text-sm text-purple-700">Plan Compra Directa</div>
                      </div>
                    </div>

                    {/* Beneficios venezolanos */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        🇻🇪 Beneficios en Venezuela
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">🔌</div>
                          <div>
                            <div className="font-semibold text-gray-900">Independencia Eléctrica</div>
                            <div className="text-sm text-gray-600">
                              {resultado.horasAutonomia === 2 ? 'Respaldo básico para emergencias cortas' :
                               resultado.horasAutonomia === 4 ? 'Cobertura estándar para la mayoría de situaciones' :
                               resultado.horasAutonomia === 6 ? 'Respaldo extendido para situaciones prolongadas' :
                               resultado.horasAutonomia === 12 ? 'Medio día de autonomía garantizada' :
                               resultado.horasAutonomia === 24 ? 'Cobertura completa de 24 horas' :
                               resultado.horasAutonomia === 48 ? 'Dos días de respaldo ininterrumpido' :
                               'Tres días de autonomía máxima'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">⚡</div>
                          <div>
                            <div className="font-semibold text-gray-900">Energía 24/7</div>
                            <div className="text-sm text-gray-600">
                              {resultado.horasAutonomia >= 72 ? 'Tres días de autonomía máxima para emergencias extremas' :
                               resultado.horasAutonomia >= 48 ? 'Dos días de respaldo ininterrumpido' :
                               resultado.horasAutonomia >= 24 ? 'Cobertura completa de 24 horas' :
                               resultado.horasAutonomia >= 12 ? 'Medio día de autonomía garantizada' :
                               resultado.horasAutonomia >= 6 ? 'Respaldo extendido para situaciones prolongadas' :
                               resultado.horasAutonomia >= 4 ? 'Cobertura estándar para la mayoría de situaciones' :
                               'Respaldo básico para emergencias cortas'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">🏠</div>
                          <div>
                            <div className="font-semibold text-gray-900">Estabilidad Doméstica</div>
                            <div className="text-sm text-gray-600">
                              Funcionamiento continuo de nevera, iluminación y electrodomésticos esenciales
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">🌅</div>
                          <div>
                            <div className="font-semibold text-gray-900">Energía Limpia</div>
                            <div className="text-sm text-gray-600">
                              Contribución al medio ambiente con energía 100% renovable
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Productos Bel Energy Recomendados */}
                    <div className="border-t pt-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        🏆 Productos Bel Energy Recomendados
                      </h3>

                      {resultado.productosDetallados && (
                        <div className="space-y-4">
                          {/* Inversor */}
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-blue-900 text-lg">
                                🔌 {resultado.productosDetallados.inversor.modelo}
                              </h4>
                              <span className="text-2xl font-bold text-blue-900">
                                ${resultado.productosDetallados.inversor.precioCompraDirecta.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-blue-800 text-sm mb-2">
                              {resultado.productosDetallados.inversor.descripcion}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700">
                              <div>• Potencia: {resultado.productosDetallados.inversor.potencia}W</div>
                              <div>• Voltaje: {resultado.productosDetallados.inversor.voltajeSalida}</div>
                              <div>• Arranque: {resultado.productosDetallados.inversor.arranqueMotor}</div>
                              <div>• Max Paneles: {resultado.productosDetallados.inversor.maxPaneles}W</div>
                            </div>
                            {tieneEquipos220V(datos.electrodomesticos) && (
                              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                                ⚠️ <strong>Equipo requerido:</strong> Este inversor es necesario para alimentar equipos de 220V
                                (aires acondicionados, hornos, cocinas eléctricas)
                              </div>
                            )}
                          </div>

                          {/* Paneles Solares */}
                          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-yellow-900 text-lg">
                                ☀️ {resultado.productosDetallados.panel.modelo}
                              </h4>
                              <span className="text-2xl font-bold text-yellow-900">
                                ${resultado.productosDetallados.panel.precioCompraDirecta.toLocaleString()} × {resultado.productosDetallados.cantidades.paneles}
                              </span>
                            </div>
                            <p className="text-yellow-800 text-sm mb-2">
                              {resultado.productosDetallados.panel.descripcion}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-yellow-700">
                              <div>• Potencia: {resultado.productosDetallados.panel.potencia}W</div>
                              <div>• Eficiencia: Alta</div>
                              <div>• Garantía: 5 años</div>
                              <div>• Total: {(resultado.productosDetallados.panel.potencia * resultado.productosDetallados.cantidades.paneles).toLocaleString()}W</div>
                            </div>
                          </div>

                          {/* Baterías */}
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-green-900 text-lg">
                                🔋 {resultado.productosDetallados.bateria.modelo}
                              </h4>
                              <span className="text-2xl font-bold text-green-900">
                                ${resultado.productosDetallados.bateria.precioCompraDirecta.toLocaleString()} × {resultado.productosDetallados.cantidades.baterias}
                              </span>
                            </div>
                            <p className="text-green-800 text-sm mb-2">
                              {resultado.productosDetallados.bateria.descripcion}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-green-700">
                              <div>• Capacidad: {resultado.productosDetallados.bateria.capacidad.toLocaleString()}Wh</div>
                              <div>• Voltaje: {resultado.productosDetallados.bateria.voltaje}V</div>
                              <div>• Ciclos: 6000</div>
                              <div>• Total: {(resultado.productosDetallados.bateria.capacidad * resultado.productosDetallados.cantidades.baterias).toLocaleString()}Wh</div>
                            </div>
                          </div>

                          {/* Resumen de Costos */}
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                            <h4 className="font-bold text-purple-900 text-lg mb-3">
                              💰 Desglose de Costos (Plan Compra Directa)
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Inversor {resultado.productosDetallados.inversor.modelo}:</span>
                                <span className="font-semibold">${resultado.productosDetallados.inversor.precioCompraDirecta.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{resultado.productosDetallados.cantidades.paneles} Paneles {resultado.productosDetallados.panel.modelo}:</span>
                                <span className="font-semibold">${(resultado.productosDetallados.panel.precioCompraDirecta * resultado.productosDetallados.cantidades.paneles).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{resultado.productosDetallados.cantidades.baterias} Batería(s) {resultado.productosDetallados.bateria.modelo}:</span>
                                <span className="font-semibold">${(resultado.productosDetallados.bateria.precioCompraDirecta * resultado.productosDetallados.cantidades.baterias).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Instalación y montaje:</span>
                                <span className="font-semibold">$300</span>
                              </div>
                              <hr className="border-purple-300" />
                              <div className="flex justify-between text-lg font-bold">
                                <span>Total Sistema:</span>
                                <span className="text-purple-900">${resultado.costoEstimado.toLocaleString()}</span>
                              </div>
                              <div className="text-xs text-purple-700 mt-2">
                                * Precios en USD sin IVA/IGTF • Plan de 4 pagos disponibles
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Especificaciones técnicas */}
                      <div className="mt-6 grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">⚙️ Rendimiento del Sistema</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Energía diaria necesaria: {resultado.energiaDiariaNecesaria.toFixed(0)}Wh</li>
                            <li>• Energía mensual estimada: {resultado.energiaMensualNecesaria.toFixed(0)}Wh</li>
                            <li>• Potencia pico requerida: {resultado.potenciaPico}W</li>
                            <li>• Eficiencia total del sistema: 85%</li>
                            <li>• Factor irradiación {UBICACIONES_VENEZUELA.find(u => u.id === datos.ubicacion)?.nombre}: {UBICACIONES_VENEZUELA.find(u => u.id === datos.ubicacion)?.factor}x</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">🛡️ Autonomía y Voltaje</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li>• Horas de autonomía: {resultado.horasAutonomia} horas</li>
                            <li>• Protección contra apagones: {datos.frecuenciaApagones === 'diario' ? 'Diaria' : datos.frecuenciaApagones === 'semanal' ? 'Semanal' : 'Mensual'}</li>
                            <li>• Prioridad de respaldo: {datos.prioridadRespaldo === 'critico' ? 'Crítica' : datos.prioridadRespaldo === 'alto' ? 'Alta' : datos.prioridadRespaldo === 'medio' ? 'Media' : 'Baja'}</li>
                            <li>• Voltaje de salida: {resultado.productosDetallados?.inversor.voltajeSalida}</li>
                            <li>• Garantía productos: 5 años</li>
                            <li>• Soporte técnico: Incluido</li>
                          </ul>
                          {tieneEquipos220V(datos.electrodomesticos) && (
                            <div className="mt-3 p-3 bg-orange-100 border border-orange-300 rounded text-sm text-orange-800">
                              <strong>⚡ Importante:</strong> Se detectaron equipos que requieren 220V.
                              El sistema CATATUMBO CB-6000W es obligatorio para garantizar
                              el funcionamiento correcto de aires acondicionados, hornos y cocinas eléctricas.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de simulación */}
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      📊 Simulación de Rendimiento
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">☀️</div>
                          <div>
                            <div className="font-semibold text-green-900">Día Solesado</div>
                            <div className="text-sm text-green-700">100% de capacidad generada</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-900">
                            {resultado.energiaDiariaNecesaria.toFixed(0)}Wh
                          </div>
                          <div className="text-sm text-green-700">Generación</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">⛅</div>
                          <div>
                            <div className="font-semibold text-yellow-900">Día Nublado</div>
                            <div className="text-sm text-yellow-700">70% de capacidad generada</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-900">
                            {(resultado.energiaDiariaNecesaria * 0.7).toFixed(0)}Wh
                          </div>
                          <div className="text-sm text-yellow-700">Generación</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🌧️</div>
                          <div>
                            <div className="font-semibold text-red-900">Día de Lluvia</div>
                            <div className="text-sm text-red-700">30% de capacidad generada</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-900">
                            {(resultado.energiaDiariaNecesaria * 0.3).toFixed(0)}Wh
                          </div>
                          <div className="text-sm text-red-700">Generación</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">🔋</div>
                        <div>
                          <div className="font-semibold text-blue-900">Sistema de Baterías</div>
                          <div className="text-sm text-blue-700">
                            Tu sistema mantendrá {resultado.horasAutonomia} horas de autonomía completa,
                            incluso en días nublados o durante apagones prolongados.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones finales */}
                  <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        ¿Listo para dar el siguiente paso?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Contacta con nuestros expertos para una evaluación gratuita y cotización detallada
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                          onClick={() => router.push('/contacto')}
                          className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          📞 Contactar Experto
                        </button>
                        <button
                          onClick={reiniciarCalculadora}
                          className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                          🔄 Nueva Consulta
                        </button>
                        <button
                          onClick={() => router.push('/productos')}
                          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          🛒 Ver Productos
                        </button>
                      </div>

                      {guardando && (
                        <div className="mt-4 text-sm text-gray-600">
                          💾 Guardando tu cálculo...
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="text-red-500 mb-4">⚠️ Error al calcular</div>
                  <p className="text-gray-600 mb-4">No se pudieron generar los resultados</p>
                  <button
                    onClick={() => {
                      setPasoActual(3)
                      calcularSistema()
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Reintentar Cálculo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}