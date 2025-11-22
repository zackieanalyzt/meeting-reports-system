-- ============================================
-- Migration: Add Soft Delete Support
-- Date: 21 November 2568 (2025)
-- Description: Add is_active and deleted_at columns
-- ============================================

BEGIN;

-- ============================================
-- 1. Add columns to meeting_agendas
-- ============================================
ALTER TABLE meeting_agendas
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- ============================================
-- 2. Add columns to agenda_files
-- ============================================
ALTER TABLE agenda_files
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- ============================================
-- 3. Add columns to meeting_reports
-- ============================================
ALTER TABLE meeting_reports
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- ============================================
-- 4. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_meeting_agendas_is_active 
ON meeting_agendas(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_agenda_files_is_active 
ON agenda_files(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_meeting_reports_is_active 
ON meeting_reports(is_active) WHERE is_active = TRUE;

-- ============================================
-- 5. Update existing records (set all to active)
-- ============================================
UPDATE meeting_agendas SET is_active = TRUE WHERE is_active IS NULL;
UPDATE agenda_files SET is_active = TRUE WHERE is_active IS NULL;
UPDATE meeting_reports SET is_active = TRUE WHERE is_active IS NULL;

COMMIT;

-- ============================================
-- Verification Queries (run after migration)
-- ============================================

-- Check columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'meeting_agendas'
AND column_name IN ('is_active', 'deleted_at');

-- Check indexes were created
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('meeting_agendas', 'agenda_files', 'meeting_reports')
AND indexname LIKE '%is_active%';

-- Count active records
SELECT 
  'meeting_agendas' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_records,
  SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as deleted_records
FROM meeting_agendas
UNION ALL
SELECT 
  'agenda_files',
  COUNT(*),
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END),
  SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END)
FROM agenda_files
UNION ALL
SELECT 
  'meeting_reports',
  COUNT(*),
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END),
  SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END)
FROM meeting_reports;
