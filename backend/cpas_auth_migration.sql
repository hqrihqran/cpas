-- ============================================================
--  CPAS Auth Migration – run ONCE against cpas_db
--  Adds Google OAuth support + relaxes password_hash constraint
-- ============================================================

USE cpas_db;

-- 1. Allow empty password_hash for Google OAuth users
ALTER TABLE users
    MODIFY COLUMN password_hash VARCHAR(64) NOT NULL DEFAULT '';

-- 2. Add google_id column for OAuth identity linking (optional)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) NULL UNIQUE AFTER password_hash;

-- 3. Seed a demo admin account for testing
--    password = "admin123"  (SHA-256 hex)
INSERT IGNORE INTO users (email, password_hash, full_name, role) VALUES
    ('hariharana.cb23@bitsathy.ac.in',
     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
     'Campus Admin',
     'Admin'),
    ('faculty@cpas.dev',
     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
     'Prof. Krishnamurthy',
     'Faculty'),
    ('management@cpas.dev',
     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
     'Dean Ramanujan',
     'Management'),
    ('student@cpas.dev',
     'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
     'Rahul Sharma',
     'Student');
