"""
Inference - Fiyat tahmini yapar
Clean_Dataset için güncellendi
"""
import joblib
import pandas as pd
import os
import sys

# Parent directory'yi path'e ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lr.preprocess import extract_features
from config.settings import MODEL_PATH

# Model ve route_codes yükleme (lazy loading)
_model = None
_route_codes = None

def load_model():
    """Model'i yükle"""
    global _model, _route_codes
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
            print("✅ Model yüklendi")

            # Route codes yükle
            route_codes_path = os.path.join(os.path.dirname(MODEL_PATH), 'route_codes.pkl')
            if os.path.exists(route_codes_path):
                _route_codes = joblib.load(route_codes_path)
                print("✅ Route codes yüklendi")
        else:
            print("⚠️ Model bulunamadı, fallback kullanılacak")
    return _model, _route_codes

def predict_price(airline, source_city, destination_city,
                  departure_time, stops, arrival_time,
                  flight_class, duration, days_left):
    """
    Fiyat tahmini yapar

    Args:
        airline: Havayolu (SpiceJet, AirAsia, vb.)
        source_city: Kalkış şehri
        destination_city: Varış şehri
        departure_time: Kalkış zamanı (Early_Morning, Morning, vb.)
        stops: Durak sayısı (zero, one, two_or_more)
        arrival_time: Varış zamanı (Early_Morning, Morning, vb.)
        flight_class: Sınıf (Economy, Business)
        duration: Süre (saat cinsinden)
        days_left: Kalkışa kalan gün

    Returns:
        float: Tahmin edilen fiyat
    """
    model, route_codes = load_model()

    if model is None:
        # Model yoksa basit fallback
        return fallback_price_calculation(duration, days_left, stops, flight_class)

    # Feature'ları hazırla
    features_dict = extract_features(
        airline=airline,
        source_city=source_city,
        destination_city=destination_city,
        departure_time=departure_time,
        stops=stops,
        arrival_time=arrival_time,
        flight_class=flight_class,
        duration=duration,
        days_left=days_left,
        route_codes=route_codes
    )

    # DataFrame'e çevir (model bunu bekliyor)
    features_df = pd.DataFrame([features_dict])

    # Tahmin yap
    price = model.predict(features_df)[0]

    # Makul sınırlar içinde tut
    price = max(price, 1000)   # Minimum 1000
    price = min(price, 100000)  # Maximum 100000

    return round(price, 2)

def fallback_price_calculation(duration, days_left, stops, flight_class):
    """
    Model yoksa kullanılacak basit fiyat hesaplama
    """
    base_price = 3000

    # Duration etkisi
    duration_factor = 1 + (duration * 0.1)

    # Days left etkisi (erken rezervasyon indirimi)
    if days_left > 30:
        days_factor = 0.8
    elif days_left > 7:
        days_factor = 1.0
    else:
        days_factor = 1.5  # Son dakika pahalı

    # Stops etkisi
    stops_map = {'zero': 1.0, 'one': 0.85, 'two_or_more': 0.7}
    stops_factor = stops_map.get(stops, 1.0)

    # Class etkisi
    class_factor = 2.5 if flight_class == 'Business' else 1.0

    total_price = base_price * duration_factor * days_factor * stops_factor * class_factor

    return round(total_price, 2)
