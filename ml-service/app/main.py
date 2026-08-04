"""
FastAPI ML Service — Internal Microservice
==========================================
Endpoints:
  POST /internal/predict  — Predict fuel efficiency + SHAP values
  GET  /internal/health   — Health check
  GET  /internal/population-avg — Population average fuel efficiency
  GET  /internal/shap-summary — Global SHAP summary plot (base64)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .schemas import PredictionRequest, PredictionResponse, HealthResponse, PopulationAverage
from .model_service import model_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model on startup."""
    model_service.initialize()
    yield


app = FastAPI(
    title="Vehicle Fuel Efficiency ML Service",
    description="Internal microservice for XGBoost prediction + SHAP explainability",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — only allow backend Node.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/internal/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Run prediction + SHAP on vehicle input data."""
    try:
        raw_input = {
            "vehicle_category": request.vehicle_category,
            "vehicle_type": request.vehicle_type,
            "engine_cc": request.engine_cc,
            "cylinders": request.cylinders,
            "horsepower": request.horsepower,
            "weight_kg": request.weight_kg,
            "transmission": request.transmission,
            "fuel_type": request.fuel_type,
            "cooling_system": request.cooling_system,
            "daily_distance_km": request.daily_distance_km,
            "year": request.year,
        }
        
        result = model_service.predict(raw_input)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/internal/health", response_model=HealthResponse)
async def health():
    """Check if model is loaded and ready."""
    return {
        "status": "ok" if model_service.is_loaded else "not_ready",
        "model_loaded": model_service.is_loaded,
    }


@app.get("/internal/population-avg", response_model=PopulationAverage)
async def population_average(vehicle_type: str = None):
    """Get population average fuel efficiency by vehicle type."""
    try:
        return model_service.get_population_average(vehicle_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/internal/shap-force-plot")
async def shap_force_plot(request: PredictionRequest):
    """Generate SHAP waterfall/force plot for a specific prediction."""
    try:
        raw_input = request.model_dump(exclude={'daily_income', 'fuel_price_per_liter'})
        image_b64 = model_service.generate_shap_force_plot(raw_input)
        return {"image": image_b64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/internal/shap-summary")
async def shap_summary():
    """Generate global SHAP summary plot."""
    try:
        image_b64 = model_service.generate_shap_summary_plot()
        return {"image": image_b64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
