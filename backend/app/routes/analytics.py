"""
analytics.py – Aggregated data endpoints.

Front-end consumers:
  • Analytics.tsx / KPICards.tsx    (GET /api/analytics/kpis)
  • DepartmentChart.tsx             (GET /api/analytics/department-placements)
  • TrendsChart.tsx                 (GET /api/analytics/trends)
  • Companies.tsx                   (GET /api/analytics/company-stats)
  • Analytics.tsx (funnel)          (GET /api/analytics/selection-funnel)
  • ManagementView.tsx              (GET /api/analytics/summary)
"""
from flask import Blueprint, request, jsonify
from ..db import query_db

analytics_bp = Blueprint("analytics", __name__)


# ─── KPI Cards ────────────────────────────────────────────────────────────
@analytics_bp.route("/kpis", methods=["GET"])
def get_kpis():
    year = request.args.get("year")
    where = "WHERE YEAR(event_date) = %s" if year else ""
    params = (year,) if year else ()

    total_sql    = f"SELECT COUNT(*)    AS total    FROM students {where}"
    placed_sql   = f"SELECT COUNT(*)    AS placed   FROM students {where} {'AND' if year else 'WHERE'} placement_status='Placed'"
    avg_ctc_sql  = f"SELECT AVG(ctc)    AS avg_ctc  FROM students {where} {'AND' if year else 'WHERE'} placement_status='Placed'"
    max_ctc_sql  = f"SELECT MAX(ctc)    AS max_ctc  FROM students {where} {'AND' if year else 'WHERE'} placement_status='Placed'"
    companies_sql = "SELECT COUNT(DISTINCT name) AS total_companies FROM companies"

    total     = query_db(total_sql,    params, one=True)
    placed    = query_db(placed_sql,   params, one=True)
    avg_ctc   = query_db(avg_ctc_sql,  params, one=True)
    max_ctc   = query_db(max_ctc_sql,  params, one=True)
    companies = query_db(companies_sql, one=True)

    total_students = total["total"] if total else 0
    total_placed   = placed["placed"] if placed else 0

    return jsonify({
        "total_students":    total_students,
        "total_placed":      total_placed,
        "placement_percent": round((total_placed / total_students * 100), 1) if total_students else 0,
        "avg_ctc":           round(float(avg_ctc["avg_ctc"] or 0), 2),
        "highest_ctc":       round(float(max_ctc["max_ctc"] or 0), 2),
        "partner_companies": companies["total_companies"] if companies else 0,
    })


# ─── Department-wise placement ─────────────────────────────────────────────
@analytics_bp.route("/department-placements", methods=["GET"])
def dept_placements():
    sql = """
        SELECT branch           AS department,
               COUNT(*)         AS total,
               SUM(CASE WHEN placement_status='Placed' THEN 1 ELSE 0 END) AS placed,
               ROUND(AVG(CASE WHEN placement_status='Placed' THEN ctc END), 2) AS avg_ctc
        FROM   students
        GROUP BY branch
        ORDER BY placed DESC
    """
    rows = query_db(sql)
    return jsonify(rows)


# ─── Company stats ─────────────────────────────────────────────────────────
@analytics_bp.route("/company-stats", methods=["GET"])
def company_stats():
    sql = """
        SELECT company,
               COUNT(*)     AS offers,
               ROUND(AVG(ctc),2) AS avg_ctc,
               ROUND(MAX(ctc),2) AS highest_ctc
        FROM   students
        WHERE  placement_status = 'Placed' AND company IS NOT NULL
        GROUP BY company
        ORDER BY offers DESC
    """
    rows = query_db(sql)
    return jsonify(rows)


# ─── CGPA vs CTC scatter data ──────────────────────────────────────────────
@analytics_bp.route("/cgpa-ctc", methods=["GET"])
def cgpa_ctc():
    sql = """
        SELECT name, cgpa, COALESCE(ctc, 0) AS ctc,
               IF(placement_status='Placed', TRUE, FALSE) AS placed
        FROM students
        ORDER BY cgpa
    """
    rows = query_db(sql)
    return jsonify(rows)


# ─── Selection funnel ──────────────────────────────────────────────────────
@analytics_bp.route("/selection-funnel", methods=["GET"])
def selection_funnel():
    sql = """
        SELECT 'Registered'  AS stage, COUNT(*)                                                        AS count FROM students
        UNION ALL
        SELECT 'Applied',              COUNT(DISTINCT student_id)                                       FROM applications
        UNION ALL
        SELECT 'Shortlisted',          COUNT(DISTINCT student_id)                                       FROM applications WHERE status != 'Rejected'
        UNION ALL
        SELECT 'Offered',              COUNT(DISTINCT student_id)                                       FROM applications WHERE status = 'Selected'
        UNION ALL
        SELECT 'Placed',               COUNT(*)                                                         FROM students WHERE placement_status = 'Placed'
    """
    rows = query_db(sql)
    return jsonify(rows)


# ─── Placement trends by year ──────────────────────────────────────────────
@analytics_bp.route("/trends", methods=["GET"])
def trends():
    sql = """
        SELECT batch           AS year,
               COUNT(*)        AS total,
               SUM(CASE WHEN placement_status='Placed' THEN 1 ELSE 0 END) AS placed
        FROM   students
        GROUP BY batch
        ORDER BY batch
    """
    rows = query_db(sql)
    return jsonify(rows)


# ─── High-level summary for management ────────────────────────────────────
@analytics_bp.route("/summary", methods=["GET"])
def summary():
    kpis     = get_kpis().get_json()
    dept     = dept_placements().get_json()
    companies = company_stats().get_json()
    return jsonify({
        "kpis":             kpis,
        "department_stats": dept,
        "company_stats":    companies,
    })
