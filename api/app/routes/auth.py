# app/routes/auth.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token
from app import db
from app.models.user import User
from app.models.wallet import Wallet
from app.utils import sync_wallet_with_blockchain
from app.email import send_email
import uuid
import requests
from datetime import datetime, timedelta
from sqlalchemy.exc import OperationalError

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

        verify_link = f"{current_app.config['BASE_URL']}/auth/verify?token={token}"
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
                "error": "KYC not completed",
                "message": "Please complete KYC to proceed.",
                "user_id": user.id,
                "kyc_token": user.kyc_token
            }), 401

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

        # Return user_id and kyc_token instead of sending a KYC email
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

        if not user.verified:
            return jsonify({"error": "Email not verified"}), 400

        if user.kyc_completed:
            return jsonify({"error": "KYC already completed"}), 400

        data = request.get_json()
        kyc_token = data.get("kyc_token")
        photo_path = data.get("photo_path")
        form_data = data.get("form_data")

        if not kyc_token or not photo_path or not form_data:
            return jsonify({"error": "KYC token, photo path, and form data are required"}), 400
        
        # Validate KYC token
        if kyc_token != user.kyc_token or user.kyc_token_expiry < datetime.utcnow():
            return jsonify({"error": "Invalid or expired KYC token"}), 400

        # Process KYC
        user.kyc_completed = True
        user.kyc_token = None  # Clear token after use
        user.kyc_token_expiry = None

        blockchain_url = current_app.config["NILOTIC_API"]
        default_wallet_address = str(uuid.uuid4())
        wallet = Wallet(
            user_id=user.id,
            name="Genesis Wallet",
            address=default_wallet_address,
            balance=0.0,
            stake=0.0
        )
        db.session.add(wallet)
        db.session.commit()

        response = requests.post(
            f"{blockchain_url}/stake",
            json={"amount": 0, "address": default_wallet_address},
            timeout=30
        )
        if not response.ok:
            raise requests.RequestException(f"Blockchain returned {response.status_code}: {response.text}")

        sync_wallet_with_blockchain(default_wallet_address)
        send_email(user.email, "KYC Completed", f"Your KYC is complete. Genesis Wallet created: {default_wallet_address}")
        return jsonify({
            "message": "KYC completed successfully",
            "wallet_address": default_wallet_address,
            "balance": wallet.balance,
            "stake": wallet.stake
        }), 200
    except requests.RequestException as e:
        db.session.rollback()
        return jsonify({"error": "Blockchain initialization failed", "details": str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "KYC submission failed", "details": str(e)}), 500