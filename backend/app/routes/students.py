"""
students.py – CRUD endpoints for the `students` table.

Front-end consumers:
  • Students.tsx          (GET /api/students, GET /api/students/<id>)
  • DataManagement.tsx    (POST /api/students, PUT /api/students/<id>)
  • FacultyStudents.tsx   (GET /api/students?branch=&batch=&placement_status=)
"""
import json
from flask import Blueprint, request, jsonify
from ..db import query_db, execute_db

students_bp = Blueprint("students", __name__)


# ─── GET all students (with optional filters) ─────────────────────────────
@students_bp.route("/", methods=["GET"])
def get_students():
    filters = []
    params  = []

    branch   = request.args.get("branch")
    batch    = request.args.get("batch")
    status   = request.args.get("placement_status")
    min_cgpa = request.args.get("min_cgpa")
    max_cgpa = request.args.get("max_cgpa")
    no_arrears = request.args.get("no_current_arrears")  # "true" → hide students with arrears

    if branch:
        filters.append("branch = %s");          params.append(branch)
    if batch:
        filters.append("batch = %s");           params.append(batch)
    if status:
        filters.append("placement_status = %s");params.append(status)
    if min_cgpa:
        filters.append("cgpa >= %s");           params.append(float(min_cgpa))
    if max_cgpa:
        filters.append("cgpa <= %s");           params.append(float(max_cgpa))
    if no_arrears and no_arrears.lower() == "true":
        filters.append("current_arrears = 0")

    where = ("WHERE " + " AND ".join(filters)) if filters else ""
    sql   = f"""
        SELECT s.*, GROUP_CONCAT(sk.skill_name ORDER BY sk.skill_name SEPARATOR ',') AS skills
        FROM   students s
        LEFT JOIN student_skills sk ON s.id = sk.student_id
        {where}
        GROUP BY s.id
        ORDER BY s.name
    """
    rows = query_db(sql, params)
    # Convert comma-separated skills string → list
    for r in rows:
        r["skills"] = r["skills"].split(",") if r["skills"] else []
    return jsonify(rows)


# ─── GET single student ────────────────────────────────────────────────────
@students_bp.route("/<int:student_id>", methods=["GET"])
def get_student(student_id):
    sql = """
        SELECT s.*, GROUP_CONCAT(sk.skill_name ORDER BY sk.skill_name SEPARATOR ',') AS skills
        FROM   students s
        LEFT JOIN student_skills sk ON s.id = sk.student_id
        WHERE  s.id = %s
        GROUP BY s.id
    """
    row = query_db(sql, (student_id,), one=True)
    if not row:
        return jsonify({"error": "Student not found"}), 404
    row["skills"] = row["skills"].split(",") if row["skills"] else []
    return jsonify(row)


# ─── POST create student ───────────────────────────────────────────────────
@students_bp.route("/", methods=["POST"])
def create_student():
    data = request.get_json(force=True)
    required = ["name", "roll_no", "branch", "batch"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    sql = """
        INSERT INTO students (name, roll_no, branch, batch, cgpa, internship,
                              placement_status, company, ctc, stipend, event_date,
                              history_of_arrears, current_arrears)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    new_id = execute_db(sql, (
        data.get("name"),
        data.get("roll_no"),
        data.get("branch"),
        data.get("batch"),
        data.get("cgpa"),
        data.get("internship"),
        data.get("placement_status", "Unplaced"),
        data.get("company"),
        data.get("ctc"),
        data.get("stipend"),
        data.get("event_date"),
        data.get("history_of_arrears", 0),
        data.get("current_arrears", 0),
    ))

    # Insert skills
    skills = data.get("skills", [])
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(",") if s.strip()]
    for skill in skills:
        execute_db("INSERT IGNORE INTO student_skills (student_id, skill_name) VALUES (%s, %s)",
                   (new_id, skill))

    return jsonify({"message": "Student created", "id": new_id}), 201


# ─── PUT update student ────────────────────────────────────────────────────
@students_bp.route("/<int:student_id>", methods=["PUT"])
def update_student(student_id):
    data = request.get_json(force=True)

    sql = """
        UPDATE students SET
            name=%s, roll_no=%s, branch=%s, batch=%s, cgpa=%s,
            internship=%s, placement_status=%s, company=%s,
            ctc=%s, stipend=%s, event_date=%s,
            history_of_arrears=%s, current_arrears=%s
        WHERE id=%s
    """
    execute_db(sql, (
        data.get("name"),
        data.get("roll_no"),
        data.get("branch"),
        data.get("batch"),
        data.get("cgpa"),
        data.get("internship"),
        data.get("placement_status"),
        data.get("company"),
        data.get("ctc"),
        data.get("stipend"),
        data.get("event_date"),
        data.get("history_of_arrears", 0),
        data.get("current_arrears", 0),
        student_id,
    ))

    # Refresh skills
    skills = data.get("skills", [])
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(",") if s.strip()]
    if skills is not None:
        execute_db("DELETE FROM student_skills WHERE student_id = %s", (student_id,))
        for skill in skills:
            execute_db("INSERT INTO student_skills (student_id, skill_name) VALUES (%s, %s)",
                       (student_id, skill))

    return jsonify({"message": "Student updated"})


# ─── DELETE student ────────────────────────────────────────────────────────
@students_bp.route("/<int:student_id>", methods=["DELETE"])
def delete_student(student_id):
    execute_db("DELETE FROM students WHERE id = %s", (student_id,))
    return jsonify({"message": "Student deleted"})
