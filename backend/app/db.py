"""
db.py – thin helper layer over mysql-connector-python.

Every route-handler calls  get_db()  from app/__init__.py.
This module provides cursor helpers so routes stay clean.
"""
import mysql.connector
from flask import g, current_app


def get_db():
    """Return the per-request MySQL connection stored in Flask's g object."""
    if "db" not in g:
        cfg = current_app.config
        g.db = mysql.connector.connect(
            host=cfg["MYSQL_HOST"],
            port=cfg["MYSQL_PORT"],
            user=cfg["MYSQL_USER"],
            password=cfg["MYSQL_PASSWORD"],
            database=cfg["MYSQL_DB"],
        )
    return g.db


def close_db(e=None):
    """Teardown: close the DB connection after every request."""
    db = g.pop("db", None)
    if db is not None and db.is_connected():
        db.close()


def query_db(sql: str, args=(), one: bool = False):
    """
    Execute a SELECT and return list of row-dicts (or a single dict).
    """
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(sql, args)
    rows = cursor.fetchall()
    cursor.close()
    return (rows[0] if rows else None) if one else rows


def execute_db(sql: str, args=()) -> int:
    """
    Execute INSERT / UPDATE / DELETE and commit.
    Returns lastrowid for INSERT, rowcount for others.
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(sql, args)
    conn.commit()
    result = cursor.lastrowid or cursor.rowcount
    cursor.close()
    return result
