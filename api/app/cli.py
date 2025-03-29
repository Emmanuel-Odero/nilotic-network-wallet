from flask import Blueprint
from app import db
from app.models.wallet import Wallet
from app.utils import sync_wallet_with_blockchain

cli_bp = Blueprint("cli", __name__)

@cli_bp.cli.command("sync-blockchain")
def sync_blockchain():
    """Sync all wallet balances and stakes with the blockchain."""
    wallets = Wallet.query.all()
    if not wallets:
        print("No wallets found to sync.")
        return

    success_count = 0
    for wallet in wallets:
        if sync_wallet_with_blockchain(wallet.address):
            success_count += 1
        else:
            print(f"Failed to sync wallet {wallet.address}")

    print(f"Successfully synced {success_count} out of {len(wallets)} wallets.")