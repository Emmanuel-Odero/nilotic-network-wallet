from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    verified = db.Column(db.Boolean, default=False)
    kyc_completed = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(64), unique=True, nullable=True)
    kyc_token = db.Column(db.String(64), unique=True, nullable=True)
    kyc_token_expiry = db.Column(db.DateTime, nullable=True)
    reset_token = db.Column(db.String(36))
    reset_token_expiry = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    wallets = db.relationship("Wallet", backref="user", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)