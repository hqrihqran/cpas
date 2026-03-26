from flask import Blueprint, request, jsonify
from ..db import execute_db, query_db
from .auth import require_auth

interviews_bp = Blueprint("interviews", __name__)

@interviews_bp.route("/share", methods=["POST"])
@require_auth()
def share_interview():
    """Submit a new interview experience"""
    # 1. Verification: Removed domain constraint; allowing all authenticated users.
    
    # 2. Data Extraction
    data = request.get_json(force=True)
    company = data.get("company_name") or data.get("company", "").strip()
    role = data.get("role", "").strip()
    exp_type = data.get("type", "Interview").strip()
    content = data.get("content", "").strip()

    # 3. Input Validation
    if not company or not content:
        return jsonify({"error": "Company and Experience Details are required fields"}), 400
        
    if len(content) < 20:   # Spam threshold check
        return jsonify({"error": "Content is too short to be considered a valuable experience post"}), 400

    # 4. Database Insert
    sql = """
        INSERT INTO community_insights (student_id, student_name, company, role, type, content)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    new_id = execute_db(sql, (
        request.current_user.get("student_id"),
        request.current_user.get("name"),
        company,
        role,
        exp_type,
        content,
    ))
    
    # 5. Response: Return the newly created experience object
    new_row = query_db("SELECT * FROM community_insights WHERE id=%s", (new_id,), one=True)
    return jsonify({"message": "Experience Shared Successfully!", "data": new_row}), 201
