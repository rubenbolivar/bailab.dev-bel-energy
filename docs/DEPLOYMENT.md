# 🚢 Guía de Deployment - Bel Energy Portal

## Requisitos del Sistema

### Servidor Recomendado
- **CPU**: 4+ cores (Intel Xeon o AMD EPYC)
- **RAM**: 8GB+ (16GB recomendado)
- **Disco**: 100GB+ SSD NVMe
- **Red**: 100Mbps+ conexión estable

### Software Requerido
- **Node.js**: 20.0.0 LTS
- **PostgreSQL**: 15.0+
- **Redis**: 7.0+
- **Nginx**: 1.20+
- **PM2**: 5.0+
- **Certbot**: Para SSL

## 🏗️ Configuración de Producción

### 1. Preparación del Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar Redis
sudo apt install redis-server -y

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Certbot para SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configuración de PostgreSQL

```bash
# Crear usuario y base de datos
sudo -u postgres psql

# Dentro de PostgreSQL
CREATE USER belenergy_prod WITH PASSWORD 'tu_password_seguro_aqui';
CREATE DATABASE belenergydb_prod OWNER belenergy_prod;
GRANT ALL PRIVILEGES ON DATABASE belenergydb_prod TO belenergy_prod;
ALTER USER belenergy_prod CREATEDB;
\q
```

### 3. Configuración de Redis

```bash
# Editar configuración de Redis
sudo nano /etc/redis/redis.conf

# Configuraciones importantes:
# bind 127.0.0.1
# port 6379
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Reiniciar Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### 4. Configuración del Proyecto

```bash
# Clonar repositorio
git clone https://github.com/your-org/bel-energy-portal.git
cd bel-energy-portal

# Instalar dependencias
npm install

# Configurar variables de entorno de producción
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

### 5. Variables de Entorno de Producción

#### `packages/database/.env`
```env
DATABASE_URL="postgresql://belenergy_prod:tu_password_seguro_aqui@localhost:5432/belenergydb_prod"
REDIS_URL="redis://localhost:6379"
```

#### `apps/api/.env`
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://belenergy_prod:tu_password_seguro_aqui@localhost:5432/belenergydb_prod"
REDIS_URL="redis://localhost:6379"

# JWT (generar claves seguras)
JWT_SECRET="tu_jwt_secret_muy_seguro_aqui_min_32_caracteres"
JWT_EXPIRE="7d"

# URLs de producción
FRONTEND_URL="https://belenergy.com"
API_URL="https://api.belenergy.com"

# File upload
MAX_FILE_SIZE="50MB"
UPLOAD_PATH="/var/www/bel-energy/uploads"

# Payment Gateways (configurar con claves reales)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_WEBHOOK_ENDPOINT="https://api.belenergy.com/api/payments/webhook/stripe"

# Banesco (configurar con credenciales reales)
BANESCO_API_KEY="..."
BANESCO_MERCHANT_ID="..."

# Binance Pay
BINANCE_PAY_API_KEY="..."
BINANCE_PAY_SECRET_KEY="..."

# Email Service (SendGrid)
SENDGRID_API_KEY="SG...."

# WhatsApp Business API
WHATSAPP_TOKEN="..."
WHATSAPP_PHONE_NUMBER_ID="..."
WHATSAPP_BUSINESS_ACCOUNT_ID="..."

# External Services
CLOUDINARY_URL="cloudinary://..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
LOG_FILE="/var/log/bel-energy/api.log"
```

#### `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL=https://api.belenergy.com
NEXT_PUBLIC_APP_URL=https://belenergy.com
NEXT_PUBLIC_ENVIRONMENT=production

# Analytics (Google Analytics)
NEXT_PUBLIC_GA_TRACKING_ID="GA-..."

# Payment (Stripe public key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Social Media
NEXT_PUBLIC_FACEBOOK_APP_ID="..."
NEXT_PUBLIC_TWITTER_HANDLE="@belenergy"

# CDN
NEXT_PUBLIC_CDN_URL="https://cdn.belenergy.com"
```

### 6. Build de Producción

```bash
# Build del backend
cd apps/api
npm run build

# Build del frontend
cd ../web
npm run build

# Crear directorio de uploads
sudo mkdir -p /var/www/bel-energy/uploads
sudo chown -R $USER:$USER /var/www/bel-energy
```

### 7. Configuración de PM2

Crear archivo `ecosystem.config.js` en la raíz del proyecto:

```javascript
module.exports = {
  apps: [
    {
      name: 'bel-energy-api',
      script: 'apps/api/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      max_memory_restart: '1G',
      restart_delay: 4000,
      log_file: '/var/log/bel-energy/api.log',
      out_file: '/var/log/bel-energy/api-out.log',
      error_file: '/var/log/bel-energy/api-error.log',
      time: true
    },
    {
      name: 'bel-energy-web',
      script: 'npm',
      args: 'start',
      cwd: 'apps/web',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      max_memory_restart: '500M',
      restart_delay: 4000
    }
  ]
}
```

```bash
# Iniciar servicios con PM2
pm2 start ecosystem.config.js

# Configurar PM2 para auto-inicio
pm2 startup
pm2 save

# Verificar estado
pm2 status
pm2 logs
```

### 8. Configuración de Nginx

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/belenergy.com
```

Contenido del archivo de configuración:

