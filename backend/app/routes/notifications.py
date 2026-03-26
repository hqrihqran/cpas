"""
routes/notifications.py – REST endpoints for notification persistence.

GET  /api/notifications          – fetch notifications for the current user
POST /api/notifications/<id>/read – mark a notification as read
POST /api/notifications/read-all  – mark all of the user's notifications read
"""
from flask import Blueprint, jsonify, request
from ..db import query_db, execute_db
from .auth import require_auth

notifications_bp = Blueprint("notifications", __name__)


# ─── GET user's notifications ─────────────────────────────────────────────
@notifications_bp.route("/", methods=["GET"])
@require_auth()
def get_notifications():
    """
    Return notifications relevant to the calling user:
      - rows where user_id = their user id  (personal)
      - rows where target_role = their role  (broadcast)
    """
    user   = request.current_user
    uid    = user["sub"]
    # JWT role is lowercase ("student"); DB enum is capitalised ("Student")
    role   = user.get("role", "").capitalize()

    limit  = min(int(request.args.get("limit", 50)), 200)

    rows = query_db(
        """
        SELECT id, user_id, target_role, type, title, message, is_read, created_at
        FROM   notifications
        WHERE  (user_id = %s OR target_role = %s)
        ORDER  BY created_at DESC
        LIMIT  %s
        """,
        (uid, role, limit),
    )

    # Serialise datetime objects
    for r in rows:
        if r.get("created_at"):
            r["created_at"] = r["created_at"].isoformat() + "Z"
        r["is_read"] = bool(r["is_read"])

    return jsonify(rows)


# ─── POST mark single notification read ──────────────────────────────────
@notifications_bp.route("/<int:notif_id>/read", methods=["POST"])
@require_auth()
def mark_read(notif_id):
    uid = request.current_user["sub"]
    execute_db(
        "UPDATE notifications SET is_read = TRUE WHERE id = %s AND user_id = %s",
        (notif_id, uid),
    )
    return jsonify({"message": "Marked as read"})


# ─── POST mark ALL notifications read ────────────────────────────────────
@notifications_bp.route("/read-all", methods=["POST"])
@require_auth()
def mark_all_read():
    user = request.current_user
    uid  = user["sub"]
    role = user.get("role", "").capitalize()

    execute_db(
        """UPDATE notifications
              SET is_read = TRUE
            WHERE (user_id = %s OR target_role = %s) AND is_read = FALSE""",
        (uid, role),
    )
    return jsonify({"message": "All notifications marked as read"})
