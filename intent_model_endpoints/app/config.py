import os
from dotenv import load_dotenv

load_dotenv()


class Config:

    def __init__(self):
        self.APP_NAME = "Intent model"
        self.DEBUG = os.getenv("DEBUG", "True") == "True"
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
