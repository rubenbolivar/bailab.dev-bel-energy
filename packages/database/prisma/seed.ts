import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Crear usuarios de prueba
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Usuario administrador
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@belenergy.com' },
    update: {},
    create: {
      email: 'admin@belenergy.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'BelEnergy',
      userType: 'ADMIN',
      status: 'ACTIVO',
      belScore: 1000,
      referralCode: 'ADMIN001',
      location: {
        state: 'Miranda',
        city: 'Caracas',
        address: 'Centro Empresarial'
      },
      preferences: {
        language: 'es',
        currency: 'USD',
        notifications: true
      }
    }
  })

  // Usuario cliente
  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@belenergy.com' },
    update: {},
    create: {
      email: 'cliente@belenergy.com',
      password: hashedPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      userType: 'CLIENTE',
      status: 'ACTIVO',
      belScore: 750,
      referralCode: 'CLIENTE001',
      location: {
        state: 'Miranda',
        city: 'Caracas',
        address: 'Urbanización Los Palos Grandes'
      },
      preferences: {
        language: 'es',
        currency: 'USD',
        notifications: true
      }
    }
  })

  // Usuario aliado
  const aliadoUser = await prisma.user.upsert({
    where: { email: 'aliado@belenergy.com' },
    update: {},
    create: {
      email: 'aliado@belenergy.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'González',
      userType: 'ALIADO',
      status: 'ACTIVO',
      belScore: 850,
      referralCode: 'ALIADO001',
      location: {
        state: 'Miranda',
        city: 'Caracas',
        address: 'Zona Industrial'
      },
      preferences: {
        language: 'es',
        currency: 'USD',
        notifications: true
      }
    }
  })

  // Crear cliente
  const cliente = await prisma.cliente.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      customerType: 'RESIDENCIAL',
      consumptionProfile: {
        monthlyKwh: 450,
        peakHours: ['18:00-22:00'],
        appliances: [
          { name: 'Aire acondicionado', power: 1500, hoursPerDay: 8 },
          { name: 'Nevera', power: 200, hoursPerDay: 24 },
          { name: 'TV LED', power: 100, hoursPerDay: 6 }
        ]
      },
      financingProfile: {
        incomeRange: '3000-5000',
        employmentType: 'Empleado',
        creditHistory: 'Buena'
      }
    }
  })

  // Crear aliado
  const aliado = await prisma.aliado.upsert({
    where: { userId: aliadoUser.id },
    update: {},
    create: {
      userId: aliadoUser.id,
      professionalType: 'INGENIERO',
      licenseNumber: 'ING-2024-001',
      certifications: [
        {
          name: 'Certificación Solar Básica',
          issuer: 'Bel Energy Academy',
          date: '2024-01-15',
          validUntil: '2026-01-15'
        }
      ],
      serviceAreas: ['Miranda', 'Caracas', 'La Guaira'],
      specializations: ['RESIDENCIAL', 'COMERCIAL'],
      rating: 4.8,
      projectsCompleted: 15,
      academyLevel: 'AVANZADO',
      commissionRate: 8.5,
      availabilityStatus: 'DISPONIBLE',
      portfolio: {
        description: 'Especialista en instalaciones solares residenciales y comerciales',
        images: ['portfolio1.jpg', 'portfolio2.jpg'],
        certifications: ['cert1.pdf', 'cert2.pdf']
      }
    }
  })

  // Crear productos de prueba
  const products = [
    {
      sku: 'PANEL-400W',
      name: 'Panel Solar 400W Monocristalino',
      category: 'PANEL' as const,
      description: 'Panel solar de alta eficiencia con tecnología monocristalina',
      priceUSD: 180,
      stockQuantity: 50,
      specifications: {
        power: '400W',
        efficiency: '22.5%',
        dimensions: '1722x1134x30mm',
        weight: '21.5kg',
        warranty: '25 años'
      },
      targetAudience: ['RESIDENCIAL', 'COMERCIAL'],
      compatibleProducts: [],
      installationRequired: true,
      warrantyYears: 25,
      minOrderQuantity: 1,
      diyDifficulty: 'INTERMEDIO' as const
    },
    {
      sku: 'INVERSOR-5KW',
      name: 'Inversor Solar 5KW Híbrido',
      category: 'INVERSOR' as const,
      description: 'Inversor híbrido con batería integrada para sistemas solares',
      priceUSD: 1200,
      stockQuantity: 20,
      specifications: {
        power: '5000W',
        efficiency: '97.5%',
        phases: 'Monofásico',
        mppt: 2,
        warranty: '10 años'
      },
      targetAudience: ['RESIDENCIAL', 'COMERCIAL'],
      compatibleProducts: ['PANEL-400W'],
      installationRequired: true,
      warrantyYears: 10,
      minOrderQuantity: 1,
      diyDifficulty: 'EXPERTO' as const
    },
    {
      sku: 'BATERIA-5KWH',
      name: 'Batería de Litio 5KWh',
      category: 'BATERIA' as const,
      description: 'Batería de litio de alta capacidad para almacenamiento de energía',
      priceUSD: 800,
      stockQuantity: 15,
      specifications: {
        capacity: '5KWh',
        voltage: '48V',
        cycles: '6000',
        warranty: '10 años'
      },
      targetAudience: ['RESIDENCIAL', 'COMERCIAL'],
      compatibleProducts: ['INVERSOR-5KW'],
      installationRequired: true,
      warrantyYears: 10,
      minOrderQuantity: 1,
      diyDifficulty: 'EXPERTO' as const
    }
  ]

  for (const productData of products) {
    await prisma.producto.upsert({
      where: { sku: productData.sku },
      update: {},
      create: {
        ...productData,
        priceWithFinancing: productData.priceUSD,
        images: [],
        targetAudience: productData.targetAudience || [],
        compatibleProducts: productData.compatibleProducts || []
      }
    })
  }

  // Crear proyecto de prueba
  const proyecto = await prisma.proyecto.upsert({
    where: { id: 'proyecto_demo_001' },
    update: {},
    create: {
      id: 'proyecto_demo_001',
      clienteId: cliente.id,
      aliladoId: aliado.id,
      projectType: 'CON_INSTALACION',
      status: 'EN_PROCESO',
      financingType: 'CUOTAS',
      totalAmount: 5000,
      paymentStatus: 'PARCIAL',
      installationDate: new Date('2024-02-15'),
      technicalRequirements: 'Instalación completa de sistema solar 5KW con batería',
      notes: 'Cliente solicita instalación prioritaria',
      documents: ['cotizacion.pdf', 'planos.pdf']
    }
  })

  // Crear items del proyecto
  const projectItems = [
    { productoId: 'PANEL-400W', quantity: 12, unitPrice: 180 },
    { productoId: 'INVERSOR-5KW', quantity: 1, unitPrice: 1200 },
    { productoId: 'BATERIA-5KWH', quantity: 1, unitPrice: 800 }
  ]

  for (const item of projectItems) {
    const producto = await prisma.producto.findUnique({
      where: { sku: item.productoId }
    })
    if (producto) {
      await prisma.proyectoItem.create({
        data: {
          proyectoId: proyecto.id,
          productoId: producto.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }
      })
    }
  }

  // Crear transacción de prueba
  await prisma.transaccion.upsert({
    where: { id: 'transaccion_demo_001' },
    update: {},
    create: {
      id: 'transaccion_demo_001',
      userId: clientUser.id,
      proyectoId: proyecto.id,
      gatewayTransactionId: 'stripe_demo_001',
      paymentGateway: 'Stripe',
      amount: 2500,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethod: 'card',
      fees: 25,
      metadata: {
        description: 'Pago inicial proyecto solar',
        installment: 1,
        totalInstallments: 4
      }
    }
  })

  // Crear contenido de academia
  const academyContent = [
    {
      id: 'academy_basico_001',
      title: 'Introducción a la Energía Solar',
      category: 'BASICO' as const,
      contentType: 'VIDEO' as const,
      level: 'PRINCIPIANTE' as const,
      durationMinutes: 45,
      prerequisites: [],
      contentUrl: 'https://example.com/video1.mp4',
      description: 'Aprende los fundamentos de la energía solar y sus beneficios',
      tags: ['solar', 'energía', 'introducción'],
      isPremium: false,
      certificationPoints: 10
    },
    {
      id: 'academy_instalacion_001',
      title: 'Instalación Básica de Paneles Solares',
      category: 'INSTALACION' as const,
      contentType: 'VIDEO' as const,
      level: 'INTERMEDIO' as const,
      durationMinutes: 90,
      prerequisites: ['academy_basico_001'],
      contentUrl: 'https://example.com/video2.mp4',
      description: 'Guía paso a paso para la instalación de paneles solares',
      tags: ['instalación', 'paneles', 'seguridad'],
      isPremium: true,
      certificationPoints: 25
    }
  ]

  for (const content of academyContent) {
    await prisma.academiaContenido.upsert({
      where: { id: content.id },
      update: {},
      create: content
    })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('📊 Created test data:')
  console.log(`   👤 ${await prisma.user.count()} users`)
  console.log(`   🏢 ${await prisma.cliente.count()} clients`)
  console.log(`   👷 ${await prisma.aliado.count()} aliados`)
  console.log(`   📦 ${await prisma.producto.count()} products`)
  console.log(`   🏗️ ${await prisma.proyecto.count()} projects`)
  console.log(`   💳 ${await prisma.transaccion.count()} transactions`)
  console.log(`   🎓 ${await prisma.academiaContenido.count()} academy contents`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })