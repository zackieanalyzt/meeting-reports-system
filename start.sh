#!/bin/bash

echo "=========================================="
echo "  Starting Meeting Reports System"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check backend health
echo "🔍 Checking backend health..."
for i in {1..10}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "⚠️  Backend health check timeout"
    fi
    sleep 2
done

echo ""
echo "=========================================="
echo "  ✅ System Started Successfully!"
echo "=========================================="
echo ""
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:3001"
echo "💚 Health Check: http://localhost:3001/api/health"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: ./stop.sh"
echo "=========================================="
