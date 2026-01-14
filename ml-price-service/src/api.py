from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from lr.predict import predict_price
from lr.train import train_model
import os

# FastAPI app
app = FastAPI(
    title="ML Price Service",
    description="Uçuş fiyat tahmini için ML servisi - Clean_Dataset",
    version="2.0.0"
)

# Request model - YENİ DATASET İÇİN
class PredictRequest(BaseModel):
    airline: str  # SpiceJet, AirAsia, Vistara, vb.
    source_city: str  # Delhi, Mumbai, vb.
    destination_city: str  # Delhi, Mumbai, vb.
    departure_time: str  # Early_Morning, Morning, Afternoon, Evening, Night
    stops: str  # zero, one, two_or_more
    arrival_time: str  # Early_Morning, Morning, Afternoon, Evening, Night
    flight_class: str  # Economy, Business
    duration: float  # Uçuş süresi (saat)
    days_left: int  # Kalkışa kalan gün sayısı

    class Config:
        schema_extra = {
            "example": {
                "airline": "SpiceJet",
                "source_city": "Delhi",
                "destination_city": "Mumbai",
                "departure_time": "Morning",
                "stops": "zero",
                "arrival_time": "Afternoon",
                "flight_class": "Economy",
                "duration": 2.17,
                "days_left": 7
            }
        }

# Response model
class PredictResponse(BaseModel):
    price: float
    confidence: Optional[float] = None
    model: str = "linear_regression"

# Health check endpoint
@app.get("/health")
async def health_check():
    model_exists = os.path.exists("src/lr/model.pkl")
    return {
        "status": "healthy",
        "service": "ml-price-service",
        "model_loaded": model_exists,
        "dataset": "Clean_Dataset.csv"
    }

# Fiyat tahmini endpoint
@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    """
    Uçuş fiyat tahmini yapar

    Yeni Clean_Dataset ile:
    - Linear Regression
    - 8 feature (airline, stops, duration, days_left, class, departure_time, arrival_time, route)
    - Delhi-Mumbai uçuşları
    """
    try:
        # Fiyat tahmini yap
        price = predict_price(
            airline=request.airline,
            source_city=request.source_city,
            destination_city=request.destination_city,
            departure_time=request.departure_time,
            stops=request.stops,
            arrival_time=request.arrival_time,
            flight_class=request.flight_class,
            duration=request.duration,
            days_left=request.days_left
        )

        return PredictResponse(
            price=round(price, 2),
            confidence=0.85,
            model="linear_regression"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Model eğitme endpoint (admin için)
@app.post("/train")
async def train():
    """
    Modeli yeniden eğitir
    """
    try:
        metrics = train_model()
        return {
            "success": True,
            "message": "Model başarıyla eğitildi",
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "ML Price Service",
        "description": "En sade, en akademik ML yapısı - Clean_Dataset",
        "version": "2.0.0",
        "dataset": "Clean_Dataset.csv (Delhi-Mumbai flights)",
        "endpoints": {
            "predict": "POST /predict",
            "train": "POST /train",
            "health": "GET /health",
            "docs": "GET /docs"
        }
    }

if __name__ == "__main__":
    # Sunucuyu başlat
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=5000,
        reload=True
    )
