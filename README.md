# 🚀 Bel Energy Portal

**Plataforma digital completa para transformación energética con paneles solares en Venezuela**

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0.0-green)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC)](https://tailwindcss.com/)

## 📋 Descripción

Bel Energy Portal es una plataforma digital integral que conecta clientes, aliados profesionales y la empresa Bel Energy en un ecosistema completo de transformación energética. La plataforma incluye herramientas de cálculo, simulación financiera, sistema de aliados certificados, academia digital y procesamiento de pagos multi-gateway adaptado específicamente para Venezuela.

## ✨ Características Principales

### 🏢 Portal Público
- **🏠 Homepage Moderno y Atractivo** - Experiencia de usuario excepcional con navegación SPA
  - **Sección Hero impactante**: Título atractivo con gradientes y CTAs prominentes
  - **Compromiso Ambiental**: Información detallada sobre sostenibilidad y reducción de CO2
  - **Aliados Comerciales**: Oportunidades para ingenieros, constructores y distribuidores
  - **FAQ Completo**: 8 preguntas frecuentes con respuestas detalladas
  - **Navegación fluida**: Secciones ancladas sin recargas de página
  - **Diseño responsivo**: Optimizado para móviles y tablets
  - **CTAs estratégicos**: Botones de conversión en posiciones clave

- **🏠 Calculadora Solar Avanzada** - Sistema personalizado con productos Catatumbo Bel Energy para Venezuela
  - **Equipos por tipo de edificación**: Residencial, Oficina, Local Comercial
  - **Más de 25 equipos disponibles**: Aires acondicionados, electrodomésticos, equipos comerciales
  - **Lógica de 220V**: Detección automática y selección obligatoria de CB-6000W
  - **Baterías al 60%**: Precios reducidos - $480 (2560Wh), $1,920 (10240Wh)
  - **Opciones de autonomía**: 2, 4, 6, 12, 24, 48 o 72 horas de respaldo según necesidades
  - **Especificaciones técnicas**: Voltaje de salida, capacidad de arranque motor
  - **Precios oficiales**: Plan Compra Directa con descuentos Bel Energy
  - **Cálculos precisos**: Basados en irradiación solar regional
- **Simulador BelCash** - Sistema de financiamiento propio con BelScore
- **Catálogo de Productos** - Filtros avanzados y comparación
- **Academia Digital** - Contenido educativo y certificaciones
- **Sistema de Aliados** - Red de profesionales certificados

### 📊 Dashboard Administrativo ✅ **IMPLEMENTADO**
- **Analytics en Tiempo Real** - Métricas clave conectadas a BD
- **Gestión de Usuarios** - CRUD completo con API REST
- **Control de Proyectos** - Estados, asignaciones y seguimiento
- **Sistema de Pagos** - Multi-gateway con transacciones reales
- **Reportes y Estadísticas** - Dashboard visual con métricas
- **Interfaz Moderna** - Sidebar navigation y responsive design

### 💳 Sistema de Pagos
- **Multi-Gateway** - Stripe, Banesco, Binance Pay
- **Criptomonedas** - USDT y otras criptos
- **Reembolsos Automáticos** - Gestión de devoluciones
- **Historial Completo** - Seguimiento de transacciones

### 🔔 Notificaciones Inteligentes
- **Email Transaccional** - Confirmaciones y recordatorios
- **SMS** - Alertas importantes
- **WhatsApp Business** - Comunicación directa
- **Notificaciones In-App** - Panel de usuario

## 🏗️ Arquitectura

```
bel-energy-portal/
├── apps/
│   ├── web/          # Next.js 14 (Portal público + Admin)
│   ├── admin/        # Dashboard admin (Próximamente)
│   ├── api/          # Express API (Backend)
│   └── mobile/       # React Native (Próximamente)
├── packages/
│   ├── database/     # Prisma + PostgreSQL
│   ├── ui/           # Componentes compartidos (Próximamente)
│   ├── shared/       # Utilidades compartidas (Próximamente)
│   └── email-templates/ # Templates de email (Próximamente)
└── tools/            # Scripts y configuraciones
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 20.0.0 o superior
- **PostgreSQL** 15.0 o superior
- **npm** 9.0.0 o superior

### Instalación Local

1. **Clonar el repositorio**
    ```bash
    git clone https://github.com/rubenbolivar/bailab.dev-bel-energy.git
    cd bel-energy-portal
    ```

2. **Instalar dependencias**
    ```bash
    npm install
    ```

3. **Configurar base de datos**
    ```bash
    # Crear base de datos PostgreSQL
    createdb belenergydb

    # Crear usuario
    psql -d belenergydb -c "CREATE USER belenergy WITH PASSWORD 'belenergy';"
    psql -d belenergydb -c "GRANT ALL PRIVILEGES ON DATABASE belenergydb TO belenergy;"
    ```

4. **Configurar variables de entorno**

    Copiar archivos de ejemplo:
    ```bash
    cp packages/database/.env.example packages/database/.env
    cp apps/api/.env.example apps/api/.env
    cp apps/web/.env.local.example apps/web/.env.local
    ```

5. **Inicializar base de datos**
    ```bash
    cd packages/database
    npm run db:push
    npm run db:seed
    ```

6. **Iniciar servicios**
    ```bash
    # Terminal 1: Backend API
    cd apps/api && npm run dev

    # Terminal 2: Frontend Web
    cd apps/web && npm run dev
    ```

7. **Acceder a la aplicación**
    - **Frontend**: http://localhost:3000
    - **Backend API**: http://localhost:3001
    - **Dashboard Admin**: http://localhost:3000/admin/dashboard ✅ **FUNCIONANDO**
    - **Aliados Dashboard**: http://localhost:3000/aliados/dashboard ✅ **FUNCIONANDO**
    - **API Health Check**: http://localhost:3001/api/health
    - **Homepage**: http://localhost:3000 (Portal público)

### 🚀 Despliegue en Producción

#### Opción 1: Despliegue Automático (Recomendado)
```bash
# Configurar SSH keys
./setup_vps.sh

# Ejecutar despliegue completo
./deploy.sh
```

#### Opción 2: Configuración Manual
Ejecuta los comandos del script `deploy_manual.sh` en tu VPS:

```bash
# Conectar al VPS
ssh root@203.161.62.94

# Ejecutar el script manual
./deploy_manual.sh
```

#### URLs de Producción
- **Frontend**: https://bel-energy.bailab.dev
- **API**: https://bel-energy.bailab.dev/api
- **Admin Dashboard**: https://bel-energy.bailab.dev/admin/dashboard
- **Aliados Dashboard**: https://bel-energy.bailab.dev/aliados/dashboard

#### Gestión de Producción
```bash
# Verificar servicios
pm2 status
pm2 logs

# Reiniciar servicios
pm2 restart all

# Ver logs de Nginx
systemctl status nginx
```

## 📚 Documentación de APIs

### Endpoints Principales

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual

#### Dashboard Administrativo
- `GET /api/admin/dashboard` - Estadísticas principales
- `GET /api/admin/revenue` - Datos de ingresos
- `GET /api/admin/users` - Gestión de usuarios
- `GET /api/admin/projects` - Gestión de proyectos
- `GET /api/admin/products` - Gestión de productos

#### Sistema de Pagos
- `POST /api/payments/process` - Procesar pago
- `POST /api/payments/refund` - Procesar reembolso
- `GET /api/payments/history/:userId` - Historial de pagos
- `GET /api/payments/gateways` - Gateways disponibles

#### Calculadora Solar
- `POST /api/calculadora/guardar` - Guardar cálculo personalizado
- `GET /api/calculadora/historial` - Historial de cálculos
- `GET /api/calculadora/:id` - Obtener cálculo específico
- `GET /api/calculadora/estadisticas/resumen` - Estadísticas generales

#### Notificaciones
- `GET /api/notifications/:userId` - Notificaciones de usuario
- `PUT /api/notifications/:id/read` - Marcar como leída
- `POST /api/notifications/send` - Enviar notificación

## 🗄️ Base de Datos

### Modelos Principales

- **User** - Usuarios del sistema (Clientes, Aliados, Admin)
- **Cliente** - Información específica de clientes
- **Aliado** - Profesionales certificados
- **Producto** - Catálogo de productos solares
- **Proyecto** - Proyectos de instalación
- **Transaccion** - Historial de pagos
- **Notificacion** - Sistema de notificaciones
- **AcademiaContenido** - Contenido educativo

### Relaciones

```
User (1) ──── (N) Cliente
User (1) ──── (N) Aliado
User (1) ──── (N) Transaccion
User (1) ──── (N) Notificacion
Cliente (1) ──── (N) Proyecto
Aliado (1) ──── (N) Proyecto
Proyecto (1) ──── (N) ProyectoItem
Producto (1) ──── (N) ProyectoItem
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno

#### Base de Datos (`packages/database/.env`)
```env
DATABASE_URL="postgresql://belenergy:belenergy@localhost:5432/belenergydb"
REDIS_URL="redis://localhost:6379"
```

#### Backend API (`apps/api/.env`)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://belenergy:belenergy@localhost:5432/belenergydb"
JWT_SECRET="bel-energy-jwt-secret-key"
JWT_EXPIRE="7d"
FRONTEND_URL="http://localhost:3000"
```

#### Frontend Web (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests del backend
cd apps/api && npm test

# Tests del frontend
cd apps/web && npm test

# Tests E2E (próximamente)
npm run test:e2e
```

### Cobertura de Tests
```bash
npm run test:coverage
```

## 🚢 Deployment

### Configuración de Producción

1. **Variables de entorno de producción**
2. **Configuración de PostgreSQL**
3. **Configuración de Redis**
4. **Configuración de gateways de pago**
5. **Configuración de servicios de email/SMS**

### Comandos de Deployment

```bash
# Build de producción
npm run build

# Iniciar en producción
npm run start

# Con PM2
pm2 start ecosystem.config.js
```

## 📋 Roadmap y Próximos Pasos

### ✅ Fase 1 - MVP Completo (Completado)
- [x] Arquitectura base con monorepo
- [x] Base de datos con Prisma
- [x] Backend API con Express
- [x] Frontend con Next.js
- [x] **Dashboard administrativo completo** ✅ FUNCIONANDO
- [x] Sistema de pagos multi-gateway
- [x] Sistema de notificaciones
- [x] **Interfaz admin moderna** con sidebar navigation
- [x] **Métricas en tiempo real** conectadas a BD

### 🚧 Fase 2 - Funcionalidades Avanzadas
- [x] **🏠 Calculadora Solar Avanzada** ✅ COMPLETADA
  - Sistema personalizado para Venezuela
  - Énfasis en autonomía energética
  - Recomendaciones de productos Bel Energy
  - Visualizaciones y gráficos interactivos
  - Integración completa con backend

- [ ] **PWA Features**
  - Service Worker para offline
  - Cache inteligente
  - Push notifications
  - Instalable como app nativa

- [ ] **Integraciones Externas Reales**
  - WhatsApp Business API real
  - SendGrid para emails
  - Twilio para SMS
  - Stripe y Banesco producción

- [ ] **Sistema de Aliados Completo**
  - Dashboard personalizado para aliados
  - Sistema de asignación automática
  - Gestión de comisiones
  - Certificaciones avanzadas

- [ ] **Academia Digital Avanzada**
  - Player de video personalizado
  - Sistema de quizzes interactivos
  - Certificados descargables
  - Progreso avanzado por usuario

### 🔮 Fase 3 - Escalabilidad y Optimización
- [ ] **App Móvil**
  - React Native + Expo
  - Sincronización offline
  - Notificaciones push
  - GPS para aliados

- [ ] **Analytics Avanzado**
  - Google Analytics 4
  - Heatmaps de usuario
  - A/B Testing
  - Optimización de conversión

- [ ] **IA y Machine Learning**
  - Recomendaciones personalizadas
  - Predicción de consumo
  - Detección de fraudes
  - Chatbot inteligente

### 🛠️ Fase 4 - Infraestructura y DevOps
- [ ] **CI/CD Pipeline**
  - GitHub Actions
  - Tests automatizados
  - Deployment automático
  - Rollback automático

- [ ] **Monitoreo y Logging**
  - Sentry para errores
  - DataDog para métricas
  - ELK Stack para logs
  - Alertas automáticas

- [ ] **Seguridad Avanzada**
  - Auditorías de seguridad
  - Penetration testing
  - GDPR compliance
  - Encriptación end-to-end

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

**Bel Energy** - info@belenergy.com

**Proyecto**: https://github.com/your-org/bel-energy-portal

## 🙏 Agradecimientos

- Next.js por el framework increíble
- Prisma por el ORM moderno
- Tailwind CSS por el sistema de diseño
- La comunidad open source

---

**Desarrollado con ❤️ para revolucionar la energía solar en Venezuela**

---

**Versión**: v1.2.6 | **Última actualización**: Octubre 2024