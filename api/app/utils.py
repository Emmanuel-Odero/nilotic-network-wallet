from app import db
from app.models.wallet import Wallet
import requests
from flask import current_app

def sync_wallet_with_blockchain(address):
    wallet = Wallet.query.filter_by(address=address).first()
    if not wallet:
        return

    blockchain_url = current_app.config["NILOTIC_API"]
    try:
        response = requests.get(f"{blockchain_url}/balance?address={address}", timeout=30)
        response.raise_for_status()
        balance_data = response.json()
        wallet.balance = float(balance_data.get("balance", 0.0))
        wallet.stake = float(balance_data.get("stake", 0.0))
        db.session.commit()
    except requests.RequestException as e:
        print(f"Failed to sync wallet {address} with blockchain: {e}")