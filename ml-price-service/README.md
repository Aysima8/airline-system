# ML Price Service

En sade, en akademik ML yapısı ile uçuş fiyat tahmini servisi.

## 🎯 Özellikler

- **FastAPI** - Modern Python web framework
- **Linear Regression** - Basit ve etkili ML modeli
- **CSV-based Training** - flights.csv dosyasından öğrenir
- **Real-time Inference** - HTTP API ile fiyat tahmini

## 📁 Yapı

```
ml-price-service/
├── src/
│   ├── api.py                  # FastAPI endpoint
│   ├── lr/                     # ML package
│   │   ├── train.py           # Model eğitim
│   │   ├── predict.py         # Tahmin (inference)
│   │   ├── preprocess.py      # Feature engineering
│   │   └── model.pkl          # Eğitilmiş model (gitignore)
│   ├── data/
│   │   └── flights.csv        # Training data
│   └── config/
│       └── settings.py        # Ayarlar
├── requirements.txt
└── README.md
```

## 🚀 Kurulum

```bash
# Sanal ortam oluştur
python -m venv venv

# Sanal ortamı aktifleştir (Windows)
venv\Scripts\activate

# Bağımlılıkları yükle
pip install -r requirements.txt
```

## 🎓 Model Eğitimi

```bash
cd src
python -m lr.train
```

## ▶️ Servisi Başlat

```bash
cd src
python api.py
```

Servis http://localhost:5000 adresinde çalışır.

## 📡 API Kullanımı

### Fiyat Tahmini

```bash
POST http://localhost:5000/predict
Content-Type: application/json

{
  "flightId": "123",
  "origin": "IST",
  "destination": "AYT",
  "departureTime": "2024-01-15T10:00:00Z",
  "availableSeats": 100,
  "totalSeats": 180,
  "passengers": 2
}
```

### Health Check

```bash
GET http://localhost:5000/health
```

## 🧮 Features

Model aşağıdaki feature'ları kullanır:

1. **occupancy_rate** - Doluluk oranı (0-1)
2. **remaining_seats** - Kalan koltuk sayısı
3. **passenger_count** - Yolcu sayısı
4. **hour** - Kalkış saati (0-23)
5. **day_of_week** - Haftanın günü (0-6)
6. **route_code** - Rota kodu (hash)

## 📊 Model

- **Algoritma**: Linear Regression
- **Library**: scikit-learn
- **Training Data**: 50 örnek (flights.csv)
- **Features**: 6 adet
- **Target**: price (TL)

## 🔄 İyileştirme Fikirleri

- Daha fazla training data ekle
- Ridge/Lasso regression dene
- Cross-validation ekle
- Feature scaling ekle
- Daha fazla feature engineering

## 📝 Notlar

Bu servis **en sade, en akademik ML yapısı** olarak tasarlanmıştır. Production'da daha gelişmiş model ve feature'lar eklenebilir.
