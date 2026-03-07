"""
users.py – User accounts (roles: Student, Faculty, Management, Admin, Company).

Front-end consumers:
  • LandingPage / Login flow (POST /api/users/login)
  • AdminView.tsx – access control (GET /api/users, PUT /api/users/<id>/role)
"""
from flask import Blueprint, request, jsonify
from ..db import query_db, execute_db
import hashlib

users_bp = Blueprint("users", __name__)

VALID_ROLES = {"Student", "Faculty", "Management", "Admin", "Company"}


def _hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode()).hexdigest()


# ─── GET all users (admin only in real app) ────────────────────────────────
@users_bp.route("/", methods=["GET"])
def get_users():
    rows = query_db("SELECT id, email, full_name, role, is_active, created_at FROM users ORDER BY full_name")
    return jsonify(rows)


# ─── POST register user ────────────────────────────────────────────────────
@users_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    for field in ["email", "password", "full_name", "role"]:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400
    if data["role"] not in VALID_ROLES:
        return jsonify({"error": f"Invalid role. Valid: {VALID_ROLES}"}), 400

    existing = query_db("SELECT id FROM users WHERE email=%s", (data["email"],), one=True)
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    sql = """
        INSERT INTO users (email, password_hash, full_name, role, student_id)
        VALUES (%s, %s, %s, %s, %s)
    """
    new_id = execute_db(sql, (
        data["email"],
        _hash_password(data["password"]),
        data["full_name"],
        data["role"],
        data.get("student_id"),   # optional link to students table
    ))
    return jsonify({"message": "User registered", "id": new_id}), 201


# ─── POST login ────────────────────────────────────────────────────────────
@users_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    row = query_db(
        "SELECT id, email, full_name, role, student_id FROM users WHERE email=%s AND password_hash=%s AND is_active=1",
        (data.get("email"), _hash_password(data.get("password", ""))),
        one=True
    )
    if not row:
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify({"message": "Login successful", "user": row})


# ─── PUT change role ───────────────────────────────────────────────────────
@users_bp.route("/<int:user_id>/role", methods=["PUT"])
def change_role(user_id):
    data = request.get_json(force=True)
    new_role = data.get("role")
    if new_role not in VALID_ROLES:
        return jsonify({"error": "Invalid role"}), 400
    execute_db("UPDATE users SET role=%s WHERE id=%s", (new_role, user_id))
    return jsonify({"message": "Role updated"})


# ─── PUT toggle active status ──────────────────────────────────────────────
@users_bp.route("/<int:user_id>/toggle-active", methods=["PUT"])
def toggle_active(user_id):
    execute_db("UPDATE users SET is_active = NOT is_active WHERE id=%s", (user_id,))
    return jsonify({"message": "Status toggled"})
