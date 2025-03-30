# app/routes/wallet.py
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User
from app.models.wallet import Wallet
from app.utils import sync_wallet_with_blockchain
import uuid
import requests

wallet_bp = Blueprint("wallet", __name__)

@wallet_bp.route("/create", methods=["POST"])
def create_wallet():
    data = request.get_json()
    email = data.get("email")
    wallet_name = data.get("name", "Genesis Wallet")

    user = User.query.filter_by(email=email).first()
    if not user or not user.verified:
        return jsonify({"error": "User not found or unverified"}), 400

    wallet = Wallet(
        user_id=user.id,
        name=wallet_name,
        address=str(uuid.uuid4())
    )
    db.session.add(wallet)
    db.session.commit()

    blockchain_url = current_app.config["NILOTIC_API"]
    try:
        response = requests.post(
            f"{blockchain_url}/stake",
            json={"amount": 0, "address": wallet.address},
            timeout=30
        )
        response.raise_for_status()
        sync_wallet_with_blockchain(wallet.address)
    except requests.RequestException as e:
        db.session.rollback()
        return jsonify({"error": "Failed to register wallet on blockchain", "details": str(e)}), 500

    return jsonify({"message": "Wallet created", "address": wallet.address, "balance": wallet.balance, "stake": wallet.stake}), 201

@wallet_bp.route("/balance/<address>", methods=["GET"])
def get_balance(address):
    wallet = Wallet.query.filter_by(address=address).first()
    if not wallet:
        return jsonify({"error": "Wallet not found"}), 404

    sync_wallet_with_blockchain(address)
    return jsonify({"address": wallet.address, "balance": wallet.balance, "stake": wallet.stake}), 200