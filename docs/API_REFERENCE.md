# 📚 Referencia de APIs - Bel Energy Portal

## Base URL
```
Producción: https://api.belenergy.com
Desarrollo: http://localhost:3001
```

## Autenticación

Todas las APIs requieren autenticación JWT excepto las públicas.

### Headers Requeridos
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 🔐 Autenticación

### POST /api/auth/login
Iniciar sesión en la plataforma.

**Request:**
```json
{
  "email": "cliente@belenergy.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cmfo9zbua000112brqkwhu9i5",
      "email": "cliente@belenergy.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "userType": "CLIENTE",
      "belScore": 750
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/register
Registro de nuevo usuario.

**Request:**
```json
{
  "email": "nuevo@cliente.com",
  "password": "password123",
  "firstName": "María",
  "lastName": "González",
  "userType": "CLIENTE",
  "phone": "+584121234567"
}
```

### GET /api/auth/me
Obtener información del usuario actual.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cmfo9zbua000112brqkwhu9i5",
    "email": "cliente@belenergy.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "userType": "CLIENTE",
    "belScore": 750
  }
}
```

---

## 📊 Dashboard Administrativo

### GET /api/admin/dashboard
Obtener estadísticas principales del dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 120,
    "totalProjects": 45,
    "completedProjects": 32,
    "totalRevenue": 125000,
    "monthlyRevenue": 15000,
    "averageProjectValue": 2777.78,
    "conversionRate": 71.11
  }
}
```

### GET /api/admin/revenue
Datos de ingresos mensuales para gráficos.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "month": "2024-01",
      "revenue": 12000,
      "projects": 8,
      "transactions": 12
    },
    {
      "month": "2024-02",
      "revenue": 15000,
      "projects": 10,
      "transactions": 15
    }
  ]
}
```

### GET /api/admin/users
Gestión de usuarios con paginación.

**Query Parameters:**
- `page` (number): Página actual (default: 1)
- `limit` (number): Elementos por página (default: 20)
- `search` (string): Término de búsqueda

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "cmfo9zbua000112brqkwhu9i5",
        "email": "cliente@belenergy.com",
        "firstName": "Juan",
        "lastName": "Pérez",
        "userType": "CLIENTE",
        "status": "ACTIVO",
        "belScore": 750,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### GET /api/admin/projects
Gestión de proyectos con filtros.

**Query Parameters:**
- `page` (number): Página actual
- `limit` (number): Elementos por página
- `status` (string): Filtrar por estado

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proyecto_demo_001",
        "clienteId": "cmfo9zbua000112brqkwhu9i5",
        "aliadoId": "cmfo9zbuc000212brf6mha66w",
        "projectType": "CON_INSTALACION",
        "status": "EN_PROCESO",
        "totalAmount": 5000,
        "paymentStatus": "PARCIAL",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

---

## 💳 Sistema de Pagos

### POST /api/payments/process
Procesar un pago.

**Request:**
```json
{
  "gateway": "stripe",
  "amount": 100.00,
  "currency": "USD",
  "userId": "cmfo9zbua000112brqkwhu9i5",
  "projectId": "proyecto_demo_001",
  "paymentMethod": "card",
  "description": "Pago inicial proyecto solar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "transactionId": "cmfoa1jrt0005qmy2fvvsksyg",
    "gatewayTransactionId": "stripe_1758131400807_cfbdiwuva",
    "status": "COMPLETED",
    "message": "Pago procesado exitosamente"
  }
}
```

### POST /api/payments/simulate
Simular un pago (solo desarrollo).

**Request:**
```json
{
  "gateway": "banesco",
  "amount": 500.00,
  "currency": "USD",
  "userId": "cmfo9zbua000112brqkwhu9i5",
  "paymentMethod": "transfer",
  "description": "Pago simulado"
}
```

### GET /api/payments/history/:userId
Historial de transacciones de un usuario.

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "cmfoa1jrt0005qmy2fvvsksyg",
        "userId": "cmfo9zbua000112brqkwhu9i5",
        "projectId": "proyecto_demo_001",
        "gatewayTransactionId": "stripe_1758131400807_cfbdiwuva",
        "paymentGateway": "Stripe",
        "amount": 100,
        "currency": "USD",
        "status": "COMPLETED",
        "paymentMethod": "card",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### GET /api/payments/gateways
