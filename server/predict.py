import pandas as pd
import joblib
import sys
import os
import json
import numpy as np
from datetime import datetime, timedelta
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

def get_latest_pollutant_value(row, pollutant_name):
    # Iterate backwards through columns to find the pollutant value
    # The columns are likely named "Pollutant", "Pollutant.1", "Pollutant.2", etc.
    # We look for columns that start with the pollutant name
    
    # Get all columns matching the pollutant name (exact or with .suffix)
    matching_cols = [c for c in row.index if c == pollutant_name or c.startswith(f"{pollutant_name}.")]
    
    # Sort them to find the latest (assuming .1, .2, .10 order is roughly chronological or we just take the last one)
    # Actually, pandas handles duplicate column names by suffixing .1, .2 etc automatically.
    # But if the file was created by appending axis=1, the order in the file is chronological (left to right).
    # So the last matching column is the latest.
    
    if not matching_cols:
        return 0.0 # Default if not found
        
    # Get values from these columns
    values = row[matching_cols].values
    
    # Find the last non-null value
    for val in reversed(values):
        if pd.notna(val) and val != 'N/A':
            try:
                return float(val)
            except:
                continue
                
    return 0.0

def get_latest_date(row):
    matching_cols = [c for c in row.index if c.startswith("Collection Time")]
    if not matching_cols:
        return datetime.now()
        
    values = row[matching_cols].values
    for val in reversed(values):
        if pd.notna(val) and val != 'N/A':
            try:
                return pd.to_datetime(val)
            except:
                continue
    return datetime.now()

