import os
from dotenv import load_dotenv

load_dotenv()


class Config:

    def __init__(self):
        self.APP_NAME = "Mininet endpoints"
        self.DEBUG = os.getenv("DEBUG", "True") == "True"
