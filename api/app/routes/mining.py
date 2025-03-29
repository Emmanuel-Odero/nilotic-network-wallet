from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.wallet import Wallet
from app.utils import sync_wallet_with_blockchain
import requests

mining_bp = Blueprint("mining", __name__)

@mining_bp.route("/mine", methods=["POST"])
@jwt_required()
def mine():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    wallet_address = data.get("wallet_address")
    stake_amount = float(data.get("stake", 0))

    user = User.query.get(current_user_id)
    if not user or not user.verified or not user.kyc_completed:
        return jsonify({"error": "User not found, unverified, or KYC incomplete"}), 400

    wallet = Wallet.query.filter_by(address=wallet_address, user_id=current_user_id).first()
    if not wallet:
        return jsonify({"error": "Wallet not found or not owned by you"}), 400

    if wallet.balance < stake_amount:
        return jsonify({"error": "Insufficient balance for stake"}), 400

    blockchain_url = current_app.config["NILOTIC_API"]
    payload = {"stake": stake_amount, "address": wallet_address}

    simulate_mining = current_app.config.get("SIMULATE_MINING", False)
    try:
        response = requests.post(f"{blockchain_url}/mine", json=payload, timeout=30)
        if simulate_mining and not response.ok:
            reward = 5.0
            block_hash = "simulated-block-hash"
            wallet.stake = wallet.stake or 0.0
            wallet.stake += stake_amount
            wallet.balance = wallet.balance - stake_amount + reward
        else:
            response.raise_for_status()
            mining_result = response.json()
            reward = float(mining_result.get("reward", 5.0))
            block_hash_raw = mining_result.get("blockHash", "unknown")
            block_hash = block_hash_raw.hex() if isinstance(block_hash_raw, bytes) else block_hash_raw

            wallet.stake = wallet.stake or 0.0
            wallet.stake += stake_amount
            wallet.balance = wallet.balance - stake_amount + reward

        if reward <= 0:
            return jsonify({"error": "No reward received from mining"}), 400

        db.session.commit()

        # Sync with blockchain after operation
        if not simulate_mining:
            sync_wallet_with_blockchain(wallet_address)

        return jsonify({
            "message": f"Successfully mined {reward} SLW",
            "wallet_address": wallet.address,
            "new_balance": wallet.balance,
            "stake": wallet.stake,
            "block_hash": block_hash
        }), 200

    except requests.RequestException as e:
        if simulate_mining:
            reward = 5.0
            wallet.stake = wallet.stake or 0.0
            wallet.stake += stake_amount
            wallet.balance = wallet.balance - stake_amount + reward
            db.session.commit()
            return jsonify({
                "message": f"Simulated mining of {reward} SLW",
                "wallet_address": wallet.address,
                "new_balance": wallet.balance,
                "stake": wallet.stake,
                "block_hash": "simulated-block-hash"
            }), 200
        return jsonify({"error": "Mining failed", "details": str(e)}), 503