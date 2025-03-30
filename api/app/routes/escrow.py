# app/routes/escrow.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from app import db
from app.models.escrow import Escrow  # Import Escrow from models
from app.models.user import User
from app.models.wallet import Wallet
from app.email import send_email
from datetime import datetime
import requests
import uuid

escrow_bp = Blueprint("escrow", __name__)

@escrow_bp.route("/claim/<int:escrow_id>", methods=["POST"])
def claim_escrow(escrow_id):
    data = request.get_json()
    otp = data.get("otp")
    email = data.get("email")

    escrow = Escrow.query.get(escrow_id)
    if not escrow or escrow.status != "Pending":
        return jsonify({"error": "Invalid or expired escrow"}), 400

    if escrow.otp != otp or escrow.recipient_email != email:
        return jsonify({"error": "Invalid OTP or email"}), 400

    if escrow.expires_at < datetime.utcnow():
        escrow.status = "Expired"
        sender_wallet = Wallet.query.filter_by(user_id=escrow.sender_id, name="Genesis Wallet").first()
        sender_wallet.balance += escrow.amount
        db.session.commit()
        return jsonify({"error": "Escrow expired"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(email=email, verified=True)
        user.set_password(str(uuid.uuid4()))  # Temporary password for new user
        db.session.add(user)
        db.session.commit()
        wallet = Wallet(user_id=user.id, name="Genesis Wallet", address=str(uuid.uuid4()))
        db.session.add(wallet)
        db.session.commit()
    else:
        wallet = Wallet.query.filter_by(user_id=user.id, name="Genesis Wallet").first()

    wallet.balance += escrow.amount
    escrow.status = "Claimed"
    sender_wallet = Wallet.query.filter_by(user_id=escrow.sender_id, name="Genesis Wallet").first()
    tx = {"sender": sender_wallet.address, "recipient": wallet.address, "amount": escrow.amount}
    try:
        requests.post(f"{current_app.config['NILOTIC_API']}/transaction", json=tx).raise_for_status()
    except requests.RequestException as e:
        db.session.rollback()
        return jsonify({"error": "Blockchain transaction failed", "details": str(e)}), 500

    db.session.commit()
    return jsonify({"message": "Escrow claimed", "wallet_address": wallet.address}), 200

@escrow_bp.route("/check-expired", methods=["GET"])
@jwt_required()
def check_expired_escrows():
    escrows = Escrow.query.filter_by(status="Pending").all()
    for escrow in escrows:
        if escrow.expires_at < datetime.utcnow():
            escrow.status = "Expired"
            sender_wallet = Wallet.query.filter_by(user_id=escrow.sender_id, name="Genesis Wallet").first()
            sender_wallet.balance += escrow.amount
            send_email(sender_wallet.user.email, "Escrow Expired", f"Your {escrow.amount} SLW has been returned.")
    db.session.commit()
    return jsonify({"message": "Expired escrows processed"}), 200