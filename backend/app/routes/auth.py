"""
auth.py – JWT authentication & Google OAuth endpoints.

Endpoints:
  POST /api/auth/register    – email/password signup
  POST /api/auth/login       – email/password login → returns access + refresh tokens
  POST /api/auth/google      – Google ID-token verification → returns tokens
  POST /api/auth/refresh     – use refresh token to get new access token
  GET  /api/auth/me          – returns current user info from token
  POST /api/auth/logout      – client-side signal (token is stateless; just a convention)
"""
from flask import Blueprint, request, jsonify, current_app
from functools import wraps
import hashlib
import datetime
import jwt as pyjwt          # PyJWT
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from ..db import query_db, execute_db

auth_bp = Blueprint("auth", __name__)

VALID_ROLES = {"Student", "Faculty", "Management", "Admin", "Company"}

# Map DB role names → frontend role keys (lowercase)
ROLE_MAP = {
    "Student":    "student",
    "Faculty":    "faculty",
    "Management": "management",
    "Admin":      "admin",
    "Company":    "company",
}
# Reverse: frontend → DB
ROLE_MAP_REVERSE = {v: k for k, v in ROLE_MAP.items()}


# ─── Helpers ────────────────────────────────────────────────────────────────

def _hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode()).hexdigest()


def _make_tokens(user: dict) -> dict:
    """Create a JWT access token and a refresh token for the given user row."""
    secret = current_app.config["SECRET_KEY"]
    now = datetime.datetime.utcnow()

    payload = {
        "sub":  str(user["id"]),
        "email": user["email"],
        "name":  user["full_name"],
        "role":  ROLE_MAP.get(user["role"], "student"),
        "student_id": user.get("student_id"),
        "iat": now,
        "exp": now + datetime.timedelta(hours=8),
    }
    access_token = pyjwt.encode(payload, secret, algorithm="HS256")

    refresh_payload = {
        "sub":  str(user["id"]),
        "type": "refresh",
        "iat":  now,
        "exp":  now + datetime.timedelta(days=30),
    }
    refresh_token = pyjwt.encode(refresh_payload, secret, algorithm="HS256")

    return {
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "user": {
            "id":         user["id"],
            "email":      user["email"],
            "full_name":  user["full_name"],
            "role":       ROLE_MAP.get(user["role"], "student"),
            "student_id": user.get("student_id"),
        }
    }


def _decode_access_token(token: str) -> dict | None:
    try:
        secret = current_app.config["SECRET_KEY"]
        return pyjwt.decode(token, secret, algorithms=["HS256"])
    except pyjwt.ExpiredSignatureError:
        return None
    except pyjwt.InvalidTokenError:
        return None


# ─── RBAC decorator ─────────────────────────────────────────────────────────

