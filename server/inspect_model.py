import joblib
import os
import sys

model_path = os.path.join(os.path.dirname(__file__), 'ml_models', 'bandra-kurla complex, mumbai-air-quality_rf_model.pkl')

try:
    with open(model_path, 'rb') as f:
        model = joblib.load(f)
    
    print(f"Model type: {type(model)}")
    if hasattr(model, 'n_features_in_'):
        print(f"Number of features: {model.n_features_in_}")
    if hasattr(model, 'feature_names_in_'):
        print(f"Feature names: {model.feature_names_in_}")
        
except Exception as e:
    print(f"Error: {e}")
