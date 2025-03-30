from app import db
from datetime import datetime

class KYC(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    photo_path = db.Column(db.String(255), nullable=False)
    form_data = db.Column(db.Text, nullable=True)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("kyc", uselist=False))

    def __repr__(self):
        return f"<KYC {self.id} for User {self.user_id}>"