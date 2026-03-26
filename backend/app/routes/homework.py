"""
homework.py – CRUD + task-completion endpoints for the homework / tasks system.

Front-end consumers:
  • FacultyHomework.tsx         (GET, POST /api/homework)
  • ActiveProcessTracker.tsx   (GET /api/homework?student_id=X)
  • task completion             (POST /api/homework/<id>/complete)
"""
from flask import Blueprint, request, jsonify
from ..db import query_db, execute_db
from ..notifications import save_and_emit

homework_bp = Blueprint("homework", __name__)


# ─── GET all homework tasks (optionally by student) ────────────────────────
@homework_bp.route("/", methods=["GET"])
def get_tasks():
    student_id = request.args.get("student_id")
    if student_id:
        sql = """
            SELECT ht.*,
                   GROUP_CONCAT(DISTINCT hta.student_id  SEPARATOR ',') AS assigned_to,
                   GROUP_CONCAT(DISTINCT htv.student_id  SEPARATOR ',') AS viewed_by,
                   GROUP_CONCAT(DISTINCT htc.student_id  SEPARATOR ',') AS completed_by
            FROM   homework_tasks ht
            JOIN   homework_assigned  hta ON ht.id = hta.task_id AND hta.student_id = %s
            LEFT JOIN homework_viewed htv ON ht.id = htv.task_id
            LEFT JOIN homework_completed htc ON ht.id = htc.task_id
            GROUP BY ht.id
            ORDER BY ht.deadline ASC
        """
        rows = query_db(sql, (student_id,))
    else:
        sql = """
            SELECT ht.*,
                   GROUP_CONCAT(DISTINCT hta.student_id  SEPARATOR ',') AS assigned_to,
                   GROUP_CONCAT(DISTINCT htv.student_id  SEPARATOR ',') AS viewed_by,
                   GROUP_CONCAT(DISTINCT htc.student_id  SEPARATOR ',') AS completed_by
            FROM   homework_tasks ht
            LEFT JOIN homework_assigned  hta ON ht.id = hta.task_id
            LEFT JOIN homework_viewed    htv ON ht.id = htv.task_id
            LEFT JOIN homework_completed htc ON ht.id = htc.task_id
            GROUP BY ht.id
            ORDER BY ht.created_at DESC
        """
        rows = query_db(sql)
    return jsonify([_parse_task(r) for r in rows])


# ─── GET single task ───────────────────────────────────────────────────────
@homework_bp.route("/<int:task_id>", methods=["GET"])
def get_task(task_id):
    sql = """
        SELECT ht.*,
               GROUP_CONCAT(DISTINCT hta.student_id  SEPARATOR ',') AS assigned_to,
               GROUP_CONCAT(DISTINCT htv.student_id  SEPARATOR ',') AS viewed_by,
               GROUP_CONCAT(DISTINCT htc.student_id  SEPARATOR ',') AS completed_by
        FROM   homework_tasks ht
        LEFT JOIN homework_assigned  hta ON ht.id = hta.task_id
        LEFT JOIN homework_viewed    htv ON ht.id = htv.task_id
        LEFT JOIN homework_completed htc ON ht.id = htc.task_id
        WHERE  ht.id = %s
        GROUP BY ht.id
    """
    row = query_db(sql, (task_id,), one=True)
    if not row:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(_parse_task(row))


# ─── POST create task ──────────────────────────────────────────────────────
@homework_bp.route("/", methods=["POST"])
def create_task():
    data = request.get_json(force=True)
    sql = """
        INSERT INTO homework_tasks (title, description, deadline, created_by_faculty_id)
        VALUES (%s, %s, %s, %s)
    """
    task_id = execute_db(sql, (
        data["title"],
        data.get("description"),
        data.get("deadline"),
        data.get("faculty_id"),
    ))
    assigned_to = data.get("assigned_to", [])
    for sid in assigned_to:
        execute_db("INSERT INTO homework_assigned (task_id, student_id) VALUES (%s,%s)", (task_id, sid))

    # ── Emit a targeted notification to each assigned mentee ────────────────
    # Look up the user_id for each student_id so we can target the
    # correct socket room ("user_<user_id>") and store the correct FK.
    for sid in assigned_to:
        try:
            student_user = query_db(
                "SELECT id FROM users WHERE student_id = %s LIMIT 1",
                (sid,),
                one=True,
            )
            target_user_id = student_user["id"] if student_user else None

            save_and_emit(
                event="new_notification",
                notif_type="Task",
                title=f"New Task Assigned: {data['title']}",
                message=(
                    f"You have been assigned a new task: \"{data['title']}\". "
                    + (f"Deadline: {data['deadline']}" if data.get('deadline') else "")
                ),
                user_id=target_user_id,
                target_role=None,            # personal, not a broadcast
                room=f"user_{target_user_id}" if target_user_id else None,
                broadcast=(target_user_id is None),
            )
        except Exception as e:
            print(f"[Notifications] Failed to emit new_task for student {sid}: {e}")

    return jsonify({"message": "Task created", "id": task_id}), 201


# ─── POST mark task viewed by student ─────────────────────────────────────
@homework_bp.route("/<int:task_id>/view", methods=["POST"])
def mark_viewed(task_id):
    data = request.get_json(force=True)
    student_id = data.get("student_id")
    execute_db(
        "INSERT IGNORE INTO homework_viewed (task_id, student_id) VALUES (%s,%s)",
        (task_id, student_id)
    )
    return jsonify({"message": "Marked as viewed"})


# ─── POST mark task completed by student ──────────────────────────────────
@homework_bp.route("/<int:task_id>/complete", methods=["POST"])
def mark_complete(task_id):
    data = request.get_json(force=True)
    student_id = data.get("student_id")
    execute_db(
        "INSERT IGNORE INTO homework_completed (task_id, student_id) VALUES (%s,%s)",
        (task_id, student_id)
    )
    return jsonify({"message": "Marked as completed"})


# ─── DELETE task ───────────────────────────────────────────────────────────
@homework_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    execute_db("DELETE FROM homework_tasks WHERE id=%s", (task_id,))
    return jsonify({"message": "Task deleted"})


# ── helper ────────────────────────────────────────────────────────────────
def _parse_task(r):
    r["assigned_to"]  = [x for x in (r.get("assigned_to")  or "").split(",") if x]
    r["viewed_by"]    = [x for x in (r.get("viewed_by")    or "").split(",") if x]
    r["completed_by"] = [x for x in (r.get("completed_by") or "").split(",") if x]
    return r
