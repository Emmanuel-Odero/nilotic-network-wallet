from app import create_app
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables from .env

app = create_app()

if __name__ == "__main__":
    host = app.config["APP_HOST"]  # Use config from create_app
    port = app.config["APP_PORT"]  # Use config from create_app
    app.run(debug=True, host=host, port=port)