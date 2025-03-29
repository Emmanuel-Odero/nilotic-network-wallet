from flask_mail import Message
from app import mail

def send_email(to, subject, body):
    msg = Message(subject, recipients=[to], body=body)
    try:
        mail.send(msg)
        print(f"Email sent to {to} via SMTP")
    except Exception as e:
        print(f"Failed to send email to {to}: {e}")
        raise  # Re-raise the exception to propagate the error