"""
Pydantic schemas for ML Service API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class PredictionRequest(BaseModel):
    vehicle_category: str = Field(..., description="Roda2 or Roda4")
    vehicle_type: str = Field(..., description="Bebek, Matic, Sport, Sport Besar, City Car, MPV, SUV")
    engine_cc: float = Field(..., ge=50, le=2500, description="Engine capacity in cc")
    cylinders: int = Field(..., ge=1, le=6, description="Number of cylinders")
    horsepower: float = Field(..., ge=5, le=200, description="Horsepower")
    weight_kg: float = Field(..., ge=50, le=2000, description="Vehicle weight in kg")
    transmission: str = Field(..., description="Manual, Automatic, CVT, DCT")
    fuel_type: str = Field(..., description="Bensin, Diesel, Hybrid")
    cooling_system: str = Field(..., description="Air-cooled, Liquid-cooled")
    daily_distance_km: float = Field(..., ge=1, le=500, description="Daily distance in km")
    year: int = Field(..., ge=2000, le=2030, description="Vehicle year")
    
    # Optional fields for cost analysis (handled by Node.js backend)
    daily_income: Optional[float] = Field(None, ge=0, description="Daily gross income in Rp")
    fuel_price_per_liter: Optional[float] = Field(None, ge=0, description="Fuel price per liter in Rp")


class ShapFeature(BaseModel):
    feature: str
    label: str
    value: float
    shap_value: float
    effect: str


class PredictionResponse(BaseModel):
    predicted_kmpl: float
    label: str
    threshold: float
    shap_values: List[ShapFeature]
    base_value: float


class PopulationAverage(BaseModel):
    overall: float
    by_type: dict
    selected_type_avg: Optional[float] = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
