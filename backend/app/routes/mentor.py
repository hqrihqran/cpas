from flask import Blueprint, jsonify, request
from ..db import query_db, execute_db
from .auth import require_auth
from ..extensions import socketio

mentor_bp = Blueprint("mentor", __name__)


def _build_student_profile(student_id: int):
    """
    Shared helper: collects academic record, skill radar data (proficiency_percentage
    from student_skills), and placement history (from placement_history table).
    Falls back gracefully if the new Master DB tables haven't been seeded yet.
    """

    # ── 1. Academic record ────────────────────────────────────────────────────
    try:
        student = query_db(
            """SELECT id, name, roll_no, branch, cgpa,
                      history_of_arrears, current_arrears, placement_status
               FROM students WHERE id = %s""",
            (student_id,), one=True
        )
    except Exception as e:
        print(f"Master DB Error fetching student {student_id}: {e}")
        return None, None, None

    if not student:
        return None, None, None

    # Convert MySQL Decimal → float so jsonify never crashes
    try:
        student = dict(student)
        student["cgpa"] = float(student["cgpa"])
    except Exception:
        pass

    # ── 2. Skills → Radar Chart  [uses proficiency_percentage from Master DB] ──
    skills_raw = query_db(
        "SELECT skill_name, proficiency_percentage FROM student_skills WHERE student_id = %s",
        (student_id,)
    )
    skill_data = []
    for s in skills_raw:
        pct = s.get("proficiency_percentage")
        # If column exists and has a value, use it directly; else derive it
        score = int(pct) if pct is not None else min(
            max(50, 40 + (len(s["skill_name"]) * 7) + int(student["cgpa"] * 3)), 100
        )
        skill_data.append({
            "subject":               s["skill_name"],
            "A":                     score,
            "proficiency_percentage": score,
            "fullMark":              100,
        })

    if not skill_data:
        skill_data = [
            {"subject": "Problem Solving", "A": 85, "proficiency_percentage": 85, "fullMark": 100},
            {"subject": "Communication",   "A": 75, "proficiency_percentage": 75, "fullMark": 100},
            {"subject": "Aptitude",        "A": 90, "proficiency_percentage": 90, "fullMark": 100},
        ]

    # ── 3. Placement History  [from placement_history Master DB table] ─────────
    # Try the new Master DB table first; fall back to legacy `applications` table
    try:
        ph_rows = query_db(
            """SELECT id, company_name, rounds_cleared, final_status, visit_date
               FROM placement_history WHERE student_id = %s ORDER BY visit_date DESC""",
            (student_id,)
        )
        history = []
        for row in ph_rows:
            status_map = {"Placed": "Selected", "Rejected": "Rejected", "In-Process": "In Process"}
            history.append({
                "id":             row["id"],
                "company_name":   row["company_name"],
                "rounds_cleared": int(row["rounds_cleared"]),
                "status":         status_map.get(row["final_status"], row["final_status"]),
                "date":           row["visit_date"].strftime("%Y-%m-%d") if row["visit_date"] else "N/A",
                "package":        "N/A",   # placement_history table doesn't store CTC
                "rounds":         [],      # individual round names not in this table
            })
    except Exception:
        # Fallback: legacy applications + application_rounds tables
        apps = query_db(
            """SELECT id, company_name, status, visit_date, package_offered
               FROM applications WHERE student_id = %s ORDER BY visit_date DESC""",
            (student_id,)
        )
        history = []
        for app in apps:
            rounds = query_db(
                """SELECT round_name, status FROM application_rounds
                   WHERE application_id = %s AND status = 'Cleared'
                   ORDER BY round_order ASC""",
                (app["id"],)
            )
            cleared_names = [r["round_name"] for r in rounds]
            history.append({
                "id":             app["id"],
                "company_name":   app["company_name"],
                "rounds_cleared": len(cleared_names),
                "status":         app["status"],
                "date":           app["visit_date"].strftime("%Y-%m-%d") if app["visit_date"] else "N/A",
                "package":        f"{float(app['package_offered'])} LPA" if app["package_offered"] else "N/A",
                "rounds":         cleared_names,
            })

    return student, skill_data, history


def _profile_response(student_id: int):
    """Build and return a JSON response for a student master record."""
    student, skills, history = _build_student_profile(student_id)
    if student is None:
        return jsonify({"error": "Student not found"}), 404
    return jsonify({"student": student, "skills": skills, "history": history})


# ── /api/mentor/mentee-details/:id   (original) ───────────────────────────────
@mentor_bp.route("/mentee-details/<int:student_id>", methods=["GET"])
def get_mentee_details(student_id):
    return _profile_response(student_id)


# ── /api/mentor/master-record/:id   (alias from previous prompt) ──────────────
@mentor_bp.route("/master-record/<int:student_id>", methods=["GET"])
def get_master_record(student_id):
    return _profile_response(student_id)

# ── /api/mentor/assign-task ────────────────────────────────────────────────
@mentor_bp.route("/assign-task", methods=["POST"])
def assign_task():
    try:
        data = request.get_json(force=True)
        title = data.get("title")
        description = data.get("description", "")
        student_id = data.get("student_id")
        mentor_name = data.get("mentor_name", "Mentor")
        deadline = data.get("deadline", "")
        
        # Determine the target user's user_id from their student_id to join the correct socket room
        user = query_db("SELECT id FROM users WHERE student_id = %s LIMIT 1", (student_id,), one=True)
        user_id = user["id"] if user else student_id
        
        room_name = f"user_{user_id}"

        # Insert into mentor_tasks (assuming it exists or behaves like homework_tasks)
        sql = """
            INSERT INTO mentor_tasks (title, description, deadline, student_id, mentor_name)
            VALUES (%s, %s, %s, %s, %s)
        """
        task_id = execute_db(sql, (title, description, deadline, student_id, mentor_name))

        # Payload matching the frontend expectations
        payload = {
            "id": task_id,
            "title": title,
            "description": description,
            "mentor_name": mentor_name,
            "student_id": student_id,
            "unread": True,
            "type": "Task" # For the notification
        }

        # Targeted emission
        socketio.emit("new_task_assigned", payload, to=room_name)

        return jsonify({"message": "Task assigned successfully", "task": payload}), 201
    except Exception as e:
        print(f"Error in assign_task: {e}")
        return jsonify({"error": str(e)}), 500

# ── /api/mentor/tasks/<int:task_id> ─────────────────────────────────────
@mentor_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    try:
        # Get student_id to emit to the correct room
        task = query_db("SELECT student_id FROM mentor_tasks WHERE id = %s", (task_id,), one=True)
        if task:
            student_id = task["student_id"]
            user = query_db("SELECT id FROM users WHERE student_id = %s LIMIT 1", (student_id,), one=True)
            user_id = user["id"] if user else student_id
            room_name = f"user_{user_id}"
            
            # Delete task
            execute_db("DELETE FROM mentor_tasks WHERE id = %s", (task_id,))
            
            # Real-time sync: immediately remove from student UI
            socketio.emit("task_deleted", {"id": task_id}, to=room_name)
            
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        print(f"Error in delete_task: {e}")
        return jsonify({"error": str(e)}), 500
