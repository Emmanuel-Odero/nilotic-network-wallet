from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from app import db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.kyc import KYC  # Import KYC at the top
from app.utils import sync_wallet_with_blockchain
from app.email import send_email
import uuid
import requests
from datetime import datetime, timedelta
from sqlalchemy.exc import OperationalError
import os

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered"}), 400

        token = str(uuid.uuid4())
        user = User(email=email, verification_token=token)
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        frontend_url = current_app.config["FRONTEND_URL"]
        verify_link = f"{frontend_url}/verify-email?token={token}"
        send_email(email, "Verify Your Email", f"Click here to verify your email: {verify_link}")
        db.session.commit()
        return jsonify({"message": "User registered. Check your email for verification link."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Registration failed", "details": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password"}), 401
        
        if not user.verified:
            return jsonify({"error": "Email not verified"}), 401
        
        if not user.kyc_completed:
            if not user.kyc_token or user.kyc_token_expiry < datetime.utcnow():
                user.kyc_token = str(uuid.uuid4())
                user.kyc_token_expiry = datetime.utcnow() + timedelta(minutes=30)
                db.session.commit()
            
            return jsonify({
                "message": "Please complete KYC to proceed.",
                "user_id": user.id,
                "kyc_token": user.kyc_token,
                "kyc_required": True  # Add flag for frontend
            }), 200  # Change to 200 to allow frontend to handle redirection

        access_token = create_access_token(identity=str(user.id))
        return jsonify({"message": "Login successful", "access_token": access_token}), 200
    except OperationalError as e:
        return jsonify({"error": "Database error", "details": "Please contact support: " + str(e)}), 500
    except Exception as e:
        return jsonify({"error": "Login failed", "details": str(e)}), 500

@auth_bp.route("/verify", methods=["GET"])
def verify_email():
    try:
        token = request.args.get("token")
        user = User.query.filter_by(verification_token=token).first()

        if not user:
            return jsonify({"error": "Invalid or expired token"}), 400
        
        if user.verified:
            return jsonify({"error": "Email already verified"}), 400

        user.verified = True
        user.verification_token = None
        user.kyc_token = str(uuid.uuid4())
        user.kyc_token_expiry = datetime.utcnow() + timedelta(minutes=30)
        db.session.commit()

        frontend_url = current_app.config["FRONTEND_URL"]
        kyc_link = f"{frontend_url}/auth/kyc/{user.id}?token={user.kyc_token}"
        send_email(
            user.email,
            "Complete Your KYC",
            f"Click here to complete your KYC: {kyc_link}"
        )
        return jsonify({
            "message": "Email verified. Please complete KYC.",
            "user_id": user.id,
            "kyc_token": user.kyc_token
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Verification failed", "details": str(e)}), 500

@auth_bp.route("/kyc/<int:user_id>", methods=["POST"])
def submit_kyc(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if user.kyc_completed:
            return jsonify({"error": "KYC already completed"}), 400

        data = request.form
        kyc_token = data.get("kyc_token")
        if not kyc_token or kyc_token != user.kyc_token or user.kyc_token_expiry < datetime.utcnow():
            return jsonify({"error": "Invalid or expired KYC token"}), 400

        photo = request.files.get("photo_path")
        if not photo:
            return jsonify({"error": "Photo is required"}), 400

        # Define base directory and user-specific subfolder
        base_dir = "kyc_photos"
        user_dir = os.path.join(base_dir, f"user_{user_id}")

        # Create directories if they don’t exist
        os.makedirs(user_dir, exist_ok=True)

        # Save photo
        photo_path = os.path.join(user_dir, f"{user_id}_{photo.filename}")
        photo.save(photo_path)
        current_app.logger.info(f"Saved photo to: {photo_path}")

        # Process additional form data
        form_data = data.get("form_data")

        # Use KYC model (now imported at the top)
        kyc = KYC(
            user_id=user.id,
            photo_path=photo_path,
            form_data=form_data,
            verified=True  # Adjust if manual review is needed
        )
        db.session.add(kyc)

        # Update user KYC status
        user.kyc_completed = True
        user.kyc_token = None
        user.kyc_token_expiry = None
        db.session.commit()

        current_app.logger.info(f"KYC completed for user_id: {user_id}")
        return jsonify({"message": "KYC submitted successfully"}), 200

    except FileNotFoundError as e:
        db.session.rollback()
        current_app.logger.error(f"KYC FileNotFoundError: {str(e)}")
        return jsonify({"error": "KYC submission failed", "details": "Failed to save photo"}), 500
    except PermissionError as e:
        db.session.rollback()
        current_app.logger.error(f"KYC PermissionError: {str(e)}")
        return jsonify({"error": "KYC submission failed", "details": "Permission denied when saving file"}), 500
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"KYC Exception: {str(e)}")
        return jsonify({"error": "KYC submission failed", "details": str(e)}), 500
    
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "If the email exists, a reset link will be sent."}), 200  # Don't reveal user existence

        reset_token = str(uuid.uuid4())
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)  # 1-hour expiry
        db.session.commit()

        frontend_url = current_app.config["FRONTEND_URL"]
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        send_email(
            email,
            "Reset Your Password",
            f"Click here to reset your password: {reset_link}\nThis link expires in 1 hour."
        )
        return jsonify({"message": "If the email exists, a reset link will been sent."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Request failed", "details": str(e)}), 500

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        token = data.get("token")
        new_password = data.get("password")

        if not token or not new_password:
            return jsonify({"error": "Token and new password are required"}), 400

        user = User.query.filter_by(reset_token=token).first()
        if not user or user.reset_token_expiry < datetime.utcnow():
            return jsonify({"error": "Invalid or expired reset token"}), 400

        user.set_password(new_password)
        user.reset_token = None
        user.reset_token_expiry = None
        db.session.commit()

        return jsonify({"message": "Password reset successfully. Please log in."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Reset failed", "details": str(e)}), 500

@auth_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    try:
        data = request.get_json()
        email = data.get("email")

        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "If the email exists, a verification link will be sent."}), 200  # Don't reveal user existence
        
        if user.verified:
            return jsonify({"error": "Email already verified"}), 400

        # Reuse or generate new token
        if not user.verification_token:
            user.verification_token = str(uuid.uuid4())
            db.session.commit()

        frontend_url = current_app.config["FRONTEND_URL"]
        verify_link = f"{frontend_url}/verify-email?token={user.verification_token}"
        send_email(
            email,
            "Verify Your Email",
            f"Click here to verify your email: {verify_link}"
        )
        return jsonify({"message": "If the email exists, a verification link has been sent."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Request failed", "details": str(e)}), 500