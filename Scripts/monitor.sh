#!/bin/bash

echo "=========================================="
echo "  System Monitoring Dashboard"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check service
check_service() {
    local name=$1
    local url=$2
    
    if curl -f -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name is UP${NC}"
        return 0
    else
        echo -e "${RED}❌ $name is DOWN${NC}"
        return 1
    fi
}

# Function to get response time
get_response_time() {
    local url=$1
    local time=$(curl -o /dev/null -s -w '%{time_total}' "$url")
    echo "${time}s"
}

# Header
echo -e "${BLUE}=== Service Status ===${NC}"
echo ""

# Check Backend
echo -n "Backend API:        "
check_service "Backend" "http://localhost:3001/api/health"
if [ $? -eq 0 ]; then
    response_time=$(get_response_time "http://localhost:3001/api/health")
    echo "                    Response time: $response_time"
fi
echo ""

# Check Frontend
echo -n "Frontend:           "
check_service "Frontend" "http://localhost:8080"
if [ $? -eq 0 ]; then
    response_time=$(get_response_time "http://localhost:8080")
    echo "                    Response time: $response_time"
fi
echo ""

# Check Database
echo -n "Database:           "
if psql -h 192.168.100.70 -U postgres -d meeting_mgmt -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is UP${NC}"
    
    # Get database stats
    record_count=$(psql -h 192.168.100.70 -U postgres -d meeting_mgmt -t -c "SELECT COUNT(*) FROM meeting_reports;" 2>/dev/null | tr -d ' ')
    echo "                    Records: $record_count"
else
    echo -e "${RED}❌ Database is DOWN${NC}"
fi
echo ""

# Docker Status
echo -e "${BLUE}=== Docker Containers ===${NC}"
echo ""
docker-compose ps
echo ""

# System Resources
echo -e "${BLUE}=== System Resources ===${NC}"
echo ""

# CPU Usage
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "  " 100 - $1"%"}'
echo ""

# Memory Usage
echo "Memory Usage:"
free -h | awk 'NR==2{printf "  Used: %s / %s (%.2f%%)\n", $3, $2, $3*100/$2}'
echo ""

# Disk Usage
echo "Disk Usage:"
df -h / | awk 'NR==2{printf "  Used: %s / %s (%s)\n", $3, $2, $5}'
echo ""

# Docker Stats
echo -e "${BLUE}=== Docker Resource Usage ===${NC}"
echo ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo ""

# Recent Logs
echo -e "${BLUE}=== Recent Errors (Last 10) ===${NC}"
echo ""
docker-compose logs --tail=10 | grep -i error || echo "No recent errors"
echo ""

# Backup Status
echo -e "${BLUE}=== Backup Status ===${NC}"
echo ""
if [ -d "./backups" ]; then
    latest_backup=$(ls -t ./backups/*.gz 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
        backup_date=$(stat -c %y "$latest_backup" 2>/dev/null || stat -f %Sm "$latest_backup" 2>/dev/null)
        backup_size=$(du -h "$latest_backup" | cut -f1)
        echo "Latest backup: $(basename $latest_backup)"
        echo "Date: $backup_date"
        echo "Size: $backup_size"
    else
        echo -e "${YELLOW}⚠️  No backups found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Backup directory not found${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "  ${GREEN}Monitoring Complete${NC}"
echo "=========================================="
echo ""
echo "To view live logs: docker-compose logs -f"
echo "To restart services: docker-compose restart"
echo "=========================================="
