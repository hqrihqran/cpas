"""
companies.py – CRUD endpoints for the `companies` table.

Front-end consumers:
  • Companies.tsx          (GET /api/companies)
  • DataManagement.tsx     (GET /api/companies, POST /api/companies)
  • EligibilitySection.tsx (GET /api/companies/eligible?cgpa=X)
"""
from flask import Blueprint, request, jsonify
from ..db import query_db, execute_db
from ..notifications import save_and_emit

companies_bp = Blueprint("companies", __name__)


# ─── GET all companies ─────────────────────────────────────────────────────
@companies_bp.route("/", methods=["GET"])
def get_companies():
    sql = """
        SELECT c.*,
               GROUP_CONCAT(cs.skill_name ORDER BY cs.skill_name SEPARATOR ',') AS required_skills,
               GROUP_CONCAT(CONCAT(cb.label, '||', cb.amount) SEPARATOR ';;')    AS ctc_breakdown
        FROM   companies c
        LEFT JOIN company_skills    cs ON c.id = cs.company_id
        LEFT JOIN company_ctc_breakdown cb ON c.id = cb.company_id
        GROUP BY c.id
        ORDER BY c.name
    """
    rows = query_db(sql)
    rows = _parse_company_rows(rows)
    return jsonify(rows)


# ─── GET eligible companies (student's CGPA >= required CGPA) ─────────────
@companies_bp.route("/eligible", methods=["GET"])
def get_eligible():
    cgpa = request.args.get("cgpa", 0, type=float)
    sql = """
        SELECT c.*,
               GROUP_CONCAT(cs.skill_name ORDER BY cs.skill_name SEPARATOR ',') AS required_skills,
               GROUP_CONCAT(CONCAT(cb.label, '||', cb.amount) SEPARATOR ';;')    AS ctc_breakdown
        FROM   companies c
        LEFT JOIN company_skills         cs ON c.id = cs.company_id
        LEFT JOIN company_ctc_breakdown  cb ON c.id = cb.company_id
        WHERE  c.required_cgpa <= %s
        GROUP BY c.id
        ORDER BY c.required_cgpa DESC
    """
    rows = query_db(sql, (cgpa,))
    rows = _parse_company_rows(rows)
    return jsonify(rows)


# ─── GET single company ────────────────────────────────────────────────────
@companies_bp.route("/<int:company_id>", methods=["GET"])
def get_company(company_id):
    sql = """
        SELECT c.*,
               GROUP_CONCAT(cs.skill_name ORDER BY cs.skill_name SEPARATOR ',') AS required_skills,
               GROUP_CONCAT(CONCAT(cb.label, '||', cb.amount) SEPARATOR ';;')    AS ctc_breakdown
        FROM   companies c
        LEFT JOIN company_skills        cs ON c.id = cs.company_id
        LEFT JOIN company_ctc_breakdown cb ON c.id = cb.company_id
        WHERE c.id = %s
        GROUP BY c.id
    """
    row = query_db(sql, (company_id,), one=True)
    if not row:
        return jsonify({"error": "Company not found"}), 404
    row = _parse_company_rows([row])[0]
    return jsonify(row)


# ─── POST create company ───────────────────────────────────────────────────
@companies_bp.route("/", methods=["POST"])
def create_company():
    data = request.get_json(force=True)
    sql = """
        INSERT INTO companies (name, role, salary_range, location, required_cgpa, description)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    new_id = execute_db(sql, (
        data["name"], data.get("role"), data.get("salary_range"),
        data.get("location"), data.get("required_cgpa", 0.0),
        data.get("description"),
    ))
    _insert_company_skills(new_id, data.get("required_skills", []))
    _insert_ctc_breakdown(new_id, data.get("ctc_breakdown", []))

    # ── Notify all Students of a new job offer ──────────────────────────────
    try:
        save_and_emit(
            event="new_notification",
            notif_type="Job",
            title=f"New Job Offer: {data['name']}",
            message=(
                f"{data['name']} is now hiring for {data.get('role', 'multiple roles')}. "
                f"CTC: {data.get('salary_range', 'N/A')} | "
                f"Location: {data.get('location', 'N/A')}"
            ),
            user_id=None,          # broadcast – not tied to one user
            target_role="Student",
            room="role_Student",    # all students in this room
            broadcast=False,
        )
    except Exception as e:
        print(f"[Notifications] Failed to emit new_job: {e}")

    return jsonify({"message": "Company created", "id": new_id}), 201


# ─── PUT update company ────────────────────────────────────────────────────
@companies_bp.route("/<int:company_id>", methods=["PUT"])
def update_company(company_id):
    data = request.get_json(force=True)
    sql = """
        UPDATE companies SET name=%s, role=%s, salary_range=%s,
               location=%s, required_cgpa=%s, description=%s
        WHERE  id=%s
    """
    execute_db(sql, (
        data["name"], data.get("role"), data.get("salary_range"),
        data.get("location"), data.get("required_cgpa", 0.0),
        data.get("description"), company_id,
    ))
    execute_db("DELETE FROM company_skills WHERE company_id=%s", (company_id,))
    _insert_company_skills(company_id, data.get("required_skills", []))
    execute_db("DELETE FROM company_ctc_breakdown WHERE company_id=%s", (company_id,))
    _insert_ctc_breakdown(company_id, data.get("ctc_breakdown", []))
    return jsonify({"message": "Company updated"})


# ─── DELETE company ────────────────────────────────────────────────────────
@companies_bp.route("/<int:company_id>", methods=["DELETE"])
def delete_company(company_id):
    execute_db("DELETE FROM companies WHERE id=%s", (company_id,))
    return jsonify({"message": "Company deleted"})


# ── helpers ──────────────────────────────────────────────────────────────
def _parse_company_rows(rows):
    for r in rows:
        r["required_skills"] = r["required_skills"].split(",") if r.get("required_skills") else []
        breakdown_raw = r.pop("ctc_breakdown", None) or ""
        r["ctc_breakdown"] = [
            {"label": p.split("||")[0], "amount": p.split("||")[1]}
            for p in breakdown_raw.split(";;") if "||" in p
        ]
    return rows


def _insert_company_skills(company_id, skills):
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(",") if s.strip()]
    for skill in skills:
        execute_db("INSERT INTO company_skills (company_id, skill_name) VALUES (%s,%s)",
                   (company_id, skill))


def _insert_ctc_breakdown(company_id, breakdown):
    for item in breakdown:
        execute_db("INSERT INTO company_ctc_breakdown (company_id, label, amount) VALUES (%s,%s,%s)",
                   (company_id, item.get("label"), item.get("amount")))
