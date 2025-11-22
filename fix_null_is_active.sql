-- ============================================
-- Fix NULL values in is_active columns
-- Date: 21 November 2568 (2025)
-- Description: Update existing records to have is_active = TRUE
-- ============================================

BEGIN;

-- ============================================
-- Update meeting_agendas
-- ============================================
UPDATE meeting_agendas 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- ============================================
-- Update agenda_files
-- ============================================
UPDATE agenda_files 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- ============================================
-- Update meeting_reports
-- ============================================
UPDATE meeting_reports 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- ============================================
-- Verify results
-- ============================================
SELECT 
  'meeting_agendas' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN is_active IS NULL THEN 1 ELSE 0 END) as null_count,
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count,
  SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as deleted_count
FROM meeting_agendas
UNION ALL
SELECT 
  'agenda_files',
  COUNT(*),
  SUM(CASE WHEN is_active IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END),
  SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END)
FROM agenda_files
UNION ALL
SELECT 
  'meeting_reports',
  COUNT(*),
  SUM(CASE WHEN is_active IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END),
  SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END)
FROM meeting_reports;

COMMIT;

-- ============================================
-- Expected Result:
-- All null_count should be 0
-- All active_count should equal total_records
-- ============================================
