from app import db
from datetime import datetime

class KYC(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    photo_path = db.Column(db.String(200), nullable=True)
    form_data = db.Column(db.Text, nullable=True)
    verified = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)