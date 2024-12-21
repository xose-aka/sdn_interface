import os
from dotenv import load_dotenv

load_dotenv()


class Config:

    def __init__(self):
        self.APP_NAME = "Intent model"
        self.DEBUG = os.getenv("DEBUG", "True") == "True"
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        os.environ['GOOGLE_API_KEY'] = gemini_api_key
