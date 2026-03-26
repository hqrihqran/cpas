"""
cpas_seed_master.py
Run from the backend/ folder:  python cpas_seed_master.py

Reads DB credentials from .env, then:
1. Adds proficiency_percentage column to student_skills (if missing)
2. Creates placement_history table
3. Seeds both tables with real dummy data for 5 students
"""
import os
from dotenv import load_dotenv
import mysql.connector

load_dotenv()  # reads backend/.env

conn = mysql.connector.connect(
    host     = os.getenv("MYSQL_HOST", "localhost"),
    port     = int(os.getenv("MYSQL_PORT", 3306)),
    user     = os.getenv("MYSQL_USER", "root"),
    password = os.getenv("MYSQL_PASSWORD", ""),
    database = os.getenv("MYSQL_DB", "cpas_db"),
)
cur = conn.cursor()

# ─── 0. Seed Extra Students (13-30) ──────────────────────────────────────────
extra_students = [
    (13, 'Rohan Das',    'CSE2021045', 'CSE',  '2025', 8.10, 'TCS',        'Placed',     'TCS',       7.50, '2024-09-10', 0, 0),
    (14, 'Shruti Sen',   'ECE2021012', 'ECE',  '2025', 8.90, 'Qualcomm',   'Placed',     'Qualcomm', 16.00, '2024-11-05', 0, 0),
    (15, 'Akhil Menon',  'ME2021021',  'ME',   '2025', 6.80, 'L&T',        'Unplaced',   None,       None,  None,         2, 1),
    (16, 'Pooja Iyer',   'IT2021034',  'IT',   '2025', 8.40, 'Infosys',    'Placed',     'Wipro',     6.00, '2024-10-15', 0, 0),
    (17, 'Nitin Raj',    'CSE2021055', 'CSE',  '2025', 7.90, 'Accenture',  'Placed',     'Accenture', 8.50, '2024-09-25', 1, 0),
    (18, 'Maya Ray',     'CSBS2021014','CSBS', '2025', 9.20, 'Google',     'In Process', None,       None,  None,         0, 0),
    (19, 'Ajay Singh',   'CE2021031',  'CE',   '2025', 7.10, 'Adani',      'Unplaced',   None,       None,  None,         1, 1),
    (20, 'Kirti Jain',   'EE2021018',  'EE',   '2025', 8.70, 'Siemens',    'Placed',     'Siemens',  10.00, '2024-12-01', 0, 0),
    (21, 'Varun Nair',   'CSE2021066', 'CSE',  '2025', 7.40, 'Cognizant',  'Placed',     'Cognizant', 6.50, '2024-08-30', 2, 0),
    (22, 'Riya Khan',    'ECE2021044', 'ECE',  '2024', 8.50, 'Intel',      'Placed',     'Intel',    15.00, '2023-11-20', 0, 0),
    (23, 'Sanjay M',     'ME2021035',  'ME',   '2025', 6.90, 'Hero',       'In Process', None,       None,  None,         4, 2),
    (24, 'Tara Das',     'IT2021051',  'IT',   '2025', 8.00, 'Capgemini',  'Placed',     'Capgemini', 7.00, '2024-09-05', 0, 0),
    (25, 'Gopal V',      'CSE2021077', 'CSE',  '2025', 7.70, 'HCL',        'Placed',     'HCL',       5.50, '2024-10-10', 1, 0),
    (26, 'Anita Roy',    'CE2021045',  'CE',   '2025', 7.30, 'JSW',        'Unplaced',   None,       None,  None,         0, 0),
    (27, 'Imran Ali',    'CSBS2021028','CSBS', '2025', 8.60, 'IBM',        'Placed',     'IBM',      11.00, '2024-11-15', 0, 0),
    (28, 'Neha K',       'EE2021029',  'EE',   '2025', 8.80, 'ABB',        'In Process', None,       None,  None,         0, 0),
    (29, 'Vivek S',      'CSE2021088', 'CSE',  '2025', 8.30, 'Amazon',     'Placed',     'Amazon',   25.00, '2024-12-25', 0, 0),
    (30, 'Aditi B',      'ECE2021056', 'ECE',  '2025', 7.60, 'Samsung',    'Placed',     'Samsung',  12.00, '2024-10-20', 0, 0),
]

cur.executemany("""
    INSERT IGNORE INTO students
    (id, name, roll_no, branch, batch, cgpa, internship, placement_status, company, ctc, event_date, history_of_arrears, current_arrears)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
""", extra_students)
print(f"✓ Seeded up to {len(extra_students)} extra students")

# ─── 1. Add proficiency_percentage to student_skills if not present ──────────
cur.execute("""
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = %s
      AND TABLE_NAME   = 'student_skills'
      AND COLUMN_NAME  = 'proficiency_percentage'
""", (os.getenv("MYSQL_DB", "cpas_db"),))
(col_exists,) = cur.fetchone()

if col_exists == 0:
    cur.execute("ALTER TABLE student_skills ADD COLUMN proficiency_percentage INT DEFAULT 70")
    print("✓ Added proficiency_percentage column to student_skills")
