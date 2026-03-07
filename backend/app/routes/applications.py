"""
applications.py – CRUD endpoints for the `applications` table.

Front-end consumers:
  • MyApplications.tsx  (GET, POST)
"""
from flask import Blueprint, request, jsonify
from ..db import query_db, execute_db

applications_bp = Blueprint("applications", __name__)


# ─── GET all applications (optionally filter by student) ──────────────────
@applications_bp.route("/", methods=["GET"])
def get_applications():
    student_id = request.args.get("student_id")
    if student_id:
        sql = """
            SELECT a.*,
                   GROUP_CONCAT(CONCAT(ar.round_name,'||',ar.status) ORDER BY ar.round_order SEPARATOR ';;') AS rounds_raw,
                   GROUP_CONCAT(ai.interviewer_name ORDER BY ai.id SEPARATOR ',') AS interviewers_raw
            FROM   applications a
            LEFT JOIN application_rounds      ar ON a.id = ar.application_id
            LEFT JOIN application_interviewers ai ON a.id = ai.application_id
            WHERE  a.student_id = %s
            GROUP BY a.id
            ORDER BY a.visit_date DESC
        """
        rows = query_db(sql, (student_id,))
    else:
        sql = """
            SELECT a.*,
                   GROUP_CONCAT(CONCAT(ar.round_name,'||',ar.status) ORDER BY ar.round_order SEPARATOR ';;') AS rounds_raw,
                   GROUP_CONCAT(ai.interviewer_name ORDER BY ai.id SEPARATOR ',') AS interviewers_raw
            FROM   applications a
            LEFT JOIN application_rounds       ar ON a.id = ar.application_id
            LEFT JOIN application_interviewers ai ON a.id = ai.application_id
            GROUP BY a.id
            ORDER BY a.visit_date DESC
        """
        rows = query_db(sql)

    return jsonify([_parse_application(r) for r in rows])


# ─── GET single application ────────────────────────────────────────────────
@applications_bp.route("/<int:app_id>", methods=["GET"])
def get_application(app_id):
    sql = """
        SELECT a.*,
               GROUP_CONCAT(CONCAT(ar.round_name,'||',ar.status) ORDER BY ar.round_order SEPARATOR ';;') AS rounds_raw,
               GROUP_CONCAT(ai.interviewer_name ORDER BY ai.id SEPARATOR ',') AS interviewers_raw
        FROM   applications a
        LEFT JOIN application_rounds       ar ON a.id = ar.application_id
        LEFT JOIN application_interviewers ai ON a.id = ai.application_id
        WHERE  a.id = %s
        GROUP BY a.id
    """
    row = query_db(sql, (app_id,), one=True)
    if not row:
        return jsonify({"error": "Application not found"}), 404
    return jsonify(_parse_application(row))


# ─── POST create application ───────────────────────────────────────────────
@applications_bp.route("/", methods=["POST"])
def create_application():
    data = request.get_json(force=True)
    sql = """
        INSERT INTO applications
            (student_id, company_name, visit_date, package_offered, status, feedback)
        VALUES (%s,%s,%s,%s,%s,%s)
    """
    new_id = execute_db(sql, (
        data["student_id"],
        data["company_name"],
        data.get("visit_date"),
        data.get("package_offered"),
        data.get("status", "In Process"),
        data.get("feedback"),
    ))
    # Insert rounds
    for idx, r in enumerate(data.get("rounds_details", [])):
        execute_db(
            "INSERT INTO application_rounds (application_id, round_name, status, round_order) VALUES (%s,%s,%s,%s)",
            (new_id, r["name"], r.get("status", "Pending"), idx)
        )
    # Insert interviewers
    for name in data.get("interviewers", []):
        execute_db(
            "INSERT INTO application_interviewers (application_id, interviewer_name) VALUES (%s,%s)",
            (new_id, name)
        )
    return jsonify({"message": "Application created", "id": new_id}), 201


# ─── PUT update application ────────────────────────────────────────────────
@applications_bp.route("/<int:app_id>", methods=["PUT"])
def update_application(app_id):
    data = request.get_json(force=True)
    sql = """
        UPDATE applications SET
            company_name=%s, visit_date=%s, package_offered=%s,
            status=%s, feedback=%s
        WHERE id=%s
    """
    execute_db(sql, (
        data.get("company_name"),
        data.get("visit_date"),
        data.get("package_offered"),
        data.get("status"),
        data.get("feedback"),
        app_id,
    ))
    if "rounds_details" in data:
        execute_db("DELETE FROM application_rounds WHERE application_id=%s", (app_id,))
        for idx, r in enumerate(data["rounds_details"]):
            execute_db(
                "INSERT INTO application_rounds (application_id, round_name, status, round_order) VALUES (%s,%s,%s,%s)",
                (app_id, r["name"], r.get("status", "Pending"), idx)
            )
    if "interviewers" in data:
        execute_db("DELETE FROM application_interviewers WHERE application_id=%s", (app_id,))
        for name in data["interviewers"]:
            execute_db(
                "INSERT INTO application_interviewers (application_id, interviewer_name) VALUES (%s,%s)",
                (app_id, name)
            )
    return jsonify({"message": "Application updated"})


# ─── DELETE application ────────────────────────────────────────────────────
@applications_bp.route("/<int:app_id>", methods=["DELETE"])
def delete_application(app_id):
    execute_db("DELETE FROM applications WHERE id=%s", (app_id,))
    return jsonify({"message": "Application deleted"})


# ── helper ────────────────────────────────────────────────────────────────
def _parse_application(r):
    rounds_raw = r.pop("rounds_raw", None) or ""
    r["rounds_details"] = [
        {"name": p.split("||")[0], "status": p.split("||")[1]}
        for p in rounds_raw.split(";;") if "||" in p
    ]
    interviewers_raw = r.pop("interviewers_raw", None) or ""
    r["interviewers"] = [x for x in interviewers_raw.split(",") if x]
    return r
