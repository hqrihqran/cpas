"""
insights.py – CRUD endpoints for interview / community insights.

Front-end consumers:
  • CommunityInsights.tsx / Interviews.tsx  (GET, POST, likes)
"""
from flask import Blueprint, request, jsonify
from ..db import query_db, execute_db

insights_bp = Blueprint("insights", __name__)


# ─── GET all insights (with optional search) ───────────────────────────────
@insights_bp.route("/", methods=["GET"])
def get_insights():
    q = request.args.get("q", "").strip()
    if q:
        sql = """
            SELECT * FROM community_insights
            WHERE  company LIKE %s OR role LIKE %s OR content LIKE %s
            ORDER BY created_at DESC
        """
        like = f"%{q}%"
        rows = query_db(sql, (like, like, like))
    else:
        rows = query_db("SELECT * FROM community_insights ORDER BY created_at DESC")
    return jsonify(rows)


# ─── GET single insight ────────────────────────────────────────────────────
@insights_bp.route("/<int:insight_id>", methods=["GET"])
def get_insight(insight_id):
    row = query_db("SELECT * FROM community_insights WHERE id=%s", (insight_id,), one=True)
    if not row:
        return jsonify({"error": "Not found"}), 404
    return jsonify(row)


# ─── POST create insight ───────────────────────────────────────────────────
@insights_bp.route("/", methods=["POST"])
def create_insight():
    data = request.get_json(force=True)
    sql = """
        INSERT INTO community_insights (student_id, student_name, company, role, type, content)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    new_id = execute_db(sql, (
        data.get("student_id"),
        data.get("student_name"),
        data["company"],
        data.get("role"),
        data.get("type", "Interview"),
        data["content"],
    ))
    return jsonify({"message": "Insight posted", "id": new_id}), 201


# ─── POST like an insight ──────────────────────────────────────────────────
@insights_bp.route("/<int:insight_id>/like", methods=["POST"])
def like_insight(insight_id):
    execute_db("UPDATE community_insights SET likes = likes + 1 WHERE id=%s", (insight_id,))
    return jsonify({"message": "Liked"})


# ─── DELETE insight ────────────────────────────────────────────────────────
@insights_bp.route("/<int:insight_id>", methods=["DELETE"])
def delete_insight(insight_id):
    execute_db("DELETE FROM community_insights WHERE id=%s", (insight_id,))
    return jsonify({"message": "Deleted"})