```nginx
# Upstream para la API
upstream belenergy_api {
    server 127.0.0.1:3001;
    keepalive 32;
}

# Upstream para el frontend
upstream belenergy_web {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Configuración SSL
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=web:10m rate=30r/s;

# Servidor principal
server {
    listen 80;
    server_name belenergy.com www.belenergy.com api.belenergy.com;
    return 301 https://$server_name$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name belenergy.com www.belenergy.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/belenergy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/belenergy.com/privkey.pem;

    # Frontend
    location / {
        limit_req zone=web burst=20 nodelay;

        proxy_pass http://belenergy_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Cache estático
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API
    location /api/ {
        limit_req zone=api burst=10 nodelay;

        proxy_pass http://belenergy_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/bel-energy/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Logs de acceso
    access_log /var/log/nginx/belenergy_access.log;
    error_log /var/log/nginx/belenergy_error.log;
}

# Servidor API separado (opcional)
server {
    listen 443 ssl http2;
    server_name api.belenergy.com;

    ssl_certificate /etc/letsencrypt/live/belenergy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/belenergy.com/privkey.pem;

    location / {
        limit_req zone=api burst=10 nodelay;

        proxy_pass http://belenergy_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS para API
        add_header 'Access-Control-Allow-Origin' 'https://belenergy.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/belenergy.com /etc/nginx/sites-enabled/

# Remover configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 9. Configuración SSL con Let's Encrypt

```bash
# Obtener certificado SSL
sudo certbot --nginx -d belenergy.com -d www.belenergy.com -d api.belenergy.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 10. Configuración de Firewall

```bash
# Configurar UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Verificar estado
sudo ufw status
```

### 11. Monitoreo y Logs

```bash
# Configurar logrotate para PM2
sudo nano /etc/logrotate.d/bel-energy
```

Contenido:

```
/var/log/bel-energy/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

```bash
# Configurar monitoreo básico
sudo apt install htop iotop -y

# Ver logs en tiempo real
pm2 logs
tail -f /var/log/nginx/belenergy_access.log
```

### 12. Backup y Recuperación

```bash
# Script de backup
sudo nano /usr/local/bin/bel-energy-backup.sh
```

Contenido del script:

```bash
#!/bin/bash

# Backup de base de datos
BACKUP_DIR="/var/backups/bel-energy"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U belenergy_prod -h localhost belenergydb_prod > $BACKUP_DIR/db_$DATE.sql

# Backup de archivos
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/bel-energy/uploads/

# Backup de configuración
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /var/www/bel-energy/config/

# Limpiar backups antiguos (mantener 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Hacer ejecutable y configurar cron
sudo chmod +x /usr/local/bin/bel-energy-backup.sh
sudo crontab -e
# Agregar: 0 2 * * * /usr/local/bin/bel-energy-backup.sh
```

## 🔍 Monitoreo y Mantenimiento

### Métricas Clave a Monitorear

1. **Performance**
   - Response time de APIs (< 500ms)
   - CPU usage (< 70%)
   - Memory usage (< 80%)
   - Disk usage (< 80%)

2. **Aplicación**
   - PM2 process status
   - Error logs
   - Database connections
   - Cache hit rate

3. **Negocio**
   - Conversion rate
   - Payment success rate
   - User engagement
   - Revenue metrics

### Herramientas de Monitoreo

```bash
# Instalar herramientas de monitoreo
sudo apt install prometheus-node-exporter -y
sudo apt install grafana -y

# PM2 monitoring
pm2 monit

# Database monitoring
sudo apt install pgadmin4 -y
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error de conexión a base de datos**
   ```bash
   # Verificar conexión
   psql -U belenergy_prod -d belenergydb_prod -h localhost

   # Verificar logs de PostgreSQL
   sudo tail -f /var/log/postgresql/postgresql-15-main.log
   ```

2. **Error 502 Bad Gateway**
   ```bash
   # Verificar estado de PM2
   pm2 status
   pm2 logs bel-energy-api

   # Reiniciar servicios
   pm2 restart all
   ```

3. **Problemas de memoria**
   ```bash
   # Verificar uso de memoria
   htop
   pm2 monit

   # Ajustar límites de PM2
   pm2 reload ecosystem.config.js
   ```

4. **Certificado SSL expirado**
   ```bash
   # Renovar certificado
   sudo certbot renew

   # Reiniciar Nginx
   sudo systemctl restart nginx
   ```

## 📊 Escalabilidad

### Optimizaciones de Performance

1. **Database**
   ```sql
   -- Crear índices para queries frecuentes
   CREATE INDEX idx_user_email ON "User"(email);
   CREATE INDEX idx_project_status ON "Proyecto"(status);
   CREATE INDEX idx_transaction_user ON "Transaccion"(userId);
   ```

2. **Redis Caching**
   ```javascript
   // Implementar cache para queries frecuentes
   const cachedUsers = await redis.get('users:active');
   if (!cachedUsers) {
     const users = await prisma.user.findMany({ where: { status: 'ACTIVO' } });
     await redis.set('users:active', JSON.stringify(users), 'EX', 300);
   }
   ```

3. **CDN para Assets Estáticos**
   ```nginx
   # Configurar CDN en Nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
     add_header X-CDN "CloudFlare";
   }
   ```

## 🔄 Actualizaciones

### Proceso de Deployment

```bash
# En servidor de producción
cd /var/www/bel-energy

# Backup antes de actualizar
./backup.sh

# Actualizar código
git pull origin main

# Instalar nuevas dependencias
npm install

# Build de producción
npm run build

# Reiniciar servicios
pm2 reload ecosystem.config.js

# Verificar health check
curl https://api.belenergy.com/health
```

## 📞 Contactos de Emergencia

- **Soporte Técnico**: soporte@belenergy.com
- **Administrador de Sistema**: admin@belenergy.com
- **Equipo de Desarrollo**: dev@belenergy.com

---

*Esta guía debe ser revisada y actualizada regularmente según las necesidades del proyecto.*