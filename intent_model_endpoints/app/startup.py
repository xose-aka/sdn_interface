import os

from app.config import Config


def setup_app():
    config = Config()

    print(f"Starting {config.APP_NAME}...")

    print("Setting GEMINI API key...")
    if config.GEMINI_API_KEY:
        os.environ['GOOGLE_API_KEY'] = config.GEMINI_API_KEY
    else:
        print("No GEMINI API key!!!")
        return False

    if config.DEBUG:
        print("Running in DEBUG mode.")

    return True
