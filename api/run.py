from app import create_app
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env

app = create_app()

if __name__ == "__main__":
    host = os.getenv("APP_HOST", "0.0.0.0")  # Default to 0.0.0.0 if not set
    port = int(os.getenv("APP_PORT", 5000))  # Default to 5000 if not set, convert to int
    app.run(debug=True, host=host, port=port)