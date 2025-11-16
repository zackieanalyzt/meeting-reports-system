#!/bin/bash

echo "=========================================="
echo "  Production Deployment Script"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
BACKUP_DIR="./backups"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}❌ Please do not run as root${NC}"
    exit 1
fi

# Check Docker
echo "🔍 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

# Check Docker Compose
echo "🔍 Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose found${NC}"

# Confirm deployment
echo ""
echo -e "${YELLOW}⚠️  WARNING: This will deploy to PRODUCTION${NC}"
read -p "Are you sure you want to continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

# Backup database
echo ""
echo "💾 Creating database backup..."
./Scripts/backup-db.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backup failed${NC}"
    read -p "Continue anyway? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        exit 1
    fi
fi

# Pull latest code
echo ""
echo "📥 Pulling latest code..."
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Code updated${NC}"

# Build images
echo ""
echo "🔨 Building Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Stop old containers
echo ""
echo "🛑 Stopping old containers..."
docker-compose -f $COMPOSE_FILE down
echo -e "${GREEN}✅ Old containers stopped${NC}"

# Start new containers
echo ""
echo "🚀 Starting new containers..."
docker-compose -f $COMPOSE_FILE up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Rolling back..."
    docker-compose -f $COMPOSE_FILE down
    exit 1
fi
echo -e "${GREEN}✅ Containers started${NC}"

# Wait for services
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Health check
echo ""
echo "🔍 Performing health check..."
for i in {1..10}; do
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Backend health check failed${NC}"
        echo "Check logs: docker-compose -f $COMPOSE_FILE logs backend"
        exit 1
    fi
    sleep 3
done

if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    echo "Check logs: docker-compose -f $COMPOSE_FILE logs frontend"
    exit 1
fi

# Show status
echo ""
echo "📊 Container Status:"
docker-compose -f $COMPOSE_FILE ps

# Summary
echo ""
echo "=========================================="
echo -e "  ${GREEN}✅ Deployment Successful!${NC}"
echo "=========================================="
echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/api/health"
echo ""
echo "📝 Useful Commands:"
echo "   View logs:    docker-compose -f $COMPOSE_FILE logs -f"
echo "   Stop:         docker-compose -f $COMPOSE_FILE down"
echo "   Restart:      docker-compose -f $COMPOSE_FILE restart"
echo "   Status:       docker-compose -f $COMPOSE_FILE ps"
echo ""
echo "=========================================="
