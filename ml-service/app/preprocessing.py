"""
Preprocessing module for ML Service.
Handles encoding of raw input data into model-ready format.
"""

import numpy as np
import pandas as pd
import joblib
import os

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')


def load_encoders():
    """Load saved encoder info from disk."""
    encoder_path = os.path.join(MODELS_DIR, 'encoders.pkl')
    return joblib.load(encoder_path)


def transform_input(raw_input: dict, encoder_info: dict) -> tuple:
    """
    Transform raw input dict into model-ready numpy array.
    
    Returns:
        (X_processed, feature_names): Tuple of processed array and feature names
    """
    encoder = encoder_info['encoder']
    categorical_cols = encoder_info['categorical_cols']
    numerical_cols = encoder_info['numerical_cols']
    
    # Create DataFrame from raw input
    input_df = pd.DataFrame([raw_input])
    
    # Extract numerical features
    numerical_values = input_df[numerical_cols].values
    
    # Encode categorical features
    categorical_values = encoder.transform(input_df[categorical_cols])
    
    # Combine
    X_processed = np.hstack([numerical_values, categorical_values])
    
    return X_processed, encoder_info['all_feature_names']
