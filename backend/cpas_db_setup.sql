-- ============================================================
--  Campus Compass Placement System (CPAS)
--  MySQL Database Setup Script
--  Run this file in MySQL Workbench or via CLI:
--    mysql -u root -p < cpas_db_setup.sql
-- ============================================================

-- ─── 1. Create & select database ────────────────────────────────────────────
CREATE DATABASE IF NOT EXISTS cpas_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cpas_db;

-- ─── 2. DEPARTMENTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    code       VARCHAR(20)  NOT NULL UNIQUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─── 3. STUDENTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
    id                  INT           AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(150)  NOT NULL,
    roll_no             VARCHAR(50)   NOT NULL UNIQUE,
    branch              VARCHAR(50)   NOT NULL,           -- 'CSE','IT','ECE', etc.
    batch               VARCHAR(10)   NOT NULL,           -- e.g. '2025'
    cgpa                DECIMAL(4,2)  DEFAULT 0.00,
    internship          VARCHAR(255),
    placement_status    ENUM('Placed','Unplaced','In Process') DEFAULT 'Unplaced',
    company             VARCHAR(150),                      -- placed company name
    ctc                 DECIMAL(6,2),                      -- CTC in LPA
    stipend             DECIMAL(6,2),                      -- internship stipend in LPA
    event_date          DATE,                              -- placement event date
    history_of_arrears  INT           DEFAULT 0,
    current_arrears     INT           DEFAULT 0,
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch   (branch),
    INDEX idx_batch    (batch),
    INDEX idx_status   (placement_status),
    INDEX idx_cgpa     (cgpa)
);

-- ─── 4. STUDENT SKILLS (many-to-one) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_skills (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    student_id  INT          NOT NULL,
    skill_name  VARCHAR(100) NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_skill (student_id, skill_name)
);

-- ─── 5. COMPANIES (visiting companies / job postings) ────────────────────────
CREATE TABLE IF NOT EXISTS companies (
    id             INT           AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(150)  NOT NULL,
    role           VARCHAR(150),
    salary_range   VARCHAR(50),              -- e.g. '12 - 15 LPA'
    location       VARCHAR(100),
    required_cgpa  DECIMAL(4,2)  DEFAULT 0.00,
    description    TEXT,
    offers_count   INT           DEFAULT 0,  -- derived / cached count
    avg_ctc        DECIMAL(6,2),
    highest_ctc    DECIMAL(6,2),
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ─── 6. COMPANY REQUIRED SKILLS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_skills (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    company_id  INT          NOT NULL,
    skill_name  VARCHAR(100) NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY uq_company_skill (company_id, skill_name)
);

-- ─── 7. COMPANY CTC BREAKDOWN ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_ctc_breakdown (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    company_id  INT          NOT NULL,
    label       VARCHAR(100) NOT NULL,   -- e.g. 'Base Salary'
    amount      VARCHAR(50)  NOT NULL,   -- e.g. '10 LPA'
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- ─── 8. APPLICATIONS (student → company) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
    id               INT          AUTO_INCREMENT PRIMARY KEY,
    student_id       INT          NOT NULL,
    company_name     VARCHAR(150) NOT NULL,
    visit_date       DATE,
    package_offered  DECIMAL(6,2) DEFAULT 0.00,
    status           ENUM('Selected','Rejected','In Process') DEFAULT 'In Process',
    feedback         TEXT,
    created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_app_student (student_id),
    INDEX idx_app_status  (status)
);

-- ─── 9. APPLICATION ROUNDS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_rounds (
    id             INT          AUTO_INCREMENT PRIMARY KEY,
    application_id INT          NOT NULL,
    round_name     VARCHAR(100) NOT NULL,
    status         ENUM('Cleared','Failed','Pending') DEFAULT 'Pending',
    round_order    INT          DEFAULT 0,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- ─── 10. APPLICATION INTERVIEWERS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_interviewers (
    id             INT          AUTO_INCREMENT PRIMARY KEY,
    application_id INT          NOT NULL,
    interviewer_name VARCHAR(150) NOT NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- ─── 11. USERS (auth & role management) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id             INT          AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(200) NOT NULL UNIQUE,
    password_hash  VARCHAR(64)  NOT NULL,               -- SHA-256 hex (upgrade to bcrypt in prod)
    full_name      VARCHAR(150) NOT NULL,
    role           ENUM('Student','Faculty','Management','Admin','Company') NOT NULL,
    student_id     INT          NULL,                   -- link to students table if role=Student
    is_active      TINYINT(1)   DEFAULT 1,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

-- ─── 12. HOMEWORK TASKS (faculty → students) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS homework_tasks (
    id                    INT          AUTO_INCREMENT PRIMARY KEY,
    title                 VARCHAR(255) NOT NULL,
    description           TEXT,
    deadline              DATE,
    created_by_faculty_id INT          NULL,            -- FK to users where role='Faculty'
    created_at            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_faculty_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── 13. HOMEWORK: ASSIGNED ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework_assigned (
    task_id    INT NOT NULL,
    student_id INT NOT NULL,
    PRIMARY KEY (task_id, student_id),
    FOREIGN KEY (task_id)    REFERENCES homework_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id)       ON DELETE CASCADE
);

-- ─── 14. HOMEWORK: VIEWED ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework_viewed (
    task_id    INT       NOT NULL,
    student_id INT       NOT NULL,
    viewed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, student_id),
    FOREIGN KEY (task_id)    REFERENCES homework_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id)       ON DELETE CASCADE
);

-- ─── 15. HOMEWORK: COMPLETED ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework_completed (
    task_id       INT       NOT NULL,
    student_id    INT       NOT NULL,
    completed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, student_id),
    FOREIGN KEY (task_id)    REFERENCES homework_tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id)       ON DELETE CASCADE
);

