# 🤝 Guía de Contribución - Bel Energy Portal

¡Gracias por tu interés en contribuir a Bel Energy Portal! Esta guía te ayudará a entender cómo contribuir efectivamente al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Testing](#testing)
- [Documentación](#documentación)

## 🤝 Código de Conducta

Este proyecto sigue un código de conducta para asegurar un ambiente inclusivo y respetuoso. Al participar, te comprometes a:

- Ser respetuoso con todas las personas
- Usar lenguaje inclusivo y no discriminatorio
- Aceptar responsabilidad por errores
- Mostrar empatía hacia otros colaboradores
- Ayudar a mantener la comunidad saludable

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

1. **🐛 Reporte de Bugs**
2. **✨ Nuevas Funcionalidades**
3. **📚 Documentación**
4. **🎨 Mejoras de UI/UX**
5. **⚡ Optimizaciones de Performance**
6. **🔒 Mejoras de Seguridad**
7. **🧪 Tests**

### Flujo de Trabajo

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

## 🛠️ Configuración del Entorno

### Prerrequisitos

```bash
# Node.js 20+
node --version

# PostgreSQL 15+
psql --version

# Git
git --version
```

### Instalación

```bash
# Clona el repositorio
git clone https://github.com/your-org/bel-energy-portal.git
cd bel-energy-portal

# Instala dependencias
npm install

# Configura la base de datos
createdb belenergydb
createdb belenergydb_test

# Configura variables de entorno
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# Inicializa la base de datos
cd packages/database
npm run db:push
npm run db:seed

# Inicia los servicios
cd ../..
npm run dev
```

## 🏗️ Estructura del Proyecto

```
bel-energy-portal/
├── apps/
│   ├── web/              # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/      # App Router
│   │   │   ├── components/ # Componentes React
│   │   │   ├── lib/      # Utilidades
│   │   │   └── types/    # Tipos TypeScript
│   │   └── public/       # Assets estáticos
│   └── api/              # Backend Express.js
│       ├── src/
│       │   ├── controllers/ # Controladores
│       │   ├── services/    # Servicios de negocio
│       │   ├── routes/      # Definición de rutas
│       │   ├── middleware/  # Middleware personalizado
│       │   └── utils/       # Utilidades
│       └── uploads/         # Archivos subidos
├── packages/
│   ├── database/         # Prisma + PostgreSQL
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   └── shared/           # Código compartido
├── tools/                # Scripts y herramientas
├── docs/                 # Documentación
└── README.md
```

## 📝 Estándares de Código

### TypeScript

- **Tipos estrictos**: Siempre usar tipos explícitos
- **Interfaces**: Preferir interfaces sobre types para objetos
- **Null checks**: Usar optional chaining y nullish coalescing
- **Enums**: Usar PascalCase para valores de enums

```typescript
// ✅ Bueno
interface User {
  id: string
  name: string
  email?: string
}

enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

// ❌ Evitar
type User = {
  id: string
  name: string
  email?: string
}
```

### React/Next.js

- **Componentes funcionales**: Usar funciones flecha
- **Hooks personalizados**: Para lógica reutilizable
- **Server Components**: Por defecto, usar client solo cuando necesario
- **Naming**: PascalCase para componentes, camelCase para funciones

```tsx
// ✅ Bueno
'use client'

import { useState, useEffect } from 'react'

interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
}

export default function UserCard({ user, onEdit }: UserCardProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      {isEditing ? (
        <EditForm user={user} onSave={() => setIsEditing(false)} />
      ) : (
        <ViewMode user={user} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  )
}

// ❌ Evitar
function userCard(props) {
  const [editing, setEditing] = useState(false)
  // ...
}
```

### API Design

- **RESTful**: Seguir principios REST
- **Versioning**: Incluir versión en URL (`/api/v1/`)
- **Status codes**: Usar códigos HTTP apropiados
- **Error handling**: Respuestas de error consistentes

```typescript
// ✅ Bueno
app.get('/api/v1/users/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error getting user:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})
```

### Base de Datos

- **Migrations**: Siempre crear migrations para cambios de schema
- **Indexes**: Crear índices para queries frecuentes
- **Constraints**: Usar foreign keys y constraints apropiadas
- **Naming**: snake_case para columnas, PascalCase para tablas

```sql
-- ✅ Bueno
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_email ON "User"(email);

-- ❌ Evitar
CREATE TABLE users (
  id varchar(255) PRIMARY KEY,
  email varchar(255),
  name varchar(255)
);
```

## 🔄 Proceso de Pull Request

### 1. Preparación

```bash
# Actualizar rama principal
git checkout main
git pull origin main

# Crear rama de feature
git checkout -b feature/nueva-funcionalidad
```

### 2. Desarrollo

```bash
# Hacer commits pequeños y descriptivos
git add .
git commit -m "feat: add user authentication

- Add login endpoint
- Add JWT token generation
- Add user validation middleware"

# Push regularmente
git push origin feature/nueva-funcionalidad
```

### 3. Pull Request

**Título**: `feat: add user authentication`

**Descripción**:
```markdown
## Descripción
Implementa sistema de autenticación de usuarios con JWT.

## Cambios
- ✅ Endpoint `/api/auth/login`
- ✅ Middleware de autenticación
- ✅ Generación de tokens JWT
- ✅ Validación de usuarios

## Testing
- ✅ Tests unitarios para servicios
- ✅ Tests de integración para endpoints
- ✅ Tests E2E para flujo completo

## Screenshots
[Incluir capturas si aplica]

## Checklist
- [x] Código sigue estándares del proyecto
- [x] Tests pasan exitosamente
- [x] Documentación actualizada
- [x] Migrations de BD incluidas
```

### 4. Code Review

- **Aprobación requerida**: Al menos 1 reviewer
- **Checks automáticos**: Tests, linting, type checking
- **Merge**: Squash merge con mensaje limpio

## 🧪 Testing

### Tipos de Tests

1. **Unit Tests** - Funciones individuales
2. **Integration Tests** - APIs y servicios
3. **E2E Tests** - Flujos completos de usuario

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests específicos
npm run test:unit
npm run test:integration
npm run test:e2e

# Con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### Escribir Tests

```typescript
// ✅ Unit test
describe('AuthService', () => {
  describe('login', () => {
    it('should return user and token on valid credentials', async () => {
      const mockUser = { id: '1', email: 'test@example.com' }
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.user).toBeDefined()
      expect(result.token).toBeDefined()
      expect(result.user.email).toBe('test@example.com')
    })

    it('should throw error on invalid credentials', async () => {
      await expect(
        authService.login({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow('Invalid credentials')
    })
  })
})
```

## 📚 Documentación

### Actualizar Documentación

```bash
# API documentation
npm run docs:api

# Component documentation
npm run docs:components

# General documentation
npm run docs:build
```

### Estándares de Documentación

- **README**: Actualizar con nuevos features
- **API Reference**: Documentar nuevos endpoints
- **CHANGELOG**: Registrar cambios por versión
- **Code Comments**: 80%+ de funciones documentadas

## 🐛 Reporte de Bugs

### Template de Bug Report

```markdown
## Bug Report

**Título**: [BUG] Descripción breve del problema

**Descripción**
Descripción detallada del bug y pasos para reproducirlo.

**Pasos para Reproducir**
1. Ir a '...'
2. Hacer click en '...'
3. Ver error

**Comportamiento Esperado**
Qué debería suceder.

**Comportamiento Actual**
Qué está sucediendo actualmente.

**Screenshots**
[Incluir capturas de pantalla]

**Environment**
- OS: [e.g. macOS, Windows]
- Browser: [e.g. Chrome 91]
- Version: [e.g. v1.2.3]

**Additional Context**
Cualquier información adicional relevante.
```

## ✨ Feature Requests

### Template de Feature Request

```markdown
## Feature Request

**Título**: [FEATURE] Nombre de la funcionalidad

**Descripción**
Descripción detallada de la funcionalidad solicitada.

**Problema que Resuelve**
Explicar el problema actual que esta feature resolvería.

**Solución Propuesta**
Descripción de la solución implementada.

**Alternativas Consideradas**
Otras soluciones que se consideraron.

**Impacto**
- Usuarios afectados: [número o porcentaje]
- Áreas impactadas: [frontend, backend, database]
- Riesgos: [altos, medios, bajos]

**Prioridad**: [Alta, Media, Baja]
**Tiempo Estimado**: [horas/días]
```

## 🎯 Mejores Prácticas

### Commits

```bash
# ✅ Buenos commits
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve memory leak in payment service"
git commit -m "docs: update API reference for v2 endpoints"
git commit -m "refactor: optimize database queries for better performance"

# ❌ Evitar
git commit -m "fix bug"
git commit -m "update code"
git commit -m "changes"
```

### Branches

```bash
# ✅ Convenciones de naming
feature/user-authentication
bugfix/payment-validation
hotfix/security-patch
refactor/database-optimization
docs/api-documentation

# ❌ Evitar
new-feature
fix
update
```

### Code Reviews

**Reviewer Checklist:**
- [ ] Código sigue estándares del proyecto
- [ ] Tests incluidos y pasan
- [ ] Documentación actualizada
- [ ] Performance optimizada
- [ ] Seguridad considerada
- [ ] Migrations de BD incluidas si aplica

## 📞 Contacto

- **Issues**: [GitHub Issues](https://github.com/your-org/bel-energy-portal/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/bel-energy-portal/discussions)
- **Email**: dev@belenergy.com

## 🙏 Reconocimiento

¡Gracias por contribuir a Bel Energy Portal! Tu trabajo ayuda a revolucionar la energía solar en Venezuela y América Latina.

---

*Última actualización: Enero 2024*