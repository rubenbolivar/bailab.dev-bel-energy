'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [activeSection, setActiveSection] = useState('hero')

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src="/images/Logo Bel Energy Full Color.png"
                alt="Bel Energy Logo"
                className="h-12 w-auto"
              />
            </div>

            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => scrollToSection('hero')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'hero' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection('ambiental')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'ambiental' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Sostenibilidad
              </button>
              <button
                onClick={() => scrollToSection('aliados')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'aliados' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Aliados
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className={`text-sm font-medium transition-colors ${
                  activeSection === 'faq' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                FAQ
              </button>
            </div>

            <div className="flex space-x-3">
              <Link
                href="/calculadora"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Calculadora Solar
              </Link>
              <Link
                href="/aliados/login"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                👥 Portal Aliados
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Energía Sostenible para un
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                {' '}Futuro Brillante
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Soluciones de respaldo eléctrico confiables con tecnología solar avanzada.
              Independencia energética para hogares, oficinas y comercios en Venezuela.
            </p>

            {/* Hero Image */}
            <div className="mb-12 relative">
              <div className="w-full max-w-4xl mx-auto relative">
                <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/hero.jpg"
                    alt="Sistema Solar Bel Energy - Parking Solar"
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.9)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl"></div>

                  {/* Overlay Text */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">
                      Sistema Solar Catatumbo Bel Energy
                    </h3>
                    <p className="text-sm md:text-base opacity-90">
                      Tecnología avanzada para máxima eficiencia energética
                    </p>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 hidden md:block">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-xl">⚡</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Hasta 72h</div>
                      <div className="text-sm text-gray-600">de autonomía</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 hidden md:block">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xl">🔋</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">$480 - $1,920</div>
                      <div className="text-sm text-gray-600">baterías al 60%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/calculadora"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                🚀 Calcular Mi Sistema Solar
              </Link>
              <button
                onClick={() => scrollToSection('faq')}
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                📞 Solicitar Visita Técnica
              </button>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Autonomía Total</h3>
                <p className="text-gray-600">2 a 72 horas de respaldo según tus necesidades</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="text-3xl mb-4">🔋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Baterías al 60%</h3>
                <p className="text-gray-600">$480 (2560Wh) - $1,920 (10240Wh)</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <div className="text-3xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tecnología Premium</h3>
                <p className="text-gray-600">Productos Catatumbo Bel Energy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compromiso Ambiental Section */}
      <section id="ambiental" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                🌱 Nuestro Compromiso Ambiental
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                En Bel Energy, creemos que la sostenibilidad es el camino hacia un futuro mejor.
                Nuestras soluciones solares contribuyen activamente a reducir las emisiones de carbono.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Energía Renovable para Venezuela
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold">🌞</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Reducción de Emisiones</h4>
                      <p className="text-gray-600">Cada sistema solar instalado reduce significativamente las emisiones de CO2</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">⚡</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Independencia Energética</h4>
                      <p className="text-gray-600">Libertad total de las fallas del suministro eléctrico tradicional</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-yellow-600 font-bold">💰</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Ahorro Económico</h4>
                      <p className="text-gray-600">Reducción de costos operativos a largo plazo con energía gratuita del sol</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">🛡️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Resiliencia ante Apagones</h4>
                      <p className="text-gray-600">Protección total contra interrupciones frecuentes del servicio eléctrico</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Impacto Ambiental</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                    <span className="text-gray-700">CO2 Reducido por Sistema</span>
                    <span className="font-bold text-green-600">2.5 Ton/año</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                    <span className="text-gray-700">Energía Solar Generada</span>
                    <span className="font-bold text-blue-600">5-15 kWh/día</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                    <span className="text-gray-700">Vida Útil del Sistema</span>
                    <span className="font-bold text-purple-600">25+ años</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                    <span className="text-gray-700">Eficiencia del Sistema</span>
                    <span className="font-bold text-orange-600">85%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/calculadora"
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                🌱 Contribuye al Medio Ambiente - Calcula Tu Sistema
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Aliados Section */}
      <section id="aliados" className="py-20 px-4 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                🤝 Aliados Comerciales y Profesionales
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Únete a nuestra red de aliados estratégicos y forma parte de la transformación
                energética de Venezuela con tecnología de vanguardia.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Oportunidades de Colaboración
                </h3>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xl">🏗️</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Ingenieros y Arquitectos</h4>
                        <p className="text-gray-600 text-sm">Integra soluciones solares en proyectos de edificación</p>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Acceso a herramientas de diseño, capacitación técnica especializada y
                      soporte para integrar sistemas solares en proyectos residenciales y comerciales.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xl">🔧</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Constructores e Instaladores</h4>
                        <p className="text-gray-600 text-sm">Especialización en instalación de sistemas solares</p>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Capacitación certificada, herramientas especializadas y oportunidades
                      de proyectos con garantía de calidad y soporte técnico continuo.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-xl">🏪</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Distribuidores y Mayoristas</h4>
                        <p className="text-gray-600 text-sm">Red de distribución autorizada</p>
                      </div>
                    </div>
                    <p className="text-gray-700">
                      Acceso exclusivo a productos Catatumbo Bel Energy, precios preferenciales,
                      marketing y soporte para expandir tu portafolio de soluciones energéticas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Beneficios de Aliarse con Bel Energy</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Tecnología avanzada y productos premium</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Capacitación y certificación técnica</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Soporte técnico especializado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Materiales de marketing y promoción</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Oportunidades de proyectos garantizados</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <span className="text-gray-700">Comisiones competitivas y beneficios económicos</span>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
                  <h5 className="font-semibold text-gray-900 mb-2">¿Interesado en ser aliado?</h5>
                  <p className="text-gray-700 text-sm mb-4">
                    Contacta con nuestro equipo comercial para conocer los requisitos
                    y beneficios de formar parte de nuestra red de aliados estratégicos.
                  </p>
                  <Link
                    href="/aliados/register"
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
                  >
                    📝 Registrarse como Aliado
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                ❓ Preguntas Frecuentes
              </h2>
              <p className="text-xl text-gray-600">
                Resolvemos tus dudas sobre nuestros sistemas solares
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Qué opciones de autonomía ofrecen sus sistemas solares?
                </h3>
                <p className="text-gray-700">
                  Ofrecemos 7 opciones de autonomía: 2, 4, 6, 12, 24, 48 o 72 horas de respaldo continuo.
                  Puedes seleccionar la que mejor se adapte a tus necesidades específicas, desde respaldo
                  básico para emergencias hasta autonomía máxima para situaciones extremas.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Cómo funciona la calculadora solar?
                </h3>
                <p className="text-gray-700">
                  Nuestra calculadora avanzada analiza tu consumo eléctrico, ubicación geográfica,
                  equipos electrodomésticos y necesidades de respaldo. Utiliza algoritmos precisos
                  basados en irradiación solar regional para recomendar el sistema óptimo con
                  productos Catatumbo Bel Energy.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Cuáles son los precios de las baterías?
                </h3>
                <p className="text-gray-700">
                  Ofrecemos precios reducidos al 60%: $480 USD por batería de 2560Wh (CB-LP1624100)
                  y $1,920 USD por batería de 10240Wh (CB-LP1648200). Estos precios corresponden
                  al Plan Compra Directa con descuentos especiales de Bel Energy.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Es compatible con equipos de 220V?
                </h3>
                <p className="text-gray-700">
                  Sí, tenemos detección automática de equipos que requieren 220V (aires acondicionados,
                  hornos, cocinas eléctricas). Si detectamos estos equipos, el sistema automáticamente
                  selecciona el inversor CB-6000W que maneja voltajes de 110/120-220/240 VAC,
                  garantizando funcionamiento correcto de todos tus equipos.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Qué equipos están disponibles en la calculadora?
                </h3>
                <p className="text-gray-700">
                  Contamos con más de 25 equipos organizados por tipo de edificación:
                  residencial (refrigerador, aires acondicionados, lavadora), oficina (computadoras,
                  impresoras, sistemas de punto de venta) y comercial (equipos industriales,
                  congeladores, máquinas de helados).
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Cuál es la garantía de los productos?
                </h3>
                <p className="text-gray-700">
                  Todos nuestros productos Catatumbo Bel Energy tienen 5 años de garantía completa.
                  Incluye cobertura total contra defectos de fabricación, soporte técnico especializado
                  y reemplazo de componentes cuando sea necesario.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Ofrecen financiamiento o planes de pago?
                </h3>
                <p className="text-gray-700">
                  Sí, ofrecemos planes de financiamiento flexibles con BelCash, nuestro sistema
                  propio de evaluación crediticia. Dependiendo de tu perfil, puedes acceder a
                  4, 6, 8 o hasta 12 cuotas con tasas preferenciales del 0% al 15%.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  ¿Cuánto tiempo toma la instalación?
                </h3>
                <p className="text-gray-700">
                  El tiempo de instalación varía según la complejidad del sistema: sistemas residenciales
                  básicos (1-2 días), sistemas comerciales medianos (3-5 días), sistemas industriales
                  completos (1-2 semanas). Incluye configuración, pruebas y capacitación del usuario.
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                ¿No encuentras la respuesta que buscas?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/calculadora"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  🚀 Probar Calculadora Solar
                </Link>
                <button className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  📞 Contactar Soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BE</span>
                </div>
                <span className="text-xl font-bold">Bel Energy</span>
              </div>
              <p className="text-gray-400 text-sm">
                Energía sostenible para un futuro brillante en Venezuela.
                Versión v1.2.5 - Octubre 2024
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Productos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Paneles Solares</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Baterías LiFePO4</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Inversores</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sistemas Completos</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Instalación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mantenimiento</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Capacitación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Soporte Técnico</a></li>
                <li><Link href="/aliados/login" className="hover:text-white transition-colors">👥 Portal Aliados</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📧 info@belenergy.com</li>
                <li>📱 +58 212 123 4567</li>
                <li>📍 Caracas, Venezuela</li>
                <li>🕒 Lun-Vie: 8AM-6PM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Bel Energy. Todos los derechos reservados. | Tecnología Catatumbo Bel Energy</p>
          </div>
        </div>
      </footer>
    </div>
  )
}