#!/bin/bash

echo "=========================================="
echo "  Database Backup Script"
echo "=========================================="
echo ""

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_HOST="192.168.100.70"
DB_PORT="5432"
DB_NAME="meeting_mgmt"
DB_USER="postgres"
FILENAME="meeting_mgmt_$DATE.sql"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "📦 Starting backup..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Timestamp: $DATE"
echo ""

# Perform backup
echo "🔄 Dumping database..."
PGPASSWORD=grespost pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/$FILENAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database dump successful${NC}"
    
    # Compress backup
    echo "🗜️  Compressing backup..."
    gzip "$BACKUP_DIR/$FILENAME"
    
    if [ $? -eq 0 ]; then
        COMPRESSED_FILE="$FILENAME.gz"
        FILE_SIZE=$(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)
        echo -e "${GREEN}✅ Compression successful${NC}"
        echo "File: $COMPRESSED_FILE"
        echo "Size: $FILE_SIZE"
    else
        echo -e "${RED}❌ Compression failed${NC}"
        exit 1
    fi
    
    # Clean old backups (keep last 7 days)
    echo ""
    echo "🧹 Cleaning old backups..."
    find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete
    
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.gz 2>/dev/null | wc -l)
    echo "Backups retained: $BACKUP_COUNT"
    
    echo ""
    echo "=========================================="
    echo -e "  ${GREEN}✅ Backup Complete!${NC}"
    echo "=========================================="
    echo "Location: $BACKUP_DIR/$COMPRESSED_FILE"
    echo ""
    
else
    echo -e "${RED}❌ Database dump failed${NC}"
    exit 1
fi
