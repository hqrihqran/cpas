-- ============================================================
--  CPAS Pipelined System Migration
--  Run via: mysql -u root -p cpas_db < cpas_pipelined_migration.sql
--  Or paste into MySQL Workbench after selecting cpas_db.
-- ============================================================

USE cpas_db;

-- ─── 1. PIPELINED COMPANIES ───────────────────────────────────────────────────
--  Stores companies that are part of the ongoing 'pipeline' (upcoming drives).
--  Distinct from `companies` (job postings) – these are drive-centric records.
CREATE TABLE IF NOT EXISTS pipelined_companies (
    id                INT           AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(150)  NOT NULL,
    logo_url          VARCHAR(500),                    -- hosted image (S3, Firebase, etc.)
    drive_date        DATE,                            -- scheduled campus drive date
    eligibility_cgpa  DECIMAL(4,2)  NOT NULL DEFAULT 6.00,
    location          VARCHAR(150),
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pc_drive_date (drive_date),
    INDEX idx_pc_cgpa       (eligibility_cgpa)
);

-- ─── 2. COMPANY REQUIREMENTS ─────────────────────────────────────────────────
--  Skill requirements per pipelined company, with minimum proficiency threshold.
CREATE TABLE IF NOT EXISTS company_requirements (
    id                      INT          AUTO_INCREMENT PRIMARY KEY,
    company_id              INT          NOT NULL,
    skill_name              VARCHAR(100) NOT NULL,
    min_proficiency_required TINYINT UNSIGNED NOT NULL DEFAULT 60   -- 0-100
        CHECK (min_proficiency_required BETWEEN 0 AND 100),
    FOREIGN KEY (company_id) REFERENCES pipelined_companies(id) ON DELETE CASCADE,
    UNIQUE KEY uq_company_skill_req (company_id, skill_name),
    INDEX idx_cr_skill (skill_name)
);

-- ─── 3. INTERVIEW EXPERIENCES ─────────────────────────────────────────────────
--  PDF-backed interview experience uploads by students.
CREATE TABLE IF NOT EXISTS interview_experiences (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    company_id   INT          NOT NULL,
    student_id   INT          NOT NULL,               -- uploader
    pdf_url      VARCHAR(500) NOT NULL,               -- S3 / Firebase Storage URL
    year_of_drive YEAR        NOT NULL,
    uploaded_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES pipelined_companies(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id)            ON DELETE CASCADE,
    INDEX idx_ie_company (company_id),
    INDEX idx_ie_student (student_id),
    INDEX idx_ie_year    (year_of_drive)
);

-- ─── 4. STUDENT PIPELINES ─────────────────────────────────────────────────────
--  Junction table tracking each student's interest / eligibility / scheduling
--  status for every pipelined company.
CREATE TABLE IF NOT EXISTS student_pipelines (
    id         INT  AUTO_INCREMENT PRIMARY KEY,
    student_id INT  NOT NULL,
    company_id INT  NOT NULL,
    status     ENUM('Interested','Eligible','Scheduled') NOT NULL DEFAULT 'Interested',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)            ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES pipelined_companies(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_company_pipeline (student_id, company_id),
    INDEX idx_sp_student (student_id),
    INDEX idx_sp_status  (status)
);

-- ─── 5. SCHEDULED TRAININGS ──────────────────────────────────────────────────
--  System-scheduled training sessions to address skill shortfalls.
CREATE TABLE IF NOT EXISTS scheduled_trainings (
    id                        INT           AUTO_INCREMENT PRIMARY KEY,
    skill_name                VARCHAR(100)  NOT NULL,
    trainer_name              VARCHAR(150)  NOT NULL,
    date_time                 DATETIME      NOT NULL,
    target_shortfall_percentage TINYINT UNSIGNED NOT NULL DEFAULT 0
        CHECK (target_shortfall_percentage BETWEEN 0 AND 100),
    notify_students           TINYINT(1)    DEFAULT 0,
    created_at                TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_st_skill     (skill_name),
    INDEX idx_st_date_time (date_time)
);

-- ============================================================
--  SAMPLE SEED DATA  (safe to re-run – uses INSERT IGNORE)
-- ============================================================

INSERT IGNORE INTO pipelined_companies (id, name, logo_url, drive_date, eligibility_cgpa, location) VALUES
    (1, 'Google',    'https://logo.clearbit.com/google.com',    '2026-04-15', 7.50, 'Bangalore'),
    (2, 'Microsoft', 'https://logo.clearbit.com/microsoft.com', '2026-04-22', 7.00, 'Hyderabad'),
    (3, 'Amazon',    'https://logo.clearbit.com/amazon.com',    '2026-05-05', 6.50, 'Pune'),
    (4, 'Zoho',      'https://logo.clearbit.com/zoho.com',      '2026-05-12', 6.00, 'Chennai');

INSERT IGNORE INTO company_requirements (company_id, skill_name, min_proficiency_required) VALUES
    -- Google
    (1, 'Python',          80),
    (1, 'Data Structures', 85),
    (1, 'System Design',   75),
    -- Microsoft
    (2, 'Java',            75),
    (2, 'Cloud (Azure)',   70),
    (2, 'SQL',             65),
    -- Amazon
    (3, 'Python',          70),
    (3, 'AWS',             80),
    (3, 'Docker',          65),
    -- Zoho
    (4, 'Java',            60),
    (4, 'React',           60),
    (4, 'MySQL',           60);

-- Interview experience PDFs  (student_id references existing seed students)
INSERT IGNORE INTO interview_experiences (id, company_id, student_id, pdf_url, year_of_drive) VALUES
    (1, 1, 2, 'https://storage.example.com/ie/google_2024_priya.pdf',    2024),
    (2, 2, 1, 'https://storage.example.com/ie/microsoft_2024_rahul.pdf', 2024),
    (3, 3, 9, 'https://storage.example.com/ie/amazon_2024_arjun.pdf',    2024);

INSERT IGNORE INTO student_pipelines (student_id, company_id, status) VALUES
    (1, 1, 'Eligible'),
    (1, 2, 'Scheduled'),
    (2, 1, 'Scheduled'),
    (3, 3, 'Interested'),
    (9, 3, 'Eligible');

INSERT IGNORE INTO scheduled_trainings (skill_name, trainer_name, date_time, target_shortfall_percentage) VALUES
    ('Python',          'Dr. Ramesh Kumar', '2026-04-01 10:00:00', 40),
    ('Data Structures', 'Prof. Anita Singh', '2026-04-03 14:00:00', 55),
    ('AWS',             'Mr. Vikrant Joshi', '2026-04-06 09:30:00', 35);

-- ============================================================
--  VERIFY
-- ============================================================
SELECT 'pipelined_companies'  AS tbl, COUNT(*) AS rows FROM pipelined_companies
UNION ALL SELECT 'company_requirements',     COUNT(*) FROM company_requirements
UNION ALL SELECT 'interview_experiences',    COUNT(*) FROM interview_experiences
UNION ALL SELECT 'student_pipelines',        COUNT(*) FROM student_pipelines
UNION ALL SELECT 'scheduled_trainings',      COUNT(*) FROM scheduled_trainings;
