# 🚀 Deployment Guide

Complete guide for deploying Meeting Reports System to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Backup & Recovery](#backup--recovery)
- [Monitoring](#monitoring)
- [Scaling](#scaling)

---

## Prerequisites

### System Requirements

**Minimum**:
- 2 CPU cores
- 2GB RAM
- 10GB disk space
- Ubuntu 20.04 LTS or higher

**Recommended**:
- 4 CPU cores
- 4GB RAM
- 50GB disk space
- Ubuntu 22.04 LTS

### Software Requirements

```bash
# Docker & Docker Compose
docker --version  # 20.x or higher
docker-compose --version  # 2.x or higher

# PostgreSQL (if not using Docker)
psql --version  # 14.x or higher

# Node.js (for manual deployment)
node --version  # 18.x or higher
npm --version   # 9.x or higher
```

---

## Docker Deployment

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Clone Repository

```bash
# Clone project
git clone https://github.com/your-org/meeting-reports-system.git
cd meeting-reports-system

# Checkout production branch
git checkout main
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit configuration
nano backend/.env
```

**backend/.env**:
```env
DB_HOST=192.168.100.70
DB_PORT=5432
DB_NAME=meeting_mgmt
DB_USER=postgres
DB_PASS=your_secure_password
PORT=3001
NODE_ENV=production
```

### Step 4: Setup Database

```bash
# Connect to PostgreSQL
psql -h 192.168.100.70 -U postgres

# Create database
CREATE DATABASE meeting_mgmt;
\q

# Import schema and data
psql -h 192.168.100.70 -U postgres -d meeting_mgmt -f init.sql
```

### Step 5: Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 6: Verify Deployment

```bash
# Test backend
curl http://localhost:3001/api/health

# Test frontend
curl http://localhost:8080

# Check database connection
docker-compose exec backend node -e "require('./src/database.js')"
```

---

## Manual Deployment

### Backend Deployment

```bash
# Navigate to backend
cd backend

# Install dependencies
npm ci --production

# Setup PM2 for process management
npm install -g pm2

# Start application
pm2 start src/server.js --name meeting-backend

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup
```

### Frontend Deployment

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Install serve
npm install -g serve

# Serve built files
pm2 start "serve -s dist -l 8080" --name meeting-frontend
```

### Nginx Configuration

```bash
# Install Nginx
sudo apt install nginx -y

# Create configuration
sudo nano /etc/nginx/sites-available/meeting-reports
```

**nginx configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/meeting-reports /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Database Setup

### PostgreSQL Installation

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create user and database
sudo -u postgres psql
```

```sql
-- Create user
CREATE USER meeting_user WITH PASSWORD 'secure_password';

-- Create database
CREATE DATABASE meeting_mgmt OWNER meeting_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE meeting_mgmt TO meeting_user;

\q
```

### Import Data

```bash
# Import schema
psql -U meeting_user -d meeting_mgmt -f init.sql

# Verify
psql -U meeting_user -d meeting_mgmt -c "SELECT COUNT(*) FROM meeting_reports;"
```

### Database Optimization

```sql
-- Analyze tables
ANALYZE meeting_reports;

-- Vacuum
VACUUM ANALYZE meeting_reports;

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'meeting_reports';
```

---

## Environment Configuration

### Production Environment Variables

**backend/.env**:
```env
# Database
DB_HOST=192.168.100.70
DB_PORT=5432
DB_NAME=meeting_mgmt
DB_USER=postgres
DB_PASS=your_secure_password

# Server
PORT=3001
NODE_ENV=production

# Security
CORS_ORIGIN=https://your-domain.com
SESSION_SECRET=your_session_secret

# Logging
LOG_LEVEL=error
LOG_FILE=/var/log/meeting-backend.log
```

### Security Best Practices

```bash
# Set proper file permissions
chmod 600 backend/.env
chown www-data:www-data backend/.env

# Use environment variables
export DB_PASS=$(cat /etc/secrets/db_password)

# Never commit .env files
echo ".env" >> .gitignore
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Manual SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ... rest of configuration
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Backup & Recovery

### Automated Backup Script

```bash
# Create backup script
nano /usr/local/bin/backup-meeting-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/meeting-reports"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="meeting_mgmt_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -h 192.168.100.70 -U postgres meeting_mgmt > "$BACKUP_DIR/$FILENAME"

# Compress
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $FILENAME.gz"
```

```bash
# Make executable
chmod +x /usr/local/bin/backup-meeting-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-meeting-db.sh
```

### Recovery

```bash
# Restore from backup
gunzip meeting_mgmt_20250101_020000.sql.gz
psql -h 192.168.100.70 -U postgres -d meeting_mgmt < meeting_mgmt_20250101_020000.sql
```

---

## Monitoring

### Health Checks

```bash
# Create monitoring script
nano /usr/local/bin/monitor-meeting-system.sh
```

```bash
#!/bin/bash

# Check backend
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is down"
    # Send alert
fi

# Check frontend
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is down"
fi

# Check database
if psql -h 192.168.100.70 -U postgres -d meeting_mgmt -c "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is down"
fi
```

### Log Management

```bash
# Setup log rotation
sudo nano /etc/logrotate.d/meeting-reports
```

```
/var/log/meeting-*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

---

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Load Balancing

```nginx
upstream backend {
    least_conn;
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

---

## Checklist

- [ ] Server prepared and updated
- [ ] Docker installed and configured
- [ ] Database created and initialized
- [ ] Environment variables configured
- [ ] Application deployed
- [ ] SSL/HTTPS configured
- [ ] Backup system setup
- [ ] Monitoring configured
- [ ] Health checks working
- [ ] Documentation updated
