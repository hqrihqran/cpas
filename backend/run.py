"""
run.py – Application entry point.

Usage:
    python run.py

Flask-SocketIO requires the server to be started via socketio.run()
(not app.run()) so that the WebSocket upgrade is handled correctly.
"""
from app import create_app
from app.extensions import socketio

app = create_app("development")

if __name__ == "__main__":
    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=app.config["DEBUG"],
        allow_unsafe_werkzeug=True,   # required for SocketIO + Werkzeug dev server
    )
