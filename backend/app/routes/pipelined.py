"""
pipelined.py – Endpoints for the CPAS Pipelined system.

Blueprint prefix: /api/student/pipelined   (registered in app/__init__.py)

Endpoints
---------
GET  /<student_id>           → Pipelined companies + skill-gap analysis for a student
GET  /skill-gap/<student_id> → Skill-gap grouped by company (real-time focus areas)
GET  /companies              → All pipelined companies (admin/management view)
GET  /companies/<company_id> → Single company with its requirements
POST /companies              → Create a pipelined company
PUT  /companies/<company_id> → Update a pipelined company

GET  /trainings              → All scheduled trainings
POST /trainings              → Schedule a new training

GET  /experiences/<company_id> → Interview experience PDFs for a company
POST /experiences            → Upload (register) a new interview experience PDF

GET  /pipeline/<student_id>  → Student's pipeline entries (interest/status list)
POST /pipeline               → Add/update a student→company pipeline entry
"""

from flask import Blueprint, request, jsonify
from ..db import query_db, execute_db

pipelined_bp = Blueprint("pipelined", __name__)
skill_gap_bp  = Blueprint("skill_gap",  __name__)


# ═══════════════════════════════════════════════════════════════════════════════
#  CORE: GET /api/student/pipelined/<student_id>
#  The Skill-Gap Comparison Engine
# ═══════════════════════════════════════════════════════════════════════════════

@pipelined_bp.route("/<int:student_id>", methods=["GET"])
def get_student_pipelined(student_id):
    """
    Returns every pipelined company enriched with:
      • is_eligible       – bool (student.cgpa >= company.eligibility_cgpa)
      • focus_areas       – skills where student_proficiency < company required
      • skill_gap_details – full matrix: required vs actual per skill
      • pipeline_status   – student's current status (Interested/Eligible/Scheduled/None)
      • interview_experience_pdf – URL of most recent experience PDF (or null)
    """

    # ── 1. Fetch the student's CGPA ─────────────────────────────────────────
    student = query_db(
        "SELECT id, name, cgpa FROM students WHERE id = %s",
        (student_id,), one=True
    )
    if not student:
        return jsonify({"error": "Student not found"}), 404

    student_cgpa = float(student["cgpa"])

    # ── 2. Fetch ALL student skills (with proficiency) ───────────────────────
    skill_rows = query_db(
        """
        SELECT skill_name, COALESCE(proficiency_percentage, 70) AS proficiency
        FROM   student_skills
        WHERE  student_id = %s
        """,
        (student_id,)
    )
    # Build a fast lookup dict: skill_name → proficiency (int)
    student_skills: dict = {r["skill_name"]: int(r["proficiency"]) for r in skill_rows}

    # ── 3. Fetch all pipelined companies ────────────────────────────────────
    companies = query_db(
        """
        SELECT id, name, logo_url, drive_date, eligibility_cgpa, location
        FROM   pipelined_companies
        ORDER BY drive_date ASC
        """
    )

    result = []

    for co in companies:
        company_id = co["id"]

        # ── 4a. Fetch skill requirements for this company ────────────────────
        requirements = query_db(
            """
            SELECT skill_name, min_proficiency_required
            FROM   company_requirements
            WHERE  company_id = %s
            ORDER BY skill_name
            """,
            (company_id,)
        )

        # ── 4b. Compute skill-gap ────────────────────────────────────────────
        focus_areas        = []   # skills where student falls short
        skill_gap_details  = []   # full matrix for UI display

        for req in requirements:
            skill   = req["skill_name"]
            needed  = int(req["min_proficiency_required"])
            actual  = student_skills.get(skill)          # None if student lacks skill
            has_skill = actual is not None
            proficiency = actual if has_skill else 0

            gap = needed - proficiency  # positive → shortfall

            skill_gap_details.append({
                "skill_name":              skill,
                "required_proficiency":    needed,
                "student_proficiency":     proficiency,
                "has_skill":               has_skill,
                "gap":                     gap if gap > 0 else 0,    # 0 if no gap
                "gap_severity":            _gap_severity(gap),
            })

            if proficiency < needed:
                focus_areas.append({
                    "skill_name":           skill,
                    "required_proficiency": needed,
                    "student_proficiency":  proficiency,
                    "shortfall":            needed - proficiency,
                })

        # ── 4c. CGPA eligibility ─────────────────────────────────────────────
        eligibility_cgpa = float(co["eligibility_cgpa"])
        is_eligible      = student_cgpa >= eligibility_cgpa

        # ── 4d. Student's pipeline status for this company ──────────────────
        pipeline_row = query_db(
            """
            SELECT status FROM student_pipelines
            WHERE  student_id = %s AND company_id = %s
            """,
            (student_id, company_id), one=True
        )
        pipeline_status = pipeline_row["status"] if pipeline_row else None

        # ── 4e. Most recent interview experience PDF ─────────────────────────
        exp_row = query_db(
            """
            SELECT pdf_url, year_of_drive
            FROM   interview_experiences
            WHERE  company_id = %s
            ORDER BY year_of_drive DESC
            LIMIT  1
            """,
            (company_id,), one=True
        )
        experience_pdf  = exp_row["pdf_url"]      if exp_row else None
        experience_year = exp_row["year_of_drive"] if exp_row else None

        # ── 4f. Build response object for this company ───────────────────────
        result.append({
            "company_id":            company_id,
            "company_name":          co["name"],
            "logo_url":              co["logo_url"],
            "drive_date":            co["drive_date"].isoformat() if co["drive_date"] else None,
            "location":              co["location"],
            "eligibility_cgpa":      eligibility_cgpa,
            "is_eligible":           is_eligible,
            "student_cgpa":          student_cgpa,
            "pipeline_status":       pipeline_status,
            "focus_areas":           focus_areas,          # skills to work on
            "skill_gap_details":     skill_gap_details,    # full matrix
            "interview_experience":  {
                "pdf_url":    experience_pdf,
                "year":       experience_year,
            },
        })

    return jsonify({
        "student": {
            "id":   student["id"],
            "name": student["name"],
            "cgpa": student_cgpa,
        },
        "companies": result,
        "total":     len(result),
    })


