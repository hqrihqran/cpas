"""
socket_events.py – Flask-SocketIO namespace and event handlers.

Namespace: /notifications

On connect:
  • The client must supply a JWT via the `token` query-param or
    Authorization header (passed in the Socket.IO handshake).
  • On success the socket is joined to two rooms:
      - "role_<Role>"          e.g. "role_Student"
      - "user_<user_id>"       e.g. "user_42"
  • On failure the connection is rejected (disconnect is called).
"""
import jwt as pyjwt
from flask import request, current_app
from flask_socketio import Namespace, emit, join_room, disconnect


class NotificationNamespace(Namespace):

    # ── connection ─────────────────────────────────────────────────────────

    def on_connect(self):
        """Authenticate and join the appropriate rooms."""
        # Token may arrive as a query-param (?token=...) or
        # in the HTTP Authorization header of the upgrade request.
        token = (
            request.args.get("token")
            or _bearer_from_headers()
        )

        if not token:
            print("[SocketIO] Rejected: no token supplied")
            disconnect()
            return

        payload = _decode_token(token)
        if payload is None:
            print("[SocketIO] Rejected: invalid / expired token")
            disconnect()
            return

        user_id = payload.get("sub")
        # Role in JWT is lowercase frontend key ("student", "faculty", …).
        # Capitalise to match the DB enum and room names.
        role = payload.get("role", "").capitalize()   # "Student", "Faculty" …

        # Personal room: targeted notifications
        join_room(f"user_{user_id}")
        # Role broadcast room
        join_room(f"role_{role}")

        print(f"[SocketIO] Connected user_id={user_id} role={role} "
              f"sid={request.sid}")

        emit("connected", {
            "message": "Notification socket authenticated",
            "user_id": user_id,
            "role":    role,
        })

    # ── disconnection ──────────────────────────────────────────────────────

    def on_disconnect(self):
        print(f"[SocketIO] Disconnected sid={request.sid}")

    # ── ping (optional keep-alive / test from client) ──────────────────────

    def on_ping_server(self, data=None):
        emit("pong_server", {"status": "ok"})


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _bearer_from_headers() -> str | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return None


def _decode_token(token: str) -> dict | None:
    try:
        secret = current_app.config["SECRET_KEY"]
        return pyjwt.decode(token, secret, algorithms=["HS256"])
    except (pyjwt.ExpiredSignatureError, pyjwt.InvalidTokenError):
        return None
