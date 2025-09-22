#!/bin/bash

# Bel Energy Portal - Database Backup Script
# Run this on the VPS before deployment

echo '📦 Creating database backup...'

# Create backup directory
mkdir -p /root/backups

# Backup database
BACKUP_FILE="/root/backups/belenergy_backup_$(date +%Y%m%d_%H%M%S).sql"
sudo -u postgres pg_dump belenergy_prod > "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"
echo '📊 Backup size:' $(du -h "$BACKUP_FILE" | cut -f1)
echo ''
echo '🗂️ Recent backups:'
ls -la /root/backups/ | head -10

echo ''
echo '💡 To restore: sudo -u postgres psql belenergy_prod < $BACKUP_FILE'

