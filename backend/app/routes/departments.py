"""
departments.py – Lookup table for college departments.
"""
from flask import Blueprint, request, jsonify
from ..db import query_db, execute_db

departments_bp = Blueprint("departments", __name__)


@departments_bp.route("/", methods=["GET"])
def get_departments():
    return jsonify(query_db("SELECT * FROM departments ORDER BY name"))


@departments_bp.route("/", methods=["POST"])
def create_department():
    data = request.get_json(force=True)
    new_id = execute_db("INSERT INTO departments (name, code) VALUES (%s,%s)",
                        (data["name"], data.get("code")))
    return jsonify({"message": "Department created", "id": new_id}), 201
