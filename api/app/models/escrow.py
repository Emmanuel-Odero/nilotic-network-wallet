from app import db
from datetime import datetime, timedelta

class Escrow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    recipient_email = db.Column(db.String(120), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    otp = db.Column(db.String(6), nullable=False)
    status = db.Column(db.String(20), default="Pending")  # Pending, Claimed, Expired
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=72))