Obtener gateways de pago disponibles.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "stripe",
      "info": {
        "name": "Stripe",
        "supported": true
      }
    },
    {
      "name": "banesco",
      "info": {
        "name": "Banesco",
        "supported": true
      }
    },
    {
      "name": "binance_pay",
      "info": {
        "name": "Binance Pay",
        "supported": true
      }
    }
  ]
}
```

---

## 🔔 Sistema de Notificaciones

### GET /api/notifications/:userId
Obtener notificaciones de un usuario.

**Query Parameters:**
- `page` (number): Página actual
- `limit` (number): Elementos por página
- `unreadOnly` (boolean): Solo no leídas

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_001",
        "userId": "cmfo9zbua000112brqkwhu9i5",
        "title": "Pago Exitoso",
        "message": "Se ha procesado un pago de $100 exitosamente",
        "type": "SUCCESS",
        "category": "PAYMENT",
        "read": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

### PUT /api/notifications/:id/read
Marcar notificación como leída.

**Response:**
```json
{
  "success": true,
  "message": "Notificación marcada como leída"
}
```

### PUT /api/notifications/mark-all-read
Marcar todas las notificaciones como leídas.

**Request:**
```json
{
  "userId": "cmfo9zbua000112brqkwhu9i5"
}
```

---

## 📦 Gestión de Productos

### GET /api/products
Obtener catálogo de productos.

**Query Parameters:**
- `page` (number): Página actual
- `limit` (number): Elementos por página
- `category` (string): Filtrar por categoría

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "PANEL-400W",
        "sku": "PANEL-400W",
        "name": "Panel Solar 400W Monocristalino",
        "category": "PANEL",
        "description": "Panel solar de alta eficiencia",
        "priceUSD": 180,
        "stockQuantity": 50,
        "specifications": {
          "power": "400W",
          "efficiency": "22.5%"
        },
        "targetAudience": ["RESIDENCIAL", "COMERCIAL"],
        "warrantyYears": 25
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

---

## 🏗️ Gestión de Proyectos

### GET /api/projects
Obtener proyectos del usuario.

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proyecto_demo_001",
        "clienteId": "cmfo9zbua000112brqkwhu9i5",
        "aliadoId": "cmfo9zbuc000212brf6mha66w",
        "projectType": "CON_INSTALACION",
        "status": "EN_PROCESO",
        "totalAmount": 5000,
        "paymentStatus": "PARCIAL",
        "installationDate": "2024-02-15T00:00:00Z",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

## 🎓 Academia Digital

### GET /api/academy/content
Obtener contenido de la academia.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "academy_basico_001",
      "title": "Introducción a la Energía Solar",
      "category": "BASICO",
      "contentType": "VIDEO",
      "level": "PRINCIPIANTE",
      "durationMinutes": 45,
      "description": "Aprende los fundamentos de la energía solar",
      "isPremium": false,
      "certificationPoints": 10
    }
  ]
}
```

---

## 📋 Códigos de Estado

### Respuestas Exitosas
- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente

### Errores del Cliente
- `400` - Bad Request: Datos inválidos
- `401` - Unauthorized: No autorizado
- `403` - Forbidden: Acceso denegado
- `404` - Not Found: Recurso no encontrado
- `422` - Unprocessable Entity: Validación fallida

### Errores del Servidor
- `500` - Internal Server Error: Error interno
- `502` - Bad Gateway: Error de gateway
- `503` - Service Unavailable: Servicio no disponible

### Formato de Error
```json
{
  "success": false,
  "error": "Descripción del error",
  "code": "ERROR_CODE"
}
```

---

## 🔒 Rate Limiting

La API implementa rate limiting para prevenir abuso:

- **General**: 100 solicitudes por 15 minutos por IP
- **Autenticación**: 5 intentos por minuto por IP
- **Pagos**: 10 solicitudes por minuto por usuario

---

## 📊 Paginación

Todas las APIs que retornan listas implementan paginación:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## 🔄 Versionado

La API utiliza versionado en la URL:

- `GET /api/v1/users` - Versión 1
- `GET /api/v2/users` - Versión 2 (futuro)

---

## 🧪 Testing

### Health Check
```bash
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

---

## 📞 Soporte

Para soporte técnico:
- **Email**: soporte@belenergy.com
- **WhatsApp**: +58 412 123 4567
- **Documentación**: https://docs.belenergy.com

---

*Última actualización: Enero 2024*