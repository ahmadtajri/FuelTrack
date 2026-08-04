"""
Train XGBoost Regressor for Fuel Efficiency Prediction
=======================================================
Loads the synthetic dataset, encodes categorical features,
trains XGBRegressor to predict fuel_efficiency_kmpl,
and saves model + encoders.

Output: models/xgb_model.pkl, models/encoders.pkl
"""

import sys
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Paths
DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'vehicle_fuel_dataset.csv')
MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'ml-service', 'models')


def main():
    print("📦 Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"   Rows: {len(df)}, Columns: {len(df.columns)}")

    # =========================================================================
    # Feature selection
    # =========================================================================
    feature_cols = [
        'vehicle_category', 'vehicle_type', 'engine_cc', 'cylinders',
        'horsepower', 'weight_kg', 'transmission', 'fuel_type',
        'cooling_system', 'daily_distance_km', 'year'
    ]
    target_col = 'fuel_efficiency_kmpl'

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # =========================================================================
    # Encode categorical features
    # =========================================================================
    categorical_cols = ['vehicle_category', 'vehicle_type', 'transmission', 'fuel_type', 'cooling_system']
    numerical_cols = [c for c in feature_cols if c not in categorical_cols]

    print("🔧 Encoding categorical features...")
    encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
    encoded_cats = encoder.fit_transform(X[categorical_cols])
    encoded_cat_names = encoder.get_feature_names_out(categorical_cols)

    # Combine numerical + encoded categorical
    X_numerical = X[numerical_cols].values
    X_processed = np.hstack([X_numerical, encoded_cats])
    all_feature_names = numerical_cols + list(encoded_cat_names)

    print(f"   Total features after encoding: {len(all_feature_names)}")

    # =========================================================================
    # Train/Test split (stratified by vehicle_category)
    # =========================================================================
    X_train, X_test, y_train, y_test = train_test_split(
        X_processed, y,
        test_size=0.2,
        random_state=42,
        stratify=df['vehicle_category']
    )
    print(f"   Train: {len(X_train)}, Test: {len(X_test)}")

    # =========================================================================
    # Train XGBRegressor
    # =========================================================================
    print("\n🚀 Training XGBRegressor...")
    model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        eval_metric='rmse'
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    print("   ✅ Training complete!")

    # =========================================================================
    # Evaluation
    # =========================================================================
    y_pred = model.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"\n📊 Overall Evaluation:")
    print(f"   MAE:  {mae:.3f} km/L")
    print(f"   RMSE: {rmse:.3f} km/L")
    print(f"   R²:   {r2:.4f}")

    if r2 >= 0.85:
        print(f"   ✅ R² target met (≥ 0.85)")
    else:
        print(f"   ⚠️  R² below target ({r2:.4f} < 0.85)")

    # Breakdown by vehicle category
    test_indices = y_test.index
    test_df = df.loc[test_indices]

    print(f"\n📊 Per-Category Evaluation:")
    for cat in ['Roda2', 'Roda4']:
        mask = test_df['vehicle_category'] == cat
        if mask.sum() > 0:
            cat_mae = mean_absolute_error(y_test[mask], y_pred[mask.values])
            cat_r2 = r2_score(y_test[mask], y_pred[mask.values])
            print(f"   {cat}: MAE={cat_mae:.3f}, R²={cat_r2:.4f} (n={mask.sum()})")

    # =========================================================================
    # Save model + encoders
    # =========================================================================
    os.makedirs(MODELS_DIR, exist_ok=True)

    model_path = os.path.join(MODELS_DIR, 'xgb_model.pkl')
    encoder_path = os.path.join(MODELS_DIR, 'encoders.pkl')

    # Save encoder info including feature names for SHAP interpretation
    encoder_info = {
        'encoder': encoder,
        'categorical_cols': categorical_cols,
        'numerical_cols': numerical_cols,
        'all_feature_names': all_feature_names,
        'feature_cols': feature_cols,
    }

    joblib.dump(model, model_path)
    joblib.dump(encoder_info, encoder_path)

    print(f"\n💾 Model saved to: {model_path}")
    print(f"💾 Encoders saved to: {encoder_path}")

    # Feature importance (top 10)
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1][:10]
    print(f"\n🏆 Top 10 Feature Importances:")
    for i, idx in enumerate(sorted_idx):
        print(f"   {i+1}. {all_feature_names[idx]}: {importances[idx]:.4f}")


if __name__ == "__main__":
    main()
