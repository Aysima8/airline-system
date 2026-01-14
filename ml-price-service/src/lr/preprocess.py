"""
Preprocessing and Feature Engineering
Yeni Clean_Dataset için
"""
import pandas as pd
import numpy as np
from config.settings import (
    DEPARTURE_TIME_MAP, ARRIVAL_TIME_MAP, STOPS_MAP,
    CLASS_MAP, AIRLINE_MAP
)

def preprocess_data(df):
    """
    Dataset preprocessing

    Sütunlar:
    - airline
    - flight
    - source_city
    - departure_time
    - stops
    - arrival_time
    - destination_city
    - class
    - duration
    - days_left
    - price (target)
    """
    df = df.copy()

    # 1. Airline encode
    df['airline_code'] = df['airline'].map(AIRLINE_MAP)
    df['airline_code'] = df['airline_code'].fillna(0)

    # 2. Stops encode
    df['stops'] = df['stops'].map(STOPS_MAP)
    df['stops'] = df['stops'].fillna(0)

    # 3. Class encode
    df['class_code'] = df['class'].map(CLASS_MAP)
    df['class_code'] = df['class_code'].fillna(0)

    # 4. Departure time encode
    df['departure_time_code'] = df['departure_time'].map(DEPARTURE_TIME_MAP)
    df['departure_time_code'] = df['departure_time_code'].fillna(0)

    # 5. Arrival time encode
    df['arrival_time_code'] = df['arrival_time'].map(ARRIVAL_TIME_MAP)
    df['arrival_time_code'] = df['arrival_time_code'].fillna(0)

    # 6. Route code (source -> destination)
    df['route'] = df['source_city'] + '_' + df['destination_city']
    route_codes = {route: idx for idx, route in enumerate(df['route'].unique())}
    df['route_code'] = df['route'].map(route_codes)

    # 7. Duration zaten float
    # days_left zaten int

    # Feature'ları seç
    features = [
        'airline_code',
        'stops',
        'duration',
        'days_left',
        'class_code',
        'departure_time_code',
        'arrival_time_code',
        'route_code'
    ]

    X = df[features]
    y = df['price'] if 'price' in df.columns else None

    return X, y, route_codes


def extract_features(airline, source_city, destination_city,
                     departure_time, stops, arrival_time,
                     flight_class, duration, days_left, route_codes=None):
    """
    Tek bir uçuş için feature çıkar
    """
    features = {
        'airline_code': AIRLINE_MAP.get(airline, 0),
        'stops': STOPS_MAP.get(stops, 0),
        'duration': float(duration),
        'days_left': int(days_left),
        'class_code': CLASS_MAP.get(flight_class, 0),
        'departure_time_code': DEPARTURE_TIME_MAP.get(departure_time, 0),
        'arrival_time_code': ARRIVAL_TIME_MAP.get(arrival_time, 0),
        'route_code': 0  # Default
    }

    # Route code
    if route_codes:
        route = f"{source_city}_{destination_city}"
        features['route_code'] = route_codes.get(route, 0)

    return features


def get_feature_names():
    """Feature isimlerini döndürür"""
    return [
        'airline_code',
        'stops',
        'duration',
        'days_left',
        'class_code',
        'departure_time_code',
        'arrival_time_code',
        'route_code'
    ]
