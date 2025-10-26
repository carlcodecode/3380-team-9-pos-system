-- File: migration_2024_10_25.sql
-- Target DB: bento_pos
-- Notes:
-- - Add PERMISSIONS (INT UNSIGNED, default 0) to STAFF
-- - Rename SALE_EVENT.sitewide_promo_type -> sitewide_event_type
-- - Change SALE_EVENT.sitewide_event_type to BOOLEAN (alias of TINYINT(1))

USE `bento_pos`;

-- 1) Add column to STAFF (check if it exists first to avoid errors)
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'bento_pos' AND TABLE_NAME = 'STAFF' AND COLUMN_NAME = 'PERMISSIONS');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `STAFF` ADD COLUMN `PERMISSIONS` INT UNSIGNED NOT NULL DEFAULT 0', 'SELECT "Column PERMISSIONS already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) Add CHECK constraint only if it doesn't exist
SET @constraint_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                          WHERE TABLE_SCHEMA = 'bento_pos' AND TABLE_NAME = 'STAFF' AND CONSTRAINT_NAME = 'check_staff_perm_range' AND CONSTRAINT_TYPE = 'CHECK');
SET @constraint_sql = IF(@constraint_exists = 0, 'ALTER TABLE `STAFF` ADD CONSTRAINT `check_staff_perm_range` CHECK (`PERMISSIONS` BETWEEN 0 AND 63)', 'SELECT "Constraint check_staff_perm_range already exists"');
PREPARE constraint_stmt FROM @constraint_sql;
EXECUTE constraint_stmt;
DEALLOCATE PREPARE constraint_stmt;

-- 3) Rename and modify column on SALE_EVENT
-- First, check if the old column exists
SET @old_column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_SCHEMA = 'bento_pos' AND TABLE_NAME = 'SALE_EVENT' AND COLUMN_NAME = 'sitewide_promo_type');
SET @rename_sql = IF(@old_column_exists > 0, 'ALTER TABLE `SALE_EVENT` RENAME COLUMN `sitewide_promo_type` TO `sitewide_event_type`', 'SELECT "Column sitewide_promo_type does not exist or already renamed"');
PREPARE rename_stmt FROM @rename_sql;
EXECUTE rename_stmt;
DEALLOCATE PREPARE rename_stmt;

-- Then modify the column (assuming it now exists as sitewide_event_type)
-- Check if the column exists before modifying
SET @event_type_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_SCHEMA = 'bento_pos' AND TABLE_NAME = 'SALE_EVENT' AND COLUMN_NAME = 'sitewide_event_type');
SET @modify_sql = IF(@event_type_exists > 0, 'ALTER TABLE `SALE_EVENT` MODIFY COLUMN `sitewide_event_type` BOOLEAN', 'SELECT "Column sitewide_event_type does not exist"');
PREPARE modify_stmt FROM @modify_sql;
EXECUTE modify_stmt;
DEALLOCATE PREPARE modify_stmt;

-- Optional sanity checks (fine to keep during manual runs)
DESCRIBE `STAFF`;
DESCRIBE `SALE_EVENT`;