-- ─── 16. COMMUNITY INSIGHTS (interview experiences) ──────────────────────────
CREATE TABLE IF NOT EXISTS community_insights (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    student_id   INT          NULL,
    student_name VARCHAR(150) NOT NULL,
    company      VARCHAR(150) NOT NULL,
    role         VARCHAR(150),
    type         ENUM('Interview','Exam','General') DEFAULT 'Interview',
    content      TEXT         NOT NULL,
    likes        INT          DEFAULT 0,
    comments     INT          DEFAULT 0,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FULLTEXT INDEX ft_insight_search (company, role, content)
);

-- ─── 17. FACULTY–STUDENT MENTORSHIP ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faculty_mentees (
    faculty_id INT NOT NULL,    -- FK to users where role='Faculty'
    student_id INT NOT NULL,
    PRIMARY KEY (faculty_id, student_id),
    FOREIGN KEY (faculty_id) REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ============================================================
--  SEED DATA (matches frontend mock data exactly)
-- ============================================================

-- Departments
INSERT IGNORE INTO departments (name, code) VALUES
    ('Computer Science & Engineering',        'CSE'),
    ('Computer Science & Business Systems',   'CSBS'),
    ('Information Technology',                'IT'),
    ('Electronics & Communication Engg.',     'ECE'),
    ('Mechanical Engineering',                'ME'),
    ('Civil Engineering',                     'CE'),
    ('Electrical Engineering',                'EE');

-- Students
INSERT IGNORE INTO students
    (id, name, roll_no, branch, batch, cgpa, internship, placement_status, company, ctc, event_date, history_of_arrears, current_arrears)
VALUES
    (1,  'Rahul Sharma',   'CSE2021001',   'CSE',  '2025', 8.50, 'Google (Summer 2024)',         'Placed',     'Microsoft', 18.50, '2024-12-15', 0, 0),
    (2,  'Priya Kapoor',   'CSE2021015',   'CSE',  '2025', 9.10, 'Amazon (Summer 2024)',          'Placed',     'Google',    30.00, '2024-11-20', 0, 0),
    (3,  'Amit Verma',     'IT2021008',    'IT',   '2025', 7.80, 'Infosys (Summer 2024)',         'Placed',     'Deloitte',   8.00, '2025-01-10', 1, 0),
    (4,  'Sneha Reddy',    'ECE2021023',   'ECE',  '2025', 8.20, 'Texas Instruments',             'In Process', NULL,         NULL,  NULL,         0, 0),
    (5,  'Vikram Patel',   'ME2021011',    'ME',   '2025', 7.00, 'Tata Motors',                   'Unplaced',   NULL,         NULL,  NULL,         2, 1),
    (6,  'Neha Gupta',     'CSBS2021003',  'CSBS', '2025', 8.80, 'Deloitte',                      'Placed',     'Amazon',    14.50, '2024-12-22', 0, 0),
    (7,  'Karan Joshi',    'CE2021017',    'CE',   '2025', 6.50, 'L&T',                            'Unplaced',   NULL,         NULL,  NULL,         3, 2),
    (8,  'Deepa Lakshmi',  'CSE2021029',   'CSE',  '2025', 7.50, 'TCS',                           'Placed',     'Infosys',    5.00, '2025-01-05', 0, 0),
    (9,  'Arjun Nair',     'IT2021042',    'IT',   '2025', 9.00, 'Microsoft',                     'Placed',     'Microsoft', 24.00, '2024-11-28', 0, 0),
    (10, 'Meera Thomas',   'EE2021006',    'EE',   '2025', 7.20, 'Siemens',                       'In Process', NULL,         NULL,  NULL,         1, 0),
    (11, 'Suresh Babu',    'CSE2021033',   'CSE',  '2024', 8.30, 'NVIDIA',                        'Placed',     'Amazon',    20.00, '2024-02-15', 0, 0),
    (12, 'Kavya Menon',    'CSBS2021009',  'CSBS', '2024', 8.70, 'McKinsey',                      'Placed',     'Deloitte',  12.00, '2024-01-20', 0, 0);

-- Student skills
INSERT IGNORE INTO student_skills (student_id, skill_name) VALUES
    (1, 'Java'), (1, 'Python'), (1, 'ML'),
    (2, 'C++'),  (2, 'React'),  (2, 'Node.js'),
    (3, 'Python'),(3, 'Django'),(3, 'SQL'),
    (4, 'VLSI'), (4, 'Embedded C'),
    (5, 'AutoCAD'),(5, 'SolidWorks'),
    (6, 'Data Analytics'),(6, 'Tableau'),(6, 'Python'),
    (7, 'Civil Design'),(7, 'AutoCAD'),
    (8, 'Java'), (8, 'Spring Boot'),
    (9, 'Full Stack'),(9, 'AWS'),(9, 'Docker'),
    (10,'Power Systems'),(10,'MATLAB'),
    (11,'AI/ML'),(11,'TensorFlow'),
    (12,'Data Science'),(12,'R'),(12,'SQL');

-- Companies (job postings)
INSERT IGNORE INTO companies (id, name, role, salary_range, location, required_cgpa, description) VALUES
    (1, 'InnovateTech', 'Frontend Developer',  '12 - 15 LPA', 'Bangalore', 7.0,
       'InnovateTech provides cutting-edge digital solutions for global enterprises.'),
    (2, 'DataStreams',   'Data Analyst',        '8 - 10 LPA',  'Pune',      7.5,
       'DataStreams is a big data analytics firm helping businesses make data-driven decisions.'),
    (3, 'CyberSafe',    'Security Analyst',    '10 - 12 LPA', 'Hyderabad', 8.5,
       'CyberSafe is a leader in cybersecurity solutions.'),
    (4, 'CloudScale',   'DevOps Engineer',     '14 - 18 LPA', 'Remote',    7.0,
       'CloudScale specialises in cloud infrastructure and DevOps automation.');

INSERT IGNORE INTO company_skills (company_id, skill_name) VALUES
    (1,'React'),(1,'TypeScript'),(1,'Redux'),
    (2,'Python'),(2,'SQL'),(2,'Tableau'),
    (3,'Network Security'),(3,'Python'),(3,'Linux'),
    (4,'AWS'),(4,'Docker'),(4,'Kubernetes');

INSERT IGNORE INTO company_ctc_breakdown (company_id, label, amount) VALUES
    (1,'Base Salary','10 LPA'),(1,'Performance Bonus','2 LPA'),(1,'Joining Bonus','1 LPA'),(1,'Stock Options','2 LPA'),
    (2,'Base Salary','7 LPA'),(2,'Variable Pay','2 LPA'),(2,'Benefits','1 LPA'),
    (3,'Fixed Component','9 LPA'),(3,'Retention Bonus','3 LPA'),
    (4,'Base','12 LPA'),(4,'Remote Allowance','2 LPA'),(4,'Stocks','4 LPA');

-- Community insights
INSERT IGNORE INTO community_insights (id, student_name, company, role, type, content, likes, comments) VALUES
    (1, 'Alex Johnson', 'Google',    'SDE I',           'Interview',
       'The interview focused heavily on graph algorithms and dynamic programming. 3 rounds of coding and 1 system design. Be prepared for complex graph traversal and DP optimisation problems. Tip: practice Dijkstra and BFS/DFS thoroughly.', 45, 12),
    (2, 'Sarah Smith',  'Microsoft', 'Product Manager', 'Interview',
       'Asked about product design for a vending machine for the blind. Focus on empathy and user constraints. Behavioral questions were standard STAR format. Research the company culture in depth beforehand.', 32, 8),
    (3, 'Mike Brown',   'Amazon',    'SDE Intern',      'Exam',
       'Online assessment had 2 coding questions. One array manipulation and one sliding window. 90 minutes. Test cases were tricky — watch out for edge cases like empty arrays and large inputs.', 28, 5);

-- Homework tasks (demo)
INSERT IGNORE INTO homework_tasks (id, title, description, deadline) VALUES
    (1, 'Resume Refinement', 'Please update your resume with recent internships and match the college template.', '2025-05-20'),
    (2, 'DSA Practice Test 1', 'Complete the array and string manipulation questions on LeetCode.', '2025-05-25');

INSERT IGNORE INTO homework_assigned (task_id, student_id) VALUES
    (1,1),(1,3),(1,5),
    (2,1),(2,2),(2,3),(2,4),(2,5),(2,6);

INSERT IGNORE INTO homework_viewed (task_id, student_id) VALUES (1,1),(1,3),(2,1),(2,2);
INSERT IGNORE INTO homework_completed (task_id, student_id) VALUES (1,1);

-- ============================================================
--  VERIFY
-- ============================================================
SELECT 'departments'       AS tbl, COUNT(*) AS rows FROM departments
UNION ALL SELECT 'students',           COUNT(*) FROM students
UNION ALL SELECT 'student_skills',     COUNT(*) FROM student_skills
UNION ALL SELECT 'companies',          COUNT(*) FROM companies
UNION ALL SELECT 'company_skills',     COUNT(*) FROM company_skills
UNION ALL SELECT 'applications',       COUNT(*) FROM applications
UNION ALL SELECT 'homework_tasks',     COUNT(*) FROM homework_tasks
UNION ALL SELECT 'community_insights', COUNT(*) FROM community_insights;
