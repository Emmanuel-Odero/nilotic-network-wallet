import requests
from flask import current_app
from app import db
from app.models.wallet import Wallet

def sync_wallet_with_blockchain(wallet_address):
    blockchain_url = current_app.config["NILOTIC_API"]
    try:
        response = requests.get(f"{blockchain_url}/balance?address={wallet_address}", timeout=30)
        response.raise_for_status()
        balance_data = response.json()
        blockchain_balance = float(balance_data.get("balance", 0.0))
        blockchain_stake = float(balance_data.get("stake", 0.0))

        wallet = Wallet.query.filter_by(address=wallet_address).first()
        if wallet:
            if wallet.balance != blockchain_balance or wallet.stake != blockchain_stake:
                print(f"Syncing {wallet_address}: Local(balance={wallet.balance}, stake={wallet.stake}) -> Blockchain(balance={blockchain_balance}, stake={blockchain_stake})")
                wallet.balance = blockchain_balance
                wallet.stake = blockchain_stake
                db.session.commit()
            return True
        return False
    except requests.RequestException as e:
        print(f"Failed to sync {wallet_address} with blockchain: {str(e)}")
        return False