from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS  # Add this import
from dotenv import load_dotenv
import os

db = SQLAlchemy()
mail = Mail()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    load_dotenv()  # Load .env from the project root

    # Ensure config is set before initializing extensions
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DB_URI", "sqlite:///nilotic_wallet.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "your-secret-key")
    app.config["APP_HOST"] = os.getenv("APP_HOST", "0.0.0.0")
    app.config["APP_PORT"] = int(os.getenv("APP_PORT", 5500))
    app.config["BASE_URL"] = os.getenv("BASE_URL", "http://localhost:5500")
    app.config["NILOTIC_API"] = os.getenv("NILOTIC_API", "http://localhost:8080")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", app.config["SECRET_KEY"])
    app.config["SIMULATE_MINING"] = os.getenv("SIMULATE_MINING", "True") == "True"
    app.config["CORS_ORIGIN_URL"] = os.getenv("CORS_ORIGIN_URL", "http://localhost:5173")

    app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "localhost")
    app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 1025))
    app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "False") == "True"
    app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL", "False") == "True"
    app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_DEFAULT_SENDER", "no-reply@niloticwallet.com")

    # Initialize extensions after config is set
    db.init_app(app)
    mail.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    from app.routes.auth import auth_bp
    from app.routes.wallet import wallet_bp
    from app.routes.transaction import transaction_bp
    from app.routes.mining import mining_bp
    from app.cli import cli_bp
    # Add escrow_bp if you have an escrow route
    # from app.routes.escrow import escrow_bp

    # Enable CORS using CORS_ORIGIN_URL from config
    CORS(app, resources={r"/*": {"origins": app.config["CORS_ORIGIN_URL"]}})

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(wallet_bp, url_prefix="/wallet")
    app.register_blueprint(transaction_bp, url_prefix="/transaction")
    app.register_blueprint(mining_bp, url_prefix="/mining")
    app.register_blueprint(cli_bp)  # Register CLI blueprint (no URL prefix needed)

    # app.register_blueprint(escrow_bp, url_prefix="/escrow")

    with app.app_context():
        db.create_all()

    return app