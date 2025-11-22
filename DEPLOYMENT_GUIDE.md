# Meeting Management System - Deployment Guide

## 🚀 Quick Deployment (Docker Compose)

### Prerequisites
- Docker 20+
- Docker Compose 2+
- PostgreSQL 14+ (or use Docker)
- MariaDB (for authentication)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd meeting-reports-system
```

### Step 2: Configure Environment
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit backend/.env
nano backend/.env
```

**Required environment variables:**
```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meeting_mgmt
DB_USER=postgres
DB_PASS=your_secure_password

# MariaDB (Authentication)
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_DATABASE=hr
MARIADB_USER=root
MARIADB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=generate_random_secret_here_min_32_chars
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=production
UPLOADS_PATH=/app/uploads
```

### Step 3: Initialize Database
```bash
# Create database
createdb -h localhost -U postgres meeting_mgmt

# Run migrations
psql -h localhost -U postgres -d meeting_mgmt -f init.sql
psql -h localhost -U postgres -d meeting_mgmt -f database/auth-schema.sql
psql -h localhost -U postgres -d meeting_mgmt -f database/agendas-schema.sql
```

### Step 4: Deploy with Docker Compose
```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d --build

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

### Step 5: Verify Deployment
```bash
# Backend health check
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:3000

# Expected response:
# {"success":true,"message":"API is running and database is connected","database":"connected"}
```

### Step 6: Access Application
- **Frontend:** http://your_server_ip:3000
- **Backend API:** http://your_server_ip:3001
- **pgAdmin:** http://your_server_ip:5050 (optional)

---

## 📦 Manual Deployment (Without Docker)

### Backend Deployment

**1. Install Dependencies:**
```bash
cd backend
npm ci --production
```

**2. Configure Environment:**
```bash
cp .env.example .env
nano .env
```

**3. Start Backend:**
```bash
# Development
npm run dev

# Production (with PM2)
npm install -g pm2
pm2 start src/server.js --name meeting-backend
pm2 save
pm2 startup
```

### Frontend Deployment

**1. Build Frontend:**
```bash
cd frontend
npm ci
npm run build
```

**2. Serve with Nginx:**
```nginx
server {
    listen 80;
    server_name your_domain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

**3. Restart Nginx:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Security Checklist

- [ ] Change default JWT_SECRET to random 32+ character string
- [ ] Use strong database passwords
- [ ] Configure firewall (allow only necessary ports)
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up database SSL connections
- [ ] Configure CORS for production domains only
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates

---

## 📊 Monitoring

### Health Checks
```bash
# Backend
curl http://localhost:3001/api/health

# Detailed health
curl http://localhost:3001/api/health/detailed
```

### Logs
```bash
# Docker logs
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend

# PM2 logs
pm2 logs meeting-backend
```

### Database Monitoring
```bash
# Connect to database
psql -h localhost -U postgres -d meeting_mgmt

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

---

## 💾 Backup & Restore

### Database Backup
```bash
# Backup
pg_dump -h localhost -U postgres meeting_mgmt > backup_$(date +%Y%m%d).sql

# Backup with compression
pg_dump -h localhost -U postgres meeting_mgmt | gzip > backup_$(date +%Y%m%d).sql.gz

# Automated daily backup (crontab)
0 2 * * * pg_dump -h localhost -U postgres meeting_mgmt | gzip > /backups/meeting_mgmt_$(date +\%Y\%m\%d).sql.gz
```

### Database Restore
```bash
# Restore from backup
psql -h localhost -U postgres -d meeting_mgmt < backup_20251122.sql

# Restore from compressed backup
gunzip -c backup_20251122.sql.gz | psql -h localhost -U postgres -d meeting_mgmt
```

### Uploads Backup
```bash
# Backup uploads folder
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Restore uploads
tar -xzf uploads_backup_20251122.tar.gz
```

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose -f docker-compose.production.yml logs backend

# Common issues:
# 1. Database connection failed
#    - Check DB_HOST, DB_PORT, DB_USER, DB_PASS in .env
#    - Verify database is running: pg_isready -h localhost -U postgres

# 2. Port already in use
#    - Check: lsof -i :3001
#    - Kill process: kill -9 <PID>

# 3. Missing environment variables
#    - Verify .env file exists and has all required variables
```

### Frontend can't connect to backend
```bash
# Check CORS configuration
# backend/src/server.js - line 20-40

# Check API URL
# frontend/.env or frontend/src/services/api.js

# Test backend directly
curl http://localhost:3001/api/health
```

### Database connection issues
```bash
# Test connection
psql -h localhost -U postgres -d meeting_mgmt

# Check PostgreSQL is running
sudo systemctl status postgresql

# Check firewall
sudo ufw status
sudo ufw allow 5432/tcp
```

### File upload issues
```bash
# Check uploads directory exists
ls -la uploads/

# Check permissions
chmod 755 uploads/

# Check disk space
df -h
```

---

## 📈 Performance Optimization

### Database Optimization
```sql
-- Analyze tables
ANALYZE meeting_reports;
ANALYZE meeting_agendas;
ANALYZE meeting_files;
ANALYZE agenda_files;

-- Vacuum
VACUUM ANALYZE;

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Backend Optimization
```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Connection pooling (already configured)
// backend/src/database.js
max: 20, // connection pool size
```

### Frontend Optimization
```bash
# Build with optimization
npm run build

# Serve with gzip compression (nginx)
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## 🔄 Updates & Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

# Or without Docker
cd backend && npm ci --production
cd frontend && npm ci && npm run build
pm2 restart meeting-backend
sudo systemctl restart nginx
```

### Database Migrations
```bash
# Run new migrations
psql -h localhost -U postgres -d meeting_mgmt -f database/new_migration.sql
```

### Clean Up
```bash
# Remove old Docker images
docker system prune -a

# Clean npm cache
npm cache clean --force

# Remove old logs
find /var/log -name "*.log" -mtime +30 -delete
```

---

## 📞 Support

For issues or questions:
1. Check this deployment guide
2. Review MEETING_MGMT_PROJECT_SPEC.md
3. Check application logs
4. Contact system administrator

---

**Last Updated:** November 22, 2025  
**Version:** 2.0
