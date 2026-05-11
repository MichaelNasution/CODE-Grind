"""
Global Configuration for NBA Analytics & Prediction Engine
"""
import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
API_KEY = os.getenv("658225bf-983a-4ab6-ad78-a52a787d8afe")
BASE_URL = "https://api.balldontlie.io/v1"

# Directory Structure
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Other Settings
DEBUG = os.getenv("DEBUG", "False") == "True"