else:
    print("  proficiency_percentage already exists – skipping ALTER")

# ─── 2. Create placement_history table ───────────────────────────────────────
cur.execute("""
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
)
""")
print("✓ placement_history table ready")

# ─── 3. Seed student_skills with proficiency_percentage ──────────────────────
skills_seed = [
    # (student_id, skill_name, proficiency_percentage)
    (1, 'Java',        88),
    (1, 'Python',      92),
    (1, 'ML',          75),
    (2, 'C++',         85),
    (2, 'React',       90),
    (2, 'Node.js',     80),
    (3, 'Python',      78),
    (3, 'Django',      72),
    (3, 'SQL',         85),
    (4, 'VLSI',        80),
    (4, 'Embedded C',  75),
    (5, 'AutoCAD',     70),
    (5, 'SolidWorks',  65),
    (13, 'Java', 80), (13, 'Spring', 75),
    (14, 'C++', 85), (14, 'Algorithms', 90),
    (15, 'AutoCAD', 60), (15, 'Design', 65),
    (16, 'Python', 88), (16, 'Django', 82),
    (17, 'SQL', 75), (17, 'Database', 70),
    (18, 'React', 95), (18, 'Node', 90),
    (19, 'Structural', 70), (19, 'CAD', 75),
    (20, 'Power Systems', 85), (20, 'MATLAB', 80),
    (21, 'Java', 78), (21, 'Spring', 70),
    (22, 'Verilog', 88), (22, 'VLSI', 90),
    (23, 'SolidWorks', 68), (23, 'Manufacturing', 72),
    (24, 'Cloud', 80), (24, 'AWS', 82),
    (25, 'C#', 75), (25, '.NET', 78),
    (26, 'AutoCAD', 72), (26, 'Surveying', 75),
    (27, 'Data Science', 85), (27, 'Machine Learning', 80),
    (28, 'Control Systems', 82), (28, 'MATLAB', 85),
    (29, 'Algorithms', 92), (29, 'System Design', 90),
    (30, 'Embedded C', 80), (30, 'Microcontrollers', 85)
]

for (sid, skill, pct) in skills_seed:
    cur.execute("""
        INSERT INTO student_skills (student_id, skill_name, proficiency_percentage)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE proficiency_percentage = VALUES(proficiency_percentage)
    """, (sid, skill, pct))
print(f"✓ Seeded {len(skills_seed)} skill rows")

# ─── 4. Seed placement_history ────────────────────────────────────────────────
cur.execute("DELETE FROM placement_history WHERE student_id IN (1,2,3,4,5)")

history_seed = [
    # (student_id, company_name, rounds_cleared, final_status, visit_date)
    # Student 1 – Rahul Sharma (analogue of Hariharan A in prompt)
    (1, 'Google',            3, 'Placed',     '2024-11-20'),
    (1, 'Microsoft',         2, 'Placed',     '2024-12-01'),
    (1, 'Amazon',            2, 'Rejected',   '2024-10-15'),

    # Student 2 – Priya Kapoor
    (2, 'Google',            4, 'Placed',     '2024-11-20'),
    (2, 'DeepMind',          2, 'Rejected',   '2024-09-10'),

    # Student 3 – Amit Verma
    (3, 'Infosys',           3, 'Placed',     '2024-08-22'),
    (3, 'TCS',               1, 'Rejected',   '2024-07-18'),
    (3, 'Wipro',             2, 'In-Process', '2025-01-05'),

    # Student 4 – Sneha Reddy
    (4, 'Texas Instruments', 2, 'In-Process', '2025-02-10'),
    (4, 'Qualcomm',          1, 'Rejected',   '2024-11-30'),

    # Student 5 – Vikram Patel
    (5, 'Tata Motors',       1, 'Rejected',   '2024-10-05'),
    (5, 'L&T',               2, 'In-Process', '2025-01-20'),

    # Extra Students History
    (13, 'TCS', 3, 'Placed', '2024-09-10'),
    (14, 'Qualcomm', 4, 'Placed', '2024-11-05'),
    (16, 'Wipro', 2, 'Placed', '2024-10-15'),
    (17, 'Accenture', 3, 'Placed', '2024-09-25'),
    (20, 'Siemens', 3, 'Placed', '2024-12-01'),
    (21, 'Cognizant', 2, 'Placed', '2024-08-30'),
    (22, 'Intel', 4, 'Placed', '2023-11-20'),
    (24, 'Capgemini', 3, 'Placed', '2024-09-05'),
    (25, 'HCL', 2, 'Placed', '2024-10-10'),
    (27, 'IBM', 3, 'Placed', '2024-11-15'),
    (29, 'Amazon', 4, 'Placed', '2024-12-25'),
    (30, 'Samsung', 3, 'Placed', '2024-10-20'),
]

cur.executemany("""
    INSERT INTO placement_history (student_id, company_name, rounds_cleared, final_status, visit_date)
    VALUES (%s, %s, %s, %s, %s)
""", history_seed)
print(f"✓ Seeded {len(history_seed)} placement_history rows")

conn.commit()
cur.close()
conn.close()
print("\n✅ Master DB upgrade complete!")
