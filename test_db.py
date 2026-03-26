import mysql.connector

try:
    # Assuming connection is based on usual cpas defaults, let's just use the flask db connection logic
    import sys
    sys.path.append('backend')
    from app import create_app
    from app.db import query_db, get_db
    app = create_app()
    with app.app_context():
        res = query_db("SELECT * FROM pipelined_companies")
        print("PIPELINED COMPANIES:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
