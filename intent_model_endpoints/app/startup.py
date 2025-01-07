from app.config import Config


def setup_app():

    config = Config()

    print(f"Starting {config.APP_NAME}...")
    if config.DEBUG:
        print("Running in DEBUG mode.")
    # print(f"Connecting to the database at {Config.DATABASE_URL}...")

