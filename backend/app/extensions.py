"""
extensions.py – Shared extension objects.

Created here so both `app/__init__.py` (which initialises them)
and any route / event module (which uses them) can import the
*same* instance without creating circular dependencies.
"""
from flask_socketio import SocketIO

# cors_allowed_origins is set to "*" here so the Vite dev-server
# on port 5173 can connect; restrict in production via env-var.
socketio = SocketIO(cors_allowed_origins="*", async_mode="threading")