# ─── Helper ────────────────────────────────────────────────────────────────────
def _gap_severity(gap: int) -> str:
    """Classify the skill gap into a UI-friendly severity label."""
    if gap <= 0:
        return "none"
    if gap <= 15:
        return "low"
    if gap <= 35:
        return "medium"
    return "high"


# ═══════════════════════════════════════════════════════════════════════════════
#  SKILL-GAP ENDPOINT
#  GET /api/student/skill-gap/<student_id>
#  (Blueprint skill_gap_bp, prefix set in app/__init__.py)
# ═══════════════════════════════════════════════════════════════════════════════

@skill_gap_bp.route("/<int:student_id>", methods=["GET"])
def get_skill_gap(student_id):
    """
    Returns skills where the student's proficiency is below the company's
    minimum requirement (or the skill is absent entirely), grouped by company.

    SQL logic
    ---------
    LEFT JOIN pipelined_companies → company_requirements → student_skills
    (matching on skill_name AND student_id)
    Filter: student_skills.proficiency_percentage IS NULL
            OR student_skills.proficiency_percentage < company_requirements.min_proficiency_required

    Response shape
    --------------
    {
      "student_id": 1,
      "companies": [
        {
          "company_id":   1,
          "company_name": "Google",
          "gap_skills": [
            {
              "skill_name":           "Data Structures",
              "min_required":         85,
              "student_proficiency":  0,      # 0 when student lacks the skill
              "gap_score":            85,     # min_required - student_proficiency
              "gap_severity":         "high"
            }
          ]
        }
      ]
    }
    """
    # Verify student exists
    student_row = query_db(
        "SELECT id FROM students WHERE id = %s",
        (student_id,), one=True
    )
    if not student_row:
        return jsonify({"error": "Student not found"}), 404

    # ── Core LEFT JOIN query ─────────────────────────────────────────────────
    # student_skills is LEFT JOINed so skills the student lacks (NULL) are included.
    rows = query_db(
        """
        SELECT
            pc.id                                          AS company_id,
            pc.name                                        AS company_name,
            cr.skill_name,
            cr.min_proficiency_required                    AS min_required,
            COALESCE(ss.proficiency_percentage, 0)         AS student_proficiency,
            cr.min_proficiency_required
                - COALESCE(ss.proficiency_percentage, 0)   AS gap_score
        FROM  pipelined_companies   pc
        JOIN  company_requirements  cr  ON cr.company_id = pc.id
        LEFT JOIN student_skills    ss  ON ss.skill_name  = cr.skill_name
                                       AND ss.student_id  = %s
        WHERE ss.proficiency_percentage IS NULL
           OR ss.proficiency_percentage < cr.min_proficiency_required
        ORDER BY pc.id, gap_score DESC
        """,
        (student_id,)
    )

    # ── Group by company ─────────────────────────────────────────────────────
    companies_map: dict = {}
    for r in rows:
        cid = r["company_id"]
        if cid not in companies_map:
            companies_map[cid] = {
                "company_id":   cid,
                "company_name": r["company_name"],
                "gap_skills":   []
            }
        companies_map[cid]["gap_skills"].append({
            "skill_name":          r["skill_name"],
            "min_required":        int(r["min_required"]),
            "student_proficiency": int(r["student_proficiency"]),
            "gap_score":           int(r["gap_score"]),
            "gap_severity":        _gap_severity(int(r["gap_score"])),
        })

    return jsonify({
        "student_id": student_id,
        "companies":  list(companies_map.values()),
    })


