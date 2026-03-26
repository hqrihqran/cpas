"""
notifications.py – Core helpers for the notification system.

Provides:
  save_notification(conn, ...)  – persist a row to `notifications` table
  emit_notification(...)        – emit a SocketIO event
  save_and_emit(...)            – convenience wrapper that does both
"""
import datetime
from .extensions import socketio
from .db import get_db


# ─── DB persistence ──────────────────────────────────────────────────────────

def save_notification(user_id: int | None,
                      notif_type: str,
                      title: str,
                      message: str,
                      target_role: str | None = None) -> int:
    """
    Insert one row into `notifications` and return the new row id.

    user_id       – NULL means it is a broadcast (e.g. all Students)
    target_role   – 'Student' | 'Faculty' | etc. stored for query filtering
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO notifications
               (user_id, target_role, type, title, message, is_read, created_at)
           VALUES (%s, %s, %s, %s, %s, FALSE, %s)""",
        (
            user_id,
            target_role,
            notif_type,
            title,
            message,
            datetime.datetime.utcnow(),
        ),
    )
    conn.commit()
    new_id = cursor.lastrowid
    cursor.close()
    return new_id


# ─── Real-time emit ──────────────────────────────────────────────────────────

def emit_notification(event: str,
                      payload: dict,
                      room: str | None = None,
                      broadcast: bool = False):
    """
    Emit `event` via SocketIO.

    If `room` is given, emit only to that room.
    If `broadcast` is True with no room, emit to every connected client.
    """
    socketio.emit(event, payload,
                  namespace="/notifications",
                  room=room,
                  broadcast=broadcast)


# ─── Combined helper ─────────────────────────────────────────────────────────

def save_and_emit(event: str,
                  notif_type: str,
                  title: str,
                  message: str,
                  user_id: int | None = None,
                  target_role: str | None = None,
                  room: str | None = None,
                  broadcast: bool = False) -> int:
    """
    Persist the notification to MySQL, then push it over WebSocket.

    Returns the new notification id.
    """
    notif_id = save_notification(
        user_id=user_id,
        notif_type=notif_type,
        title=title,
        message=message,
        target_role=target_role,
    )

    payload = {
        "id":         notif_id,
        "type":       notif_type,
        "title":      title,
        "message":    message,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z",
        "is_read":    False,
    }

    emit_notification(event, payload, room=room, broadcast=broadcast)
    return notif_id
