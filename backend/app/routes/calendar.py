from flask import Blueprint, jsonify
from ..db import query_db

calendar_events_bp = Blueprint("calendar_events", __name__)

@calendar_events_bp.route("/<int:student_id>", methods=["GET"])
def get_calendar_events(student_id):
    events = []
    
    # Query 1: Fetch all tasks assigned to the student from mentor_tasks
    try:
        tasks = query_db("""
            SELECT id, title, deadline 
            FROM mentor_tasks 
            WHERE student_id = %s
        """, (student_id,))
        for t in tasks:
            events.append({
                "id": f"task-{t['id']}",
                "title": t["title"],
                "date": t["deadline"].isoformat() if hasattr(t["deadline"], 'isoformat') else t["deadline"],
                "type": "task",
                "color": "blue"
            })
    except Exception as e:
        print(f"Error fetching tasks for calendar: {e}")

    # Query 2: Fetch all companies the student is pipelined for
    try:
        companies = query_db("""
            SELECT id, name, logo_url, drive_date 
            FROM pipelined_companies
        """)
        for c in companies:
            events.append({
                "id": f"company-{c['id']}",
                "title": f"{c['name']} Drive",
                "date": c["drive_date"].isoformat() if hasattr(c["drive_date"], 'isoformat') else str(c["drive_date"]) if c["drive_date"] else None,
                "type": "placement",
                "color": "gold",
                "logo_url": c.get("logo_url", "")
            })
    except Exception as e:
        print(f"Error fetching pipelined companies for calendar: {e}")

    # Sort chronologically
    events.sort(key=lambda x: str(x["date"]) if x["date"] else "")
    
    return jsonify(events)
