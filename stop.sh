#!/bin/bash

echo "=========================================="
echo "  Stopping Meeting Reports System"
echo "=========================================="
echo ""

# Stop and remove containers
echo "🛑 Stopping containers..."
docker-compose down

echo ""
echo "=========================================="
echo "  ✅ System Stopped Successfully!"
echo "=========================================="
echo ""
echo "To start again: ./start.sh"
echo "To remove volumes: docker-compose down -v"
echo "=========================================="
