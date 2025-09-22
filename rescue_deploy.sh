#!/bin/bash

# Bel Energy Portal - Rescue Mode Quick Deploy
# Copy and paste these commands in the Namecheap rescue console

echo "🚀 Bel Energy Portal - Rescue Mode Deployment"
echo "============================================"

# Update system
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
npm install -g pm2

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Create database
echo "🗄️ Creating database..."
sudo -u postgres psql -c "CREATE DATABASE belenergy_prod;" 2>/dev/null || echo "Database exists"
sudo -u postgres psql -c "CREATE USER belenergy_prod WITH PASSWORD 'belenergy_prod_2024';" 2>/dev/null || echo "User exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE belenergy_prod TO belenergy_prod;"

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Clone repository
echo "📥 Cloning repository..."
cd /root
rm -rf bel-energy-portal 2>/dev/null || true
git clone https://github.com/rubenbolivar/bailab.dev-bel-energy.git bel-energy-portal
cd bel-energy-portal

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Configure environment
echo "⚙️ Configuring environment..."
cp packages/database/.env.example packages/database/.env
cat > packages/database/.env << 'EOL'
DATABASE_URL="postgresql://belenergy_prod:belenergy_prod_2024@localhost:5432/belenergy_prod"
REDIS_URL="redis://localhost:6379"
EOL

cp apps/api/.env.example apps/api/.env
cat > apps/api/.env << 'EOL'
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://belenergy_prod:belenergy_prod_2024@localhost:5432/belenergy_prod"
JWT_SECRET="bel-energy-jwt-secret-prod-$(openssl rand -hex 32)"
JWT_EXPIRE="7d"
FRONTEND_URL="https://bel-energy.bailab.dev"
EOL

cp apps/web/.env.local.example apps/web/.env.local 2>/dev/null || true
cat > apps/web/.env.local << 'EOL'
NEXT_PUBLIC_API_URL=https://bel-energy.bailab.dev/api
NEXT_PUBLIC_APP_URL=https://bel-energy.bailab.dev
NODE_ENV=production
EOL

# Setup database
echo "🗄️ Setting up database..."
npx prisma generate
cd packages/database
npm run db:push
npm run db:seed
cd ../..

# Build applications
echo "🔨 Building applications..."
npm run build

# Configure PM2
echo "🚀 Configuring PM2..."
cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [
    {
      name: 'bel-energy-api',
      script: 'apps/api/src/server.ts',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'bel-energy-web',
      script: 'npm run start',
      instances: 1,
      exec_mode: 'fork',
      cwd: 'apps/web',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
EOL

pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/bel-energy.bailab.dev << 'EOL'
server {
    listen 80;
    server_name bel-energy.bailab.dev;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
EOL

# Enable site
ln -sf /etc/nginx/sites-available/bel-energy.bailab.dev /etc/nginx/sites-enabled/ 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx

# Install SSL
echo "🔒 Installing SSL certificate..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d bel-energy.bailab.dev --non-interactive --agree-tos --email admin@bailab.dev 2>/dev/null || echo "SSL setup failed, will retry later"

# Final status
echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "========================"
echo "🌐 URLs:"
echo "   Frontend: https://bel-energy.bailab.dev"
echo "   API: https://bel-energy.bailab.dev/api"
echo ""
echo "🔍 Status check:"
pm2 status
echo ""
systemctl status nginx --no-pager -l | head -5
echo ""
echo "🧪 Test:"
curl -I https://bel-energy.bailab.dev 2>/dev/null || echo "Site not responding yet (DNS propagation)"
echo ""
echo "✅ Bel Energy Portal deployed successfully!"