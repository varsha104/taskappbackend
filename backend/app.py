from flask import Flask, request, session, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import re
import os

# ================= BASE DIRECTORY FIX (CRITICAL) =================

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ================= APP SETUP =================

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

# Enable CORS for React frontend
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"], supports_credentials=True)

app.secret_key = os.environ.get("SECRET_KEY", "secret123")

# ================= DATABASE CONFIG =================

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    # Use SQLite for local development
    DATABASE_URL = "sqlite:///task_app.db"
else:
    # Fix old postgres:// issue (Render safe)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Avoid idle disconnects on Render
if "postgresql" in DATABASE_URL:
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# ================= MODELS =================

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String(50))
    lname = db.Column(db.String(50))
    contact = db.Column(db.String(10))
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200))
    is_admin = db.Column(db.Boolean, default=False)


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    status = db.Column(db.String(20), default="Pending")
    priority = db.Column(db.String(20))
    deadline = db.Column(db.String(20))
    completed_at = db.Column(db.String(50))

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    admin_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    user = db.relationship("User", foreign_keys=[user_id])
    admin = db.relationship("User", foreign_keys=[admin_id])

# ================= AUTO CREATE TABLES =================

with app.app_context():
    db.create_all()

# ================= HEALTH CHECK =================

@app.route("/health")
def health():
    try:
        db.session.execute(db.text("SELECT 1"))
        return "DB CONNECTED OK"
    except Exception as e:
        return f"DB ERROR: {e}", 500

# ================= LOGIN =================
@app.route("/", methods=["GET"])
def home():
    return {
        "message": "TaskApp Backend is running",
        "status": "OK"
    }

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        role = request.form["role"]
        email = request.form["email"]
        password = request.form["password"]

        user = User.query.filter_by(
            email=email,
            is_admin=True if role == "admin" else False
        ).first()

        if user and bcrypt.check_password_hash(user.password, password):
            session.clear()
            session["name"] = user.fname
            session["user_id"] = user.id

            if role == "admin":
                session["admin"] = True
                session["admin_id"] = user.id

            return jsonify({
                "success": True,
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "name": user.fname,
                    "email": user.email,
                    "role": "admin" if role == "admin" else "user"
                }
            }), 200

        return jsonify({
            "success": False,
            "message": "Invalid credentials"
        }), 401

    return jsonify({"success": False, "message": "Method not allowed"}), 405

# ================= REGISTER =================

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        if request.form["password"] != request.form["confirm_password"]:
            return jsonify({
                "success": False,
                "message": "Passwords do not match"
            }), 400

        if not re.fullmatch(r"\d{10}", request.form["contact"]):
            return jsonify({
                "success": False,
                "message": "Contact must be exactly 10 digits"
            }), 400

        email = request.form["email"]
        if User.query.filter_by(email=email).first():
            return jsonify({
                "success": False,
                "message": "Email already exists"
            }), 400

        role = request.form["role"]

        user = User(
            fname=request.form["fname"],
            lname=request.form["lname"],
            contact=request.form["contact"],
            email=email,
            password=bcrypt.generate_password_hash(
                request.form["password"]
            ).decode("utf-8"),
            is_admin=True if role == "admin" else False,
        )

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Registration successful. Please login."
        }), 201

    return jsonify({"success": False, "message": "Method not allowed"}), 405

# ================= FORGOT PASSWORD =================

@app.route("/forgot", methods=["GET", "POST"])
def forgot():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]

        if password != confirm_password:
            return jsonify({
                "success": False,
                "message": "Passwords do not match"
            }), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({
                "success": False,
                "message": "Email not found"
            }), 404

        user.password = bcrypt.generate_password_hash(password).decode("utf-8")
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Password reset successful. Please login."
        }), 200

    return jsonify({"success": False, "message": "Method not allowed"}), 405

# ================= ADMIN DASHBOARD =================

@app.route("/admin", methods=["GET", "POST"])
def admin():
    if not session.get("admin"):
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    users = User.query.filter_by(is_admin=False).all()

    if request.method == "POST":
        try:
            for uid in request.form.getlist("user_ids"):
                task = Task(
                    title=request.form["title"],
                    priority=request.form["priority"],
                    deadline=request.form["deadline"],
                    user_id=uid,
                    admin_id=session["admin_id"],
                )
                db.session.add(task)

            db.session.commit()
            return jsonify({
                "success": True,
                "message": "Task assigned successfully"
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": str(e)
            }), 400

    tasks = Task.query.filter_by(admin_id=session["admin_id"]).all()
    
    return jsonify({
        "success": True,
        "users": [{
            "id": u.id,
            "fname": u.fname,
            "lname": u.lname,
            "email": u.email
        } for u in users],
        "tasks": [{
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "deadline": t.deadline,
            "completed_at": t.completed_at,
            "user_id": t.user_id,
            "user_name": t.user.fname + " " + t.user.lname if t.user else ""
        } for t in tasks]
    }), 200

# ================= EDIT TASK =================

@app.route("/edit_task/<int:id>", methods=["GET", "POST"])
def edit_task(id):
    if not session.get("admin"):
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    task = Task.query.get_or_404(id)

    if task.admin_id != session.get("admin_id"):
        return jsonify({"success": False, "message": "Unauthorized access"}), 403

    if request.method == "GET":
        return jsonify({
            "success": True,
            "task": {
                "id": task.id,
                "title": task.title,
                "priority": task.priority,
                "deadline": task.deadline,
                "status": task.status
            }
        }), 200

    if request.method == "POST":
        try:
            task.title = request.form["title"]
            task.priority = request.form["priority"]
            task.deadline = request.form["deadline"]
            db.session.commit()

            return jsonify({
                "success": True,
                "message": "Task updated successfully"
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": str(e)
            }), 400

# ================= DELETE TASK =================

@app.route("/delete_task/<int:id>")
def delete_task(id):
    if not session.get("admin"):
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    task = Task.query.get_or_404(id)

    if task.admin_id != session.get("admin_id"):
        return jsonify({"success": False, "message": "Unauthorized action"}), 403

    try:
        db.session.delete(task)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Task deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

# ================= USER DASHBOARD =================

@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    tasks = Task.query.filter_by(user_id=session["user_id"]).all()
    
    return jsonify({
        "success": True,
        "user_name": session.get("name", ""),
        "tasks": [{
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "deadline": t.deadline,
            "completed_at": t.completed_at
        } for t in tasks]
    }), 200

# ================= MARK TASK DONE =================

@app.route("/done/<int:id>")
def done(id):
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    task = Task.query.get_or_404(id)

    if task.user_id != session.get("user_id"):
        return jsonify({"success": False, "message": "Unauthorized"}), 403

    try:
        task.status = "Done"
        task.completed_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Task marked as done",
            "task": {
                "id": task.id,
                "status": task.status,
                "completed_at": task.completed_at
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400

# ================= LOGOUT =================

@app.route("/logout")
def logout():
    session.clear()
    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    }), 200

# ================= LOCAL RUN =================

if __name__ == "__main__":
    app.run(debug=True)

