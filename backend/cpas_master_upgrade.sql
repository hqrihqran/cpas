-- ============================================================
--  CPAS Master DB: Skills + Placement History upgrade
--  Run via: mysql -u root -p cpas_db < cpas_master_upgrade.sql
-- ============================================================

USE cpas_db;

-- ─── 1. ALTER student_skills: add proficiency_percentage ─────────────────────
-- The table already exists (from cpas_db_setup.sql), so we ADD the new column
-- safely with IF NOT EXISTS logic via a procedure.
SET @col_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'cpas_db'
      AND TABLE_NAME   = 'student_skills'
      AND COLUMN_NAME  = 'proficiency_percentage'
);

SET @sql = IF(
    @col_exists = 0,
    'ALTER TABLE student_skills ADD COLUMN proficiency_percentage INT DEFAULT 70',
    'SELECT "proficiency_percentage column already exists" AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ─── 2. CREATE placement_history table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS placement_history (
    id             INT          AUTO_INCREMENT PRIMARY KEY,
    student_id     INT          NOT NULL,
    company_name   VARCHAR(150) NOT NULL,
    rounds_cleared INT          DEFAULT 0,
    final_status   ENUM('Placed','Rejected','In-Process') DEFAULT 'In-Process',
    visit_date     DATE,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_ph_student (student_id)
);

-- ─── 3. Seed student_skills with proficiency_percentage ───────────────────────
-- Student 1 (Rahul Sharma - CSE)
INSERT INTO student_skills (student_id, skill_name, proficiency_percentage)
VALUES (1,'Java', 88), (1,'Python', 92), (1,'ML', 75)
ON DUPLICATE KEY UPDATE proficiency_percentage = VALUES(proficiency_percentage);

-- Student 2 (Priya Kapoor - CSE)
INSERT INTO student_skills (student_id, skill_name, proficiency_percentage)
VALUES (2,'C++', 85), (2,'React', 90), (2,'Node.js', 80)
ON DUPLICATE KEY UPDATE proficiency_percentage = VALUES(proficiency_percentage);

-- Student 3 (Amit Verma - IT)
INSERT INTO student_skills (student_id, skill_name, proficiency_percentage)
VALUES (3,'Python', 78), (3,'Django', 72), (3,'SQL', 85)
ON DUPLICATE KEY UPDATE proficiency_percentage = VALUES(proficiency_percentage);

-- Student 4 (Sneha Reddy - ECE)
INSERT INTO student_skills (student_id, skill_name, proficiency_percentage)
VALUES (4,'VLSI', 80), (4,'Embedded C', 75)
ON DUPLICATE KEY UPDATE proficiency_percentage = VALUES(proficiency_percentage);

-- Student 5 (Vikram Patel - ME)
INSERT INTO student_skills (student_id, skill_name, proficiency_percentage)
VALUES (5,'AutoCAD', 70), (5,'SolidWorks', 65)
ON DUPLICATE KEY UPDATE proficiency_percentage = VALUES(proficiency_percentage);

-- ─── 4. Seed placement_history ────────────────────────────────────────────────
-- Clear existing seed data to avoid duplicates on re-run
DELETE FROM placement_history WHERE student_id IN (1,2,3,4,5);

-- Hariharan A / Student 1 analogue (Rahul Sharma id=1)
INSERT INTO placement_history (student_id, company_name, rounds_cleared, final_status, visit_date) VALUES
(1, 'Google',    3, 'Placed',     '2024-11-20'),
(1, 'Microsoft', 2, 'Placed',     '2024-12-01'),
(1, 'Amazon',    2, 'Rejected',   '2024-10-15');

-- Priya Kapoor (id=2)
INSERT INTO placement_history (student_id, company_name, rounds_cleared, final_status, visit_date) VALUES
(2, 'Google',    4, 'Placed',     '2024-11-20'),
(2, 'DeepMind',  2, 'Rejected',   '2024-09-10');

-- Amit Verma (id=3)
INSERT INTO placement_history (student_id, company_name, rounds_cleared, final_status, visit_date) VALUES
(3, 'Infosys',   3, 'Placed',     '2024-08-22'),
(3, 'TCS',       1, 'Rejected',   '2024-07-18'),
(3, 'Wipro',     2, 'In-Process', '2025-01-05');

-- Sneha Reddy (id=4)
INSERT INTO placement_history (student_id, company_name, rounds_cleared, final_status, visit_date) VALUES
(4, 'Texas Instruments', 2, 'In-Process', '2025-02-10'),
(4, 'Qualcomm',          1, 'Rejected',   '2024-11-30');

-- Vikram Patel (id=5)
INSERT INTO placement_history (student_id, company_name, rounds_cleared, final_status, visit_date) VALUES
(5, 'Tata Motors', 1, 'Rejected',   '2024-10-05'),
(5, 'L&T',         2, 'In-Process', '2025-01-20');

-- ─── 5. Verify ────────────────────────────────────────────────────────────────
SELECT 'student_skills'   AS tbl, COUNT(*) AS rows FROM student_skills
UNION ALL
SELECT 'placement_history', COUNT(*) FROM placement_history;
