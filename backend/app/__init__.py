from flask import Flask
from flask_cors import CORS
from .db import close_db


def create_app(env: str = "default") -> Flask:
    from config import config  # config.py lives in backend/ (parent of this package)

    app = Flask(__name__)
    app.config.from_object(config[env])

    # ── CORS: allow Vite dev-server ─────────────────────────────────────────
    origins = app.config["CORS_ORIGINS"].split(",")
    CORS(app, resources={r"/api/*": {"origins": origins}})

    # ── Tear down DB connection after each request ───────────────────────────
    app.teardown_appcontext(close_db)

    # ── Register blueprints (relative imports – no `app.` prefix needed) ────
    from .routes.students     import students_bp
    from .routes.companies    import companies_bp
    from .routes.applications import applications_bp
    from .routes.homework     import homework_bp
    from .routes.insights     import insights_bp
    from .routes.analytics    import analytics_bp
    from .routes.departments  import departments_bp
    from .routes.users        import users_bp

    app.register_blueprint(students_bp,     url_prefix="/api/students")
    app.register_blueprint(companies_bp,    url_prefix="/api/companies")
    app.register_blueprint(applications_bp, url_prefix="/api/applications")
    app.register_blueprint(homework_bp,     url_prefix="/api/homework")
    app.register_blueprint(insights_bp,     url_prefix="/api/insights")
    app.register_blueprint(analytics_bp,   url_prefix="/api/analytics")
    app.register_blueprint(departments_bp,  url_prefix="/api/departments")
    app.register_blueprint(users_bp,        url_prefix="/api/users")

    # ── Health check ─────────────────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return {"status": "ok", "app": "Campus Compass API"}

    return app
