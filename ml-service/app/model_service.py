"""
ML Model Service
================
Singleton service that loads the trained XGBoost model and SHAP explainer,
provides prediction and SHAP value computation.
"""

import os
import numpy as np
import pandas as pd
import joblib
import shap
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server
import matplotlib.pyplot as plt
import io
import base64

from .preprocessing import transform_input

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'dataset', 'vehicle_fuel_dataset.csv')

# Per-type thresholds for Boros/Hemat classification
THRESHOLDS = {
    "Bebek": 48,
    "Matic": 42,
    "Sport": 33,
    "Sport Besar": 22,
    "City Car": 15,
    "MPV": 12,
    "SUV": 11,
}

# Human-readable feature name mapping (Indonesian)
FEATURE_LABELS = {
    "engine_cc": "Kapasitas Mesin (cc)",
    "cylinders": "Jumlah Silinder",
    "horsepower": "Tenaga (HP)",
    "weight_kg": "Berat (kg)",
    "daily_distance_km": "Jarak Tempuh Harian (km)",
    "year": "Tahun Kendaraan",
    "vehicle_category_Roda2": "Kategori: Roda 2",
    "vehicle_category_Roda4": "Kategori: Roda 4",
    "vehicle_type_Bebek": "Jenis: Bebek",
    "vehicle_type_City Car": "Jenis: City Car",
    "vehicle_type_MPV": "Jenis: MPV",
    "vehicle_type_Matic": "Jenis: Matic",
    "vehicle_type_SUV": "Jenis: SUV",
    "vehicle_type_Sport": "Jenis: Sport",
    "vehicle_type_Sport Besar": "Jenis: Sport Besar",
    "transmission_Automatic": "Transmisi: Automatic",
    "transmission_CVT": "Transmisi: CVT",
    "transmission_DCT": "Transmisi: DCT",
    "transmission_Manual": "Transmisi: Manual",
    "fuel_type_Bensin": "BBM: Bensin",
    "fuel_type_Diesel": "BBM: Diesel",
    "fuel_type_Hybrid": "BBM: Hybrid",
    "cooling_system_Air-cooled": "Pendingin: Udara",
    "cooling_system_Liquid-cooled": "Pendingin: Cairan",
}


class ModelService:
    """Singleton service for ML model operations."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def initialize(self):
        """Load model, encoder, and SHAP explainer."""
        if self._initialized:
            return
        
        model_path = os.path.join(MODELS_DIR, 'xgb_model.pkl')
        encoder_path = os.path.join(MODELS_DIR, 'encoders.pkl')
        
        self.model = joblib.load(model_path)
        self.encoder_info = joblib.load(encoder_path)
        self.explainer = shap.TreeExplainer(self.model)
        
        # Load dataset for population averages
        if os.path.exists(DATASET_PATH):
            self.dataset = pd.read_csv(DATASET_PATH)
        else:
            self.dataset = None
        
        self._initialized = True
        print("[OK] Model, encoders, and SHAP explainer loaded successfully.")
    
    @property
    def is_loaded(self) -> bool:
        return self._initialized
    
    def predict(self, raw_input: dict) -> dict:
        """
        Run prediction + SHAP on raw input.
        
        Returns dict with:
        - predicted_kmpl: float
        - label: str ("Hemat" / "Boros")
        - threshold: float
        - shap_values: list of {feature, value, shap_value, effect, label}
        - base_value: float
        """
        X_processed, feature_names = transform_input(raw_input, self.encoder_info)
        
        # Prediction
        predicted_kmpl = float(self.model.predict(X_processed)[0])
        
        # Determine label based on vehicle type threshold
        vehicle_type = raw_input.get('vehicle_type', '')
        threshold = THRESHOLDS.get(vehicle_type, 15)
        label = "Hemat" if predicted_kmpl >= threshold else "Boros"
        
        # SHAP values
        shap_values_obj = self.explainer(X_processed)
        shap_vals = shap_values_obj.values[0]
        base_value = float(shap_values_obj.base_values[0])
        
        # Build SHAP feature list (sorted by absolute impact)
        shap_features = []
        for i, fname in enumerate(feature_names):
            sv = float(shap_vals[i])
            fval = float(X_processed[0][i])
            human_label = FEATURE_LABELS.get(fname, fname)
            
            if abs(sv) > 0.01:  # Only include meaningful contributions
                shap_features.append({
                    "feature": fname,
                    "label": human_label,
                    "value": round(fval, 2),
                    "shap_value": round(sv, 4),
                    "effect": "mendukung Hemat" if sv > 0 else "mendukung Boros",
                })
        
        # Sort by absolute SHAP value (most impactful first)
        shap_features.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        
        return {
            "predicted_kmpl": round(predicted_kmpl, 2),
            "label": label,
            "threshold": threshold,
            "shap_values": shap_features,
            "base_value": round(base_value, 4),
        }
    
    def get_population_average(self, vehicle_type: str = None) -> dict:
        """Get population average fuel efficiency."""
        if self.dataset is None:
            return {"overall": 0, "by_type": {}}
        
        overall_avg = float(self.dataset['fuel_efficiency_kmpl'].mean())
        
        by_type = {}
        for vtype in self.dataset['vehicle_type'].unique():
            mask = self.dataset['vehicle_type'] == vtype
            by_type[vtype] = round(float(self.dataset.loc[mask, 'fuel_efficiency_kmpl'].mean()), 2)
        
        result = {
            "overall": round(overall_avg, 2),
            "by_type": by_type,
        }
        
        if vehicle_type and vehicle_type in by_type:
            result["selected_type_avg"] = by_type[vehicle_type]
        
        return result
    
    def generate_shap_force_plot(self, raw_input: dict) -> str:
        """Generate SHAP force plot as base64 PNG image."""
        X_processed, feature_names = transform_input(raw_input, self.encoder_info)
        shap_values_obj = self.explainer(X_processed)
        
        # Use human-readable labels
        human_labels = [FEATURE_LABELS.get(f, f) for f in feature_names]
        
        fig, ax = plt.subplots(figsize=(14, 3))
        shap.plots.waterfall(shap_values_obj[0], show=False, max_display=10)
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight', facecolor='#1e293b', edgecolor='none')
        plt.close(fig)
        buf.seek(0)
        
        return base64.b64encode(buf.read()).decode('utf-8')
    
    def generate_shap_summary_plot(self) -> str:
        """Generate SHAP summary plot (global) as base64 PNG image."""
        if self.dataset is None:
            return ""
        
        # Sample for performance
        sample = self.dataset.sample(min(500, len(self.dataset)), random_state=42)
        feature_cols = self.encoder_info['feature_cols']
        categorical_cols = self.encoder_info['categorical_cols']
        numerical_cols = self.encoder_info['numerical_cols']
        
        X_sample = sample[feature_cols].copy()
        numerical_values = X_sample[numerical_cols].values
        categorical_values = self.encoder_info['encoder'].transform(X_sample[categorical_cols])
        X_processed = np.hstack([numerical_values, categorical_values])
        
        shap_values = self.explainer(X_processed)
        
        fig, ax = plt.subplots(figsize=(10, 6))
        shap.summary_plot(shap_values.values, X_processed,
                         feature_names=self.encoder_info['all_feature_names'],
                         show=False, max_display=15)
        plt.tight_layout()
        
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight', facecolor='#1e293b', edgecolor='none')
        plt.close(fig)
        buf.seek(0)
        
        return base64.b64encode(buf.read()).decode('utf-8')


# Global singleton instance
model_service = ModelService()