# ═══════════════════════════════════════════════════════════════════════════════
#  PIPELINED COMPANIES CRUD
# ═══════════════════════════════════════════════════════════════════════════════

@pipelined_bp.route("/companies", methods=["GET"])
def get_pipelined_companies():
    """List all pipelined companies with their skill requirements."""
    companies = query_db(
        "SELECT * FROM pipelined_companies ORDER BY drive_date ASC"
    )
    for co in companies:
        if co.get("drive_date"):
            co["drive_date"] = co["drive_date"].isoformat()
        co["eligibility_cgpa"] = float(co["eligibility_cgpa"])
        reqs = query_db(
            "SELECT skill_name, min_proficiency_required FROM company_requirements WHERE company_id = %s",
            (co["id"],)
        )
        co["requirements"] = reqs
    return jsonify(companies)


@pipelined_bp.route("/companies/<int:company_id>", methods=["GET"])
def get_pipelined_company(company_id):
    """Single pipelined company with requirements + experiences."""
    co = query_db(
        "SELECT * FROM pipelined_companies WHERE id = %s",
        (company_id,), one=True
    )
    if not co:
        return jsonify({"error": "Company not found"}), 404

    co = dict(co)
    if co.get("drive_date"):
        co["drive_date"] = co["drive_date"].isoformat()
    co["eligibility_cgpa"] = float(co["eligibility_cgpa"])

    co["requirements"] = query_db(
        "SELECT skill_name, min_proficiency_required FROM company_requirements WHERE company_id = %s",
        (company_id,)
    )
    co["interview_experiences"] = query_db(
        """
        SELECT ie.id, ie.pdf_url, ie.year_of_drive, s.name AS uploader_name
        FROM   interview_experiences ie
        JOIN   students s ON ie.student_id = s.id
        WHERE  ie.company_id = %s
        ORDER BY ie.year_of_drive DESC
        """,
        (company_id,)
    )
    return jsonify(co)


