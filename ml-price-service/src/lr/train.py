"""
Modeli eğitir - En sade akademik ML yapısı
Clean_Dataset için güncellendi
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import os
import sys

# Parent directory'yi path'e ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lr.preprocess import preprocess_data
from config.settings import DATA_PATH, MODEL_PATH, RANDOM_STATE, TEST_SIZE

def train_model():
    """
    CSV'den veri okur, model eğitir ve kaydeder
    """
    print("📚 Model eğitimi başlıyor...")

    # 1. Veri yükleme
    df = pd.read_csv(DATA_PATH)
    print(f"✅ {len(df)} satır veri yüklendi")
    print(f"📋 Sütunlar: {list(df.columns)}")

    # 2. Feature engineering (preprocessing)
    X, y, route_codes = preprocess_data(df)
    print(f"✅ Feature extraction tamamlandı")
    print(f"   Features: {list(X.columns)}")
    print(f"   Feature shape: {X.shape}")

    # 3. Train/Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    print(f"✅ Train: {len(X_train)}, Test: {len(X_test)}")

    # 4. Model eğitimi - Linear Regression (en basit)
    model = LinearRegression()
    model.fit(X_train, y_train)
    print("✅ Model eğitildi")

    # 5. Model değerlendirme
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"\n📊 Model Metrikleri:")
    print(f"   RMSE: {rmse:.2f}")
    print(f"   MAE: {mae:.2f}")
    print(f"   R²: {r2:.4f}")

    # 6. Modeli ve route_codes'u kaydet
    model_dir = os.path.dirname(MODEL_PATH)
    os.makedirs(model_dir, exist_ok=True)

    # Model kaydet
    joblib.dump(model, MODEL_PATH)
    print(f"\n💾 Model kaydedildi: {MODEL_PATH}")

    # Route codes kaydet
    route_codes_path = os.path.join(model_dir, 'route_codes.pkl')
    joblib.dump(route_codes, route_codes_path)
    print(f"💾 Route codes kaydedildi: {route_codes_path}")

    # Feature importance (coefficients)
    feature_names = list(X.columns)
    coefficients = model.coef_
    print(f"\n🎯 Feature Importance (Coefficients):")
    for name, coef in zip(feature_names, coefficients):
        print(f"   {name}: {coef:.2f}")

    return {
        "rmse": float(rmse),
        "mae": float(mae),
        "r2": float(r2),
        "samples": len(df),
        "features": feature_names
    }

if __name__ == "__main__":
    train_model()
