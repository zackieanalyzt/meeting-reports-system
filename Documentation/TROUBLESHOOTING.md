# 🔧 Troubleshooting Guide

Common issues and solutions for Meeting Reports System.

## Table of Contents

- [Database Issues](#database-issues)
- [Backend Issues](#backend-issues)
- [Frontend Issues](#frontend-issues)
- [Docker Issues](#docker-issues)
- [Network Issues](#network-issues)
- [Performance Issues](#performance-issues)

---

## Database Issues

### Issue 1: Cannot Connect to Database

**Symptoms**:
```
Error: connect ECONNREFUSED 192.168.100.70:5432
```

**Solutions**:

```bash
# 1. Check if PostgreSQL is running
sudo systemctl status postgresql

# 2. Test connection
psql -h 192.168.100.70 -U postgres -d meeting_mgmt

# 3. Check pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

# 4. Check postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf
# Set: listen_addresses = '*'

# 5. Restart PostgreSQL
sudo systemctl restart postgresql

# 6. Check firewall
sudo ufw allow 5432/tcp
```

### Issue 2: Database Connection Timeout

**Symptoms**:
```
Error: Connection timeout
```

**Solutions**:

```bash
# Increase timeout in backend/.env
DB_TIMEOUT=30000

# Check network latency
ping 192.168.100.70

# Check PostgreSQL max_connections
psql -c "SHOW max_connections;"
```

### Issue 3: Slow Queries

**Symptoms**: Search takes too long

**Solutions**:

```sql
-- Check missing indexes
SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public';

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM meeting_reports WHERE meeting_title ILIKE '%test%';

-- Rebuild indexes
REINDEX TABLE meeting_reports;

-- Update statistics
ANALYZE meeting_reports;
```

---

## Backend Issues

### Issue 1: Backend Won't Start

**Symptoms**:
```
Error: Cannot find module 'express'
```

**Solutions**:

```bash
# 1. Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

# 2. Check Node version
node --version  # Should be 18.x

# 3. Check for port conflicts
lsof -i :3001
# Kill conflicting process
kill -9 <PID>

# 4. Check environment variables
cat .env
```

### Issue 2: API Returns 500 Error

**Symptoms**:
```json
{
  "success": false,
  "error": "Internal server error"
}
```

**Solutions**:

```bash
# 1. Check backend logs
docker-compose logs backend
# or
pm2 logs meeting-backend

# 2. Enable debug logging
# In backend/src/server.js
console.log('Error details:', error);

# 3. Test database connection
node -e "require('./src/database.js')"

# 4. Check CORS settings
# Verify CORS origin in server.js
```

### Issue 3: Memory Leak

**Symptoms**: Backend memory usage keeps increasing

**Solutions**:

```bash
# 1. Monitor memory
docker stats meeting-backend

# 2. Set memory limits
# In docker-compose.yml
services:
  backend:
    mem_limit: 512m

# 3. Restart service periodically
pm2 restart meeting-backend --cron "0 3 * * *"

# 4. Check for connection leaks
# Ensure database connections are properly closed
```

---

## Frontend Issues

### Issue 1: White Screen / Blank Page

**Symptoms**: Frontend shows blank page

**Solutions**:

```bash
# 1. Check browser console for errors
# Open DevTools (F12) and check Console tab

# 2. Verify build
cd frontend
npm run build
ls -la dist/

# 3. Check API connection
curl http://localhost:3001/api/health

# 4. Clear browser cache
# Ctrl+Shift+Delete

# 5. Check nginx logs
docker-compose logs frontend
```

### Issue 2: API Calls Fail (CORS Error)

**Symptoms**:
```
Access to fetch at 'http://localhost:3001/api/meetings' from origin 'http://localhost:8080' has been blocked by CORS policy
```

**Solutions**:

```javascript
// In backend/src/server.js
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000'],
  credentials: true
}));
```

### Issue 3: Search Not Working

**Symptoms**: Search returns no results

**Solutions**:

```javascript
// 1. Check API call
console.log('Search term:', searchTerm);

// 2. Test API directly
curl "http://localhost:3001/api/meetings?search=test"

// 3. Check debounce timing
// In App.jsx, adjust timeout
setTimeout(() => {
  loadMeetings(searchTerm);
}, 500);  // Increase if needed

// 4. Verify database data
psql -c "SELECT COUNT(*) FROM meeting_reports;"
```

---

## Docker Issues

### Issue 1: Docker Build Fails

**Symptoms**:
```
ERROR [internal] load metadata for docker.io/library/node:18-alpine
```

**Solutions**:

```bash
# 1. Check Docker daemon
sudo systemctl status docker

# 2. Clean Docker cache
docker system prune -a

# 3. Pull base image manually
docker pull node:18-alpine

# 4. Build without cache
docker-compose build --no-cache

# 5. Check disk space
df -h
```

### Issue 2: Container Keeps Restarting

**Symptoms**:
```
meeting-backend is restarting (exit code 1)
```

**Solutions**:

```bash
# 1. Check logs
docker-compose logs backend

# 2. Check container status
docker-compose ps

# 3. Inspect container
docker inspect meeting-backend

# 4. Run container interactively
docker-compose run backend sh

# 5. Check environment variables
docker-compose exec backend env
```

### Issue 3: Cannot Connect Between Containers

**Symptoms**: Frontend cannot reach backend

**Solutions**:

```bash
# 1. Check network
docker network ls
docker network inspect meeting-reports-system_meeting-network

# 2. Test connectivity
docker-compose exec frontend ping backend

# 3. Verify service names in docker-compose.yml
# Use service name, not localhost

# 4. Check ports
docker-compose port backend 3001
```

---

## Network Issues

### Issue 1: Cannot Access from External Network

**Symptoms**: Application works on localhost but not from other machines

**Solutions**:

```bash
# 1. Check firewall
sudo ufw status
sudo ufw allow 8080/tcp
sudo ufw allow 3001/tcp

# 2. Check nginx configuration
sudo nginx -t

# 3. Verify binding
netstat -tulpn | grep :8080

# 4. Check Docker port mapping
docker-compose ps
```

### Issue 2: Slow Response Time

**Symptoms**: API calls take too long

**Solutions**:

```bash
# 1. Test network latency
ping 192.168.100.70

# 2. Check database query performance
# See Database Issues > Slow Queries

# 3. Enable compression
# In nginx.conf
gzip on;
gzip_types text/plain application/json;

# 4. Add caching
# In nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;
```

---

## Performance Issues

### Issue 1: High CPU Usage

**Symptoms**: Server CPU at 100%

**Solutions**:

```bash
# 1. Identify process
top
htop

# 2. Check Docker stats
docker stats

# 3. Limit CPU usage
# In docker-compose.yml
services:
  backend:
    cpus: '1.0'

# 4. Optimize queries
# Add indexes, use EXPLAIN ANALYZE
```

### Issue 2: High Memory Usage

**Symptoms**: Out of memory errors

**Solutions**:

```bash
# 1. Check memory usage
free -h
docker stats

# 2. Set memory limits
# In docker-compose.yml
services:
  backend:
    mem_limit: 512m
    mem_reservation: 256m

# 3. Increase swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 4. Optimize Node.js
node --max-old-space-size=512 src/server.js
```

### Issue 3: Database Connection Pool Exhausted

**Symptoms**:
```
Error: Connection pool exhausted
```

**Solutions**:

```javascript
// In backend/src/database.js
const pool = new Pool({
  max: 20,  // Increase pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Close connections properly
app.on('exit', () => {
  pool.end();
});
```

---

## Getting Help

If you can't resolve the issue:

1. **Check Logs**:
   ```bash
   # Docker logs
   docker-compose logs -f
   
   # PM2 logs
   pm2 logs
   
   # System logs
   sudo journalctl -u nginx -f
   ```

2. **Collect Information**:
   - Error messages
   - System information (`uname -a`)
   - Docker version (`docker --version`)
   - Node version (`node --version`)
   - Database version (`psql --version`)

3. **Contact Support**:
   - Email: support@example.com
   - GitHub Issues: https://github.com/your-org/meeting-reports-system/issues
   - Documentation: https://docs.example.com

---

## Preventive Measures

### Regular Maintenance

```bash
# Weekly tasks
- Check disk space
- Review logs
- Update dependencies
- Test backups

# Monthly tasks
- Security updates
- Performance review
- Database optimization
- Documentation updates
```

### Monitoring Setup

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Setup alerts
# Use tools like Prometheus, Grafana, or Uptime Robot
```

### Best Practices

- ✅ Keep system updated
- ✅ Regular backups
- ✅ Monitor logs
- ✅ Test in staging first
- ✅ Document changes
- ✅ Use version control
- ✅ Implement health checks
- ✅ Set up alerts