@pipelined_bp.route("/companies", methods=["POST"])
def create_pipelined_company():
    data = request.get_json(force=True)
    required = ["name", "eligibility_cgpa"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"'{f}' is required"}), 400

    new_id = execute_db(
        """
        INSERT INTO pipelined_companies (name, logo_url, drive_date, eligibility_cgpa, location)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            data["name"],
            data.get("logo_url"),
            data.get("drive_date"),
            data["eligibility_cgpa"],
            data.get("location"),
        )
    )

    # Insert requirements if provided
    for req in data.get("requirements", []):
        execute_db(
            """
            INSERT IGNORE INTO company_requirements (company_id, skill_name, min_proficiency_required)
            VALUES (%s, %s, %s)
            """,
            (new_id, req["skill_name"], req.get("min_proficiency_required", 60))
        )

    return jsonify({"message": "Pipelined company created", "id": new_id}), 201


@pipelined_bp.route("/companies/<int:company_id>", methods=["PUT"])
def update_pipelined_company(company_id):
    data = request.get_json(force=True)
    execute_db(
        """
        UPDATE pipelined_companies
        SET name=%s, logo_url=%s, drive_date=%s, eligibility_cgpa=%s, location=%s
        WHERE id=%s
        """,
        (
            data.get("name"),
            data.get("logo_url"),
            data.get("drive_date"),
            data.get("eligibility_cgpa"),
            data.get("location"),
            company_id,
        )
    )

    # Refresh requirements if provided
    if "requirements" in data:
        execute_db("DELETE FROM company_requirements WHERE company_id = %s", (company_id,))
        for req in data["requirements"]:
            execute_db(
                """
                INSERT INTO company_requirements (company_id, skill_name, min_proficiency_required)
                VALUES (%s, %s, %s)
                """,
                (company_id, req["skill_name"], req.get("min_proficiency_required", 60))
            )

    return jsonify({"message": "Pipelined company updated"})


# ═══════════════════════════════════════════════════════════════════════════════
#  SCHEDULED TRAININGS CRUD
# ═══════════════════════════════════════════════════════════════════════════════

@pipelined_bp.route("/trainings", methods=["GET"])
def get_trainings():
    rows = query_db(
        "SELECT * FROM scheduled_trainings ORDER BY date_time ASC"
    )
    for r in rows:
        if r.get("date_time"):
            r["date_time"] = r["date_time"].isoformat()
    return jsonify(rows)


@pipelined_bp.route("/trainings", methods=["POST"])
def create_training():
    data = request.get_json(force=True)
    required = ["skill_name", "trainer_name", "date_time"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"'{f}' is required"}), 400

    new_id = execute_db(
        """
        INSERT INTO scheduled_trainings
            (skill_name, trainer_name, date_time, target_shortfall_percentage, notify_students)
        VALUES (%s, %s, %s, %s, %s)
        """,
        (
            data["skill_name"],
            data["trainer_name"],
            data["date_time"],
            data.get("target_shortfall_percentage", 0),
            data.get("notify_students", 0),
        )
    )
    return jsonify({"message": "Training scheduled", "id": new_id}), 201


# ═══════════════════════════════════════════════════════════════════════════════
#  INTERVIEW EXPERIENCES
# ═══════════════════════════════════════════════════════════════════════════════

@pipelined_bp.route("/experiences/<int:company_id>", methods=["GET"])
def get_experiences(company_id):
    rows = query_db(
        """
        SELECT ie.id, ie.pdf_url, ie.year_of_drive, ie.uploaded_at,
               s.id AS student_id, s.name AS uploader_name
        FROM   interview_experiences ie
        JOIN   students s ON ie.student_id = s.id
        WHERE  ie.company_id = %s
        ORDER BY ie.year_of_drive DESC
        """,
        (company_id,)
    )
    for r in rows:
        if r.get("uploaded_at"):
            r["uploaded_at"] = r["uploaded_at"].isoformat()
    return jsonify(rows)


@pipelined_bp.route("/experiences", methods=["POST"])
def create_experience():
    data = request.get_json(force=True)
    required = ["company_id", "student_id", "pdf_url", "year_of_drive"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"'{f}' is required"}), 400

    new_id = execute_db(
        """
        INSERT INTO interview_experiences (company_id, student_id, pdf_url, year_of_drive)
        VALUES (%s, %s, %s, %s)
        """,
        (data["company_id"], data["student_id"], data["pdf_url"], data["year_of_drive"])
    )
    return jsonify({"message": "Interview experience uploaded", "id": new_id}), 201


# ═══════════════════════════════════════════════════════════════════════════════
#  STUDENT PIPELINE STATUS
# ═══════════════════════════════════════════════════════════════════════════════

@pipelined_bp.route("/pipeline/<int:student_id>", methods=["GET"])
def get_student_pipeline_entries(student_id):
    """List all pipeline entries (company + status) for a student."""
    rows = query_db(
        """
        SELECT sp.id, sp.company_id, sp.status, sp.updated_at,
               pc.name AS company_name, pc.drive_date, pc.location
        FROM   student_pipelines sp
        JOIN   pipelined_companies pc ON sp.company_id = pc.id
        WHERE  sp.student_id = %s
        ORDER BY pc.drive_date ASC
        """,
        (student_id,)
    )
    for r in rows:
        if r.get("drive_date"):
            r["drive_date"] = r["drive_date"].isoformat()
        if r.get("updated_at"):
            r["updated_at"] = r["updated_at"].isoformat()
    return jsonify(rows)


@pipelined_bp.route("/pipeline", methods=["POST"])
def upsert_pipeline_entry():
    """
    Add or update a student's pipeline status for a company.
    Body: { student_id, company_id, status }
    """
    data = request.get_json(force=True)
    required = ["student_id", "company_id", "status"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"'{f}' is required"}), 400

    valid_statuses = {"Interested", "Eligible", "Scheduled"}
    if data["status"] not in valid_statuses:
        return jsonify({"error": f"status must be one of {sorted(valid_statuses)}"}), 400

    execute_db(
        """
        INSERT INTO student_pipelines (student_id, company_id, status)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE status = VALUES(status)
        """,
        (data["student_id"], data["company_id"], data["status"])
    )
    return jsonify({"message": "Pipeline entry saved"}), 201
