#!/bin/bash

echo "=========================================="
echo "  Meeting Reports System - Dev Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "🔍 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18.x or higher"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check npm
echo "🔍 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

# Check PostgreSQL
echo "🔍 Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found${NC}"
    echo "Install with: sudo apt install postgresql-client"
fi

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your database credentials${NC}"
fi

echo "Installing dependencies..."
npm install

echo -e "${GREEN}✅ Backend setup complete${NC}"

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd ../frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

echo "Installing dependencies..."
npm install

echo -e "${GREEN}✅ Frontend setup complete${NC}"

# Database Setup
echo ""
echo "🗄️  Database Setup..."
read -p "Do you want to initialize the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd ..
    echo "Please enter database credentials:"
    read -p "Host (default: 192.168.100.70): " DB_HOST
    DB_HOST=${DB_HOST:-192.168.100.70}
    
    read -p "Port (default: 5432): " DB_PORT
    DB_PORT=${DB_PORT:-5432}
    
    read -p "Database (default: meeting_mgmt): " DB_NAME
    DB_NAME=${DB_NAME:-meeting_mgmt}
    
    read -p "User (default: postgres): " DB_USER
    DB_USER=${DB_USER:-postgres}
    
    echo "Importing database schema..."
    PGPASSWORD=grespost psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f init.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database initialized successfully${NC}"
    else
        echo -e "${RED}❌ Database initialization failed${NC}"
    fi
fi

# Summary
echo ""
echo "=========================================="
echo "  ✅ Development Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Edit backend/.env with your database credentials"
echo ""
echo "2. Start Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Start Frontend (in new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Access application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "=========================================="
