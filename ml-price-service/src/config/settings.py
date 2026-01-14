"""
Configuration settings
"""
import os
from dotenv import load_dotenv

load_dotenv()

# API Settings
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "5000"))

# Model Settings
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../lr/model.pkl")
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/Clean_Dataset.csv")

# ML Settings
RANDOM_STATE = 42
TEST_SIZE = 0.2

# Price Settings
MIN_PRICE = 1000.0  # Minimum fiyat
MAX_PRICE = 100000.0  # Maximum fiyat

# Feature Names - Yeni Dataset için
FEATURE_NAMES = [
    'airline_code',
    'stops',
    'duration',
    'days_left',
    'class_code',
    'departure_time_code',
    'arrival_time_code',
    'route_code'
]

# Categorical mappings
DEPARTURE_TIME_MAP = {
    'Early_Morning': 0, 'Morning': 1, 'Afternoon': 2, 'Evening': 3, 'Night': 4
}

ARRIVAL_TIME_MAP = {
    'Early_Morning': 0, 'Morning': 1, 'Afternoon': 2, 'Evening': 3, 'Night': 4
}

STOPS_MAP = {
    'zero': 0, 'one': 1, 'two_or_more': 2
}

CLASS_MAP = {
    'Economy': 0, 'Business': 1
}

AIRLINE_MAP = {
    'SpiceJet': 0, 'AirAsia': 1, 'Vistara': 2, 'GO_FIRST': 3,
    'Indigo': 4, 'Air_India': 5
}

# Environment
ENV = os.getenv("ENV", "development")
DEBUG = ENV == "development"

print(f"⚙️ Settings loaded - Environment: {ENV}")
