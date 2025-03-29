from app import db
from app.models.user import User

class Wallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(36), unique=True, nullable=False)  # UUID length
    balance = db.Column(db.Float, default=0.0)  # Available balance
    stake = db.Column(db.Float, default=0.0)    # Staked amount

    __table_args__ = (db.UniqueConstraint("user_id", "name", name="unique_user_wallet_name"),)