def require_auth(roles: list[str] | None = None):
    """
    Decorator that requires a valid JWT.
    If `roles` is given (list of lowercase role names), the user's role must be in the list.

    Usage:
        @require_auth()                         # any authenticated user
        @require_auth(["admin"])               # admin only
        @require_auth(["admin", "faculty"])    # admin or faculty
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid authorization header"}), 401

            token = auth_header[7:]
            payload = _decode_access_token(token)
            if payload is None:
                return jsonify({"error": "Token expired or invalid"}), 401

            if roles and payload.get("role") not in roles:
                return jsonify({
                    "error": "Forbidden",
                    "message": f"This action requires one of these roles: {roles}"
                }), 403

            # Attach payload to request for use in the view
            request.current_user = payload
            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ─── Routes ──────────────────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    required = ["email", "password", "full_name", "role"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"'{field}' is required"}), 400

    # Accept both "Student" and "student" as valid roles
    raw_role = data["role"]
    db_role = ROLE_MAP_REVERSE.get(raw_role.lower(), raw_role)
    if db_role not in VALID_ROLES:
        return jsonify({"error": f"Invalid role. Valid roles: {list(VALID_ROLES)}"}), 400

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
        db_role,
        data.get("student_id"),
    ))

    user = query_db(
        "SELECT id, email, full_name, role, student_id FROM users WHERE id=%s",
        (new_id,), one=True
    )
    return jsonify(_make_tokens(user)), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    row = query_db(
        """SELECT id, email, full_name, role, student_id
           FROM users
           WHERE email=%s AND password_hash=%s AND is_active=1""",
        (data.get("email"), _hash_password(data.get("password", ""))),
        one=True
    )
    if not row:
        return jsonify({"error": "Invalid credentials or account is inactive"}), 401

    return jsonify(_make_tokens(row))


@auth_bp.route("/google", methods=["POST"])
def google_login():
    """
    Verify a Google ID-token sent by the frontend (@react-oauth/google).

    Two-phase flow for NEW users:
      Phase 1 – credential only (no role):
        Returns { needs_role: true, google_name, google_email, credential }
        so the frontend can show a role-picker.
      Phase 2 – credential + role:
        Creates the user with the chosen role and returns tokens.

    Existing users are logged in directly (their role is already in DB).
    """
    data = request.get_json(force=True)
    id_token_str = data.get("credential") or data.get("id_token")
    if not id_token_str:
        return jsonify({"error": "'credential' is required"}), 400

    google_client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    if not google_client_id:
        return jsonify({"error": "Google OAuth not configured on the server"}), 503

    try:
        idinfo = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            google_client_id,
            clock_skew_in_seconds=10   # tolerate up to 10s of clock drift
        )
    except ValueError as e:
        return jsonify({"error": f"Invalid Google token: {str(e)}"}), 401

    email     = idinfo.get("email")
    full_name = idinfo.get("name", email)
    google_id = idinfo.get("sub")

    # Check if user already exists
    user = query_db(
        "SELECT id, email, full_name, role, student_id FROM users WHERE email=%s",
        (email,), one=True
    )

    if user:
        # Existing user – log them in directly
        return jsonify(_make_tokens(user))

    # New user – check if a role was provided
    raw_role = data.get("role", "").strip()
    if not raw_role:
        # Phase 1: ask frontend to choose a role
        return jsonify({
            "needs_role": True,
            "google_name":  full_name,
            "google_email": email,
        }), 200

    # Phase 2: role provided – resolve and create the user
    db_role = ROLE_MAP_REVERSE.get(raw_role.lower(), raw_role)
    if db_role not in VALID_ROLES:
        return jsonify({"error": f"Invalid role. Valid: {list(VALID_ROLES)}"}), 400

    new_id = execute_db(
        "INSERT INTO users (email, password_hash, full_name, role, google_id) VALUES (%s, %s, %s, %s, %s)",
        (email, "", full_name, db_role, google_id)
    )
    user = query_db(
        "SELECT id, email, full_name, role, student_id FROM users WHERE id=%s",
        (new_id,), one=True
    )
    return jsonify(_make_tokens(user)), 201


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    data = request.get_json(force=True)
    refresh_token = data.get("refresh_token")
    if not refresh_token:
        return jsonify({"error": "'refresh_token' is required"}), 400

    try:
        secret = current_app.config["SECRET_KEY"]
        payload = pyjwt.decode(refresh_token, secret, algorithms=["HS256"])
    except pyjwt.ExpiredSignatureError:
        return jsonify({"error": "Refresh token expired, please log in again"}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({"error": "Invalid refresh token"}), 401

    if payload.get("type") != "refresh":
        return jsonify({"error": "Not a refresh token"}), 400

    user_id = payload.get("sub")
    user = query_db(
        "SELECT id, email, full_name, role, student_id FROM users WHERE id=%s AND is_active=1",
        (user_id,), one=True
    )
    if not user:
        return jsonify({"error": "User not found or inactive"}), 401

    return jsonify(_make_tokens(user))


@auth_bp.route("/me", methods=["GET"])
@require_auth()
def me():
    """Return the currently authenticated user's profile from the DB."""
    user_id = request.current_user["sub"]
    user = query_db(
        "SELECT id, email, full_name, role, student_id, is_active, created_at FROM users WHERE id=%s",
        (user_id,), one=True
    )
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["role"] = ROLE_MAP.get(user["role"], "student")
    return jsonify(user)


@auth_bp.route("/logout", methods=["POST"])
def logout():
    # Stateless JWTs – client just discards the token.
    # This endpoint exists as a convention and for future token blocklisting.
    return jsonify({"message": "Logged out successfully"})
