# app/routes/transaction.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils import sync_wallet_with_blockchain
from app import db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.escrow import Escrow
from app.email import send_email
import requests
import pyotp

transaction_bp = Blueprint("transaction", __name__)

@transaction_bp.route("/send", methods=["POST"])
@jwt_required()
def send_transaction():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    sender_email = data.get("sender_email")
    recipient_email = data.get("recipient_email")
    amount = float(data.get("amount", 0))

    if amount <= 0:
        return jsonify({"error": "Amount must be positive"}), 400

    sender = User.query.filter_by(email=sender_email).first()
    recipient = User.query.filter_by(email=recipient_email).first()

    if not sender or sender.id != current_user_id:
        return jsonify({"error": "Unauthorized: Invalid sender email or not your account"}), 403

    if not sender.verified or not sender.kyc_completed:
        return jsonify({"error": "Sender not verified or KYC incomplete"}), 400

    sender_wallet = Wallet.query.filter_by(user_id=sender.id, name="Genesis Wallet").first()
    if not sender_wallet or sender_wallet.balance < amount:
        return jsonify({"error": "Insufficient balance or wallet not found"}), 400

    blockchain_url = current_app.config["NILOTIC_API"]
    if recipient and recipient.verified and recipient.kyc_completed:  # Native user
        recipient_wallet = Wallet.query.filter_by(user_id=recipient.id, name="Genesis Wallet").first()
        if not recipient_wallet:
            return jsonify({"error": "Recipient wallet not found"}), 400

        tx = {"sender": sender_wallet.address, "receiver": recipient_wallet.address, "amount": amount}
        try:
            response = requests.post(f"{blockchain_url}/transaction", json=tx, timeout=30)
            response.raise_for_status()
            tx_id = response.json().get("tx_id", "simulated-tx-id")

            # Update local balances
            sender_wallet.balance -= amount
            recipient_wallet.balance += amount
            db.session.commit()

            # Sync both wallets with blockchain
            sync_wallet_with_blockchain(sender_wallet.address)
            sync_wallet_with_blockchain(recipient_wallet.address)

            send_email(sender_email, "Transaction Sent", f"You sent {amount} SLW to {recipient_email}. Transaction ID: {tx_id}")
            send_email(recipient_email, "Transaction Received", f"You received {amount} SLW from {sender_email}. Transaction ID: {tx_id}")
            return jsonify({"message": "Transaction completed", "tx_id": tx_id}), 200
        except requests.RequestException as e:
            db.session.rollback()
            return jsonify({"error": "Blockchain transaction failed", "details": str(e)}), 500
    else:  # Alien user (escrow)
        escrow = Escrow(
            sender_id=sender.id,
            recipient_email=recipient_email,
            amount=amount,
            otp=pyotp.TOTP(pyotp.random_base32()).now()
        )
        sender_wallet.balance -= amount
        db.session.add(escrow)
        db.session.commit()

        # Sync sender wallet after escrow creation
        sync_wallet_with_blockchain(sender_wallet.address)

        claim_link = f"{current_app.config['BASE_URL']}/escrow/claim/{escrow.id}?otp={escrow.otp}"
        send_email(recipient_email, "Claim Your SLW", f"Click here to claim {amount} SLW: {claim_link}")
        return jsonify({"message": "Escrow created", "escrow_id": escrow.id}), 201