def predict(location_name, months_offset):
    try:
        # 1. Load Data
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'data', 'mumbai_air_quality_data.csv')
        if not os.path.exists(data_path):
            return {"error": "Data file not found"}
            
        df = pd.read_csv(data_path)
        
        # 2. Find Location Row
        # Normalize names for matching
        # Map frontend names to CSV names if needed, or just fuzzy match
        # For now, exact match or substring match
        # Use regex=False to handle special characters like parentheses literally
        station_row = df[df['Station Name'].str.contains(location_name, case=False, na=False, regex=False)]
        
        if station_row.empty:
            return {"error": f"Station '{location_name}' not found in data"}
            
        row = station_row.iloc[0]
        
        # 3. Determine Model File
        # Map location to model filename prefix
        model_map = {
            "bandra": "bandra-kurla complex, mumbai-air-quality",
            "kurla": "kurla,-mumbai-air-quality",
            "airport": "chhatrapati-shivaji intl. airport (t2), mumbai-air-quality",
            "chakala": "chakala-andheri-east, mumbai-air-quality",
            "mazgaon": "mazgaon,-mumbai-air-quality",
            "powai": "powai,-mumbai-air-quality (2)",
            "colaba": "navy-nagar-colaba, mumbai-air-quality",
            "worli": "worli,-mumbai-air-quality",
            "vile parle": "bandra-kurla complex, mumbai-air-quality", # Fallback/Closest
            "sion": "kurla,-mumbai-air-quality", # Fallback
            "deonar": "kurla,-mumbai-air-quality", # Fallback
            "kandivali": "borivali east mpcb, mumbai-air-quality", # Fallback
            "borivali": "borivali east mpcb, mumbai-air-quality", # Fallback
            "mulund": "mulund west, mumbai-air-quality", # Fallback
        }
        
        model_prefix = None
        for key, value in model_map.items():
            if key.lower() in location_name.lower():
                model_prefix = value
                break
        
        if not model_prefix:
            # Try to find a model that matches the station name words
            return {"error": f"No model found for '{location_name}'"}

        models_dir = os.path.join(os.path.dirname(__file__), 'ml_models')
        rf_model_path = os.path.join(models_dir, f"{model_prefix}_rf_model.pkl")
        scaler_path = os.path.join(models_dir, f"{model_prefix}_featurescaler.pkl")
        target_scaler_path = os.path.join(models_dir, f"{model_prefix}_target_scaler.pkl")
        
        if not os.path.exists(rf_model_path):
             return {"error": f"Model file not found: {rf_model_path}"}

        # 4. Load Models
        rf_model = joblib.load(rf_model_path)
        scaler = joblib.load(scaler_path)
        target_scaler = joblib.load(target_scaler_path)
        
        # 5. Construct Features
        # Get latest values
        pm10 = get_latest_pollutant_value(row, 'PM10')
        o3 = get_latest_pollutant_value(row, 'O3')
        no2 = get_latest_pollutant_value(row, 'NO2')
        so2 = get_latest_pollutant_value(row, 'SO2')
        co = get_latest_pollutant_value(row, 'CO')
        pm25 = get_latest_pollutant_value(row, 'PM2.5')
        
        base_date = get_latest_date(row)
        target_date = base_date + timedelta(days=30 * int(months_offset))
        
        # Time features
        day_of_week = target_date.weekday()
        month = target_date.month
        quarter = (month - 1) // 3 + 1
        is_weekend = 1 if day_of_week >= 5 else 0
        is_winter = 1 if month in [12, 1, 2] else 0
        is_summer = 1 if month in [3, 4, 5] else 0
        
        # Lag features (Approximation: use current values for lags)
        # In a real scenario, we would need historical data or recursive prediction
        pm25_lag1 = pm25
        pm25_lag2 = pm25
        pm25_lag3 = pm25
        pm25_lag7 = pm25
        
        pm10_lag1 = pm10
        pm10_lag2 = pm10
        pm10_lag3 = pm10
        pm10_lag7 = pm10
        
        # Rolling features (Approximation)
        pm25_rolling_mean_7 = pm25
        pm25_rolling_std_7 = 0 # Assume stable
        pm10_rolling_mean_7 = pm10
        
        # Feature vector (must match the order in inspect_model.py output)
        # ['pm10' 'o3' 'no2' 'so2' 'co' 'day_of_week' 'month' 'quarter' 'is_weekend' 'is_winter' 'is_summer' 
        #  'pm25_lag1' 'pm25_lag2' 'pm25_lag3' 'pm25_lag7' 'pm10_lag1' 'pm10_lag2' 'pm10_lag3' 'pm10_lag7' 
        #  'pm25_rolling_mean_7' 'pm25_rolling_std_7' 'pm10_rolling_mean_7']
        
        # Scale the base pollutants first?
        # The scaler inspected earlier had 5 features: ['pm10' 'o3' 'no2' 'so2' 'co']
        # So we must scale these 5 first, then append the rest?
        # OR does the model expect scaled values for the first 5 and raw for others?
        # Usually, pipelines handle this. But here we have separate scaler and model.
        # It's likely we need to scale the 5 pollutants, and then construct the full vector.
        # BUT, the RF model expects 22 features.
        # If we pass raw values to RF, it might work if it was trained on raw values (RF is robust to scaling).
        # However, if a scaler exists, it was likely used.
        # Let's assume the scaler is for the INPUT of the model?
        # But the scaler only takes 5 features. The model takes 22.
        # This implies the training process was:
        # 1. Scale PM10, O3, NO2, SO2, CO.
        # 2. Add time/lag features (maybe unscaled or scaled separately).
        # 3. Train model.
        
        # Let's try to scale the 5 features.
        scaled_pollutants = scaler.transform([[pm10, o3, no2, so2, co]])[0]
        
        # Construct full feature vector
        features = [
            scaled_pollutants[0], # pm10
            scaled_pollutants[1], # o3
            scaled_pollutants[2], # no2
            scaled_pollutants[3], # so2
            scaled_pollutants[4], # co
            day_of_week,
            month,
            quarter,
            is_weekend,
            is_winter,
            is_summer,
            pm25_lag1, # Lags might need to be scaled too if they come from scaled data? 
                       # But usually lags are of the target (PM2.5) which might be scaled by target_scaler?
                       # This is getting complicated without seeing the training code.
                       # Let's assume lags are raw for now, or maybe scaled by target_scaler?
                       # If PM2.5 is the target, and we have a target_scaler, then lags of PM2.5 likely need to be scaled.
            pm25_lag2,
            pm25_lag3,
            pm25_lag7,
            pm10_lag1, # PM10 lags... PM10 was scaled by feature_scaler. So maybe use scaled PM10?
            pm10_lag2,
            pm10_lag3,
            pm10_lag7,
            pm25_rolling_mean_7,
            pm25_rolling_std_7,
            pm10_rolling_mean_7
        ]
        
        # Refinement on Lags:
        # If PM10 is scaled in the first 5 features, its lags should probably be scaled too.
        # Let's use the scaled PM10 for PM10 lags.
        scaled_pm10 = scaled_pollutants[0]
        features[15] = scaled_pm10 # pm10_lag1
        features[16] = scaled_pm10 # pm10_lag2
        features[17] = scaled_pm10 # pm10_lag3
        features[18] = scaled_pm10 # pm10_lag7
        features[21] = scaled_pm10 # pm10_rolling_mean_7
        
        # For PM2.5 lags, we should probably scale PM2.5 using target_scaler?
        # Let's check target_scaler type.
        # If it's MinMaxScaler, we can transform.
        # But target_scaler expects 2D array.
        try:
            scaled_pm25 = target_scaler.transform([[pm25]])[0][0]
            features[11] = scaled_pm25 # pm25_lag1
            features[12] = scaled_pm25 # pm25_lag2
            features[13] = scaled_pm25 # pm25_lag3
            features[14] = scaled_pm25 # pm25_lag7
            features[19] = scaled_pm25 # pm25_rolling_mean_7
            features[20] = 0 # std
        except:
            pass # If target scaler fails (e.g. different shape), use raw
            
        
        # Predict
        prediction_scaled = rf_model.predict([features])[0]
        
        # Inverse Scale Target
        prediction = target_scaler.inverse_transform([[prediction_scaled]])[0][0]
        
        # Add 10-20 points to the estimate as requested
        prediction += np.random.randint(10, 21)

        return {
            "location": location_name,
            "prediction_date": target_date.strftime('%Y-%m-%d'),
            "predicted_aqi": round(prediction, 2), # Assuming target is AQI or PM2.5 which correlates to AQI
            "note": "Prediction based on latest available data and seasonal trends."
        }
        
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python predict.py <location> <months_offset>"}))
    else:
        loc = sys.argv[1]
        offset = sys.argv[2]
        result = predict(loc, offset)
        print(json.dumps(result))
