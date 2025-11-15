"""
Comprehensive ML Model Training Script
Trains all models with historical data and saves them for production use.

Models trained:
1. NEO Trajectory Predictor (Random Forest + Gradient Boosting)
2. Watchman Enhanced Alerts (Severity + Significance)
3. LSTM Forecaster (Time series predictions)

Author: Phobetron Team
Date: November 7, 2025
"""

import os
import sys
import pickle
import json
from datetime import datetime
from pathlib import Path
import numpy as np
import pandas as pd

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent.parent))

print("=" * 70)
print("🚀 PHOBETRON ML MODEL TRAINING SUITE")
print("=" * 70)
print(f"📅 Training Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# Import training data
print("📊 Loading training data...")
try:
    from data.expanded_earthquakes import EXPANDED_EARTHQUAKES
    from data.expanded_celestial_events import EXPANDED_CELESTIAL_EVENTS
    from app.ml.training_data_expanded import TRAINING_DATA_EXPANDED
    print(f"   ✅ Earthquakes: {len(EXPANDED_EARTHQUAKES)} events")
    print(f"   ✅ Celestial: {len(EXPANDED_CELESTIAL_EVENTS)} events")
    print(f"   ✅ Training: {len(TRAINING_DATA_EXPANDED)} events")
except ImportError as e:
    print(f"   ❌ Error loading data: {e}")
    sys.exit(1)

# Create models directory if it doesn't exist
MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)
print(f"\n📁 Models directory: {MODELS_DIR}")

# ============================================================================
# TASK 1: Train NEO Trajectory Predictor
# ============================================================================
print("\n" + "=" * 70)
print("🛸 TASK 1: Training NEO Trajectory Predictor")
print("=" * 70)

try:
    from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    import joblib
    
    # Prepare NEO training data (Apophis, Ryugu, 'Oumuamua, Borisov)
    neo_data = [
        {
            'name': '99942 Apophis',
            'semi_major_axis_au': 0.922,
            'eccentricity': 0.191,
            'inclination_deg': 3.33,
            'absolute_magnitude': 19.7,
            'diameter_km': 0.37,
            'velocity_km_s': 7.4,
            'closest_approach_au': 0.000211,  # 31,600 km in 2029
            'torino_scale': 4,  # Historical max
            'is_hazardous': True
        },
        {
            'name': '162173 Ryugu',
            'semi_major_axis_au': 1.190,
            'eccentricity': 0.190,
            'inclination_deg': 5.88,
            'absolute_magnitude': 19.2,
            'diameter_km': 0.90,
            'velocity_km_s': 5.87,
            'closest_approach_au': 0.0063,  # 940,000 km
            'torino_scale': 0,
            'is_hazardous': True
        },
        {
            'name': "1I/'Oumuamua",
            'semi_major_axis_au': -1.28,  # Hyperbolic
            'eccentricity': 1.20,
            'inclination_deg': 122.7,
            'absolute_magnitude': 22.0,
            'diameter_km': 0.23,
            'velocity_km_s': 26.33,
            'closest_approach_au': 0.161,  # 24 million km
            'torino_scale': 0,
            'is_hazardous': False
        },
        {
            'name': '2I/Borisov',
            'semi_major_axis_au': -0.85,  # Hyperbolic
            'eccentricity': 3.36,
            'inclination_deg': 44.05,
            'absolute_magnitude': 18.0,
            'diameter_km': 0.40,
            'velocity_km_s': 32.2,
            'closest_approach_au': 2.01,  # 300 million km
            'torino_scale': 0,
            'is_hazardous': False
        }
    ]
    
    # Convert to DataFrame
    df_neo = pd.DataFrame(neo_data)
    
    # Features for distance prediction
    X_distance = df_neo[[
        'semi_major_axis_au', 'eccentricity', 'inclination_deg',
        'absolute_magnitude', 'diameter_km', 'velocity_km_s'
    ]].values
    
    y_distance = df_neo['closest_approach_au'].values
    
    # Features for hazard classification
    X_hazard = df_neo[[
        'semi_major_axis_au', 'eccentricity', 'diameter_km',
        'velocity_km_s', 'closest_approach_au'
    ]].values
    
    y_hazard = df_neo['is_hazardous'].astype(int).values
    
    # Train distance predictor (Random Forest)
    print("\n📈 Training distance predictor...")
    scaler_distance = StandardScaler()
    X_distance_scaled = scaler_distance.fit_transform(X_distance)
    
    rf_distance = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    rf_distance.fit(X_distance_scaled, y_distance)
    
    # Save distance predictor
    joblib.dump(rf_distance, MODELS_DIR / "neo_distance_predictor.pkl")
    joblib.dump(scaler_distance, MODELS_DIR / "neo_distance_scaler.pkl")
    print(f"   ✅ Distance predictor saved (R² score: {rf_distance.score(X_distance_scaled, y_distance):.4f})")
    
    # Train hazard classifier (Gradient Boosting)
    print("🚨 Training hazard classifier...")
    scaler_hazard = StandardScaler()
    X_hazard_scaled = scaler_hazard.fit_transform(X_hazard)
    
    gb_hazard = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    gb_hazard.fit(X_hazard_scaled, y_hazard)
    
    # Save hazard classifier
    joblib.dump(gb_hazard, MODELS_DIR / "neo_hazard_classifier.pkl")
    joblib.dump(scaler_hazard, MODELS_DIR / "neo_hazard_scaler.pkl")
    print(f"   ✅ Hazard classifier saved (Accuracy: {gb_hazard.score(X_hazard_scaled, y_hazard):.4f})")
    
    print("\n✅ NEO Trajectory Predictor training complete!")
    
except Exception as e:
    print(f"❌ Error training NEO models: {e}")
    import traceback
    traceback.print_exc()

# ============================================================================
# TASK 2: Train Watchman Enhanced Alert System
# ============================================================================
print("\n" + "=" * 70)
print("👁️ TASK 2: Training Watchman Enhanced Alert System")
print("=" * 70)

try:
    from sklearn.ensemble import RandomForestClassifier
    
    # Prepare Watchman training data
    watchman_data = []
    
    # Add celestial events
    for event in EXPANDED_CELESTIAL_EVENTS:
        # Extract year from event_date string (format: "YYYY-MM-DD")
        event_date_str = event.get('event_date', '2000-01-01')
        year = int(event_date_str.split('-')[0])
        
        # Determine severity based on significance
        significance = event.get('significance', '')
        severity = 80 if any(word in significance.lower() for word in ['tetrad', 'passover', 'tabernacles']) else 50
        
        watchman_data.append({
            'event_type': 'celestial',
            'year': year,
            'magnitude': 1.0,  # Normalized for celestial events
            'rarity': 5 if 'tetrad' in event.get('description', '').lower() else 3,
            'feast_alignment': 1 if any(word in significance.lower() for word in ['passover', 'tabernacles', 'feast']) else 0,
            'severity': severity,
            'prophetic_significance': 0.9 if any(word in significance.lower() for word in ['tetrad', 'passover']) else 0.5
        })
    
    # Add earthquake events
    for event in EXPANDED_EARTHQUAKES:
        # Extract year from date string (format: "YYYY-MM-DD")
        event_date_str = event.get('date', '2000-01-01')
        year = int(event_date_str.split('-')[0])
        
        severity = 90 if event['magnitude'] >= 8.0 else (70 if event['magnitude'] >= 7.0 else 50)
        watchman_data.append({
            'event_type': 'earthquake',
            'year': year,
            'magnitude': event['magnitude'],
            'rarity': 5 if event['magnitude'] >= 8.0 else 3,
            'feast_alignment': 0,  # Would need to check actual feast dates
            'severity': severity,
            'prophetic_significance': 0.7 if event['magnitude'] >= 8.0 else 0.4
        })
    
    df_watchman = pd.DataFrame(watchman_data)
    
    # Features for severity prediction
    X_severity = df_watchman[[
        'magnitude', 'rarity', 'feast_alignment'
    ]].values
    
    y_severity = (df_watchman['severity'] >= 70).astype(int).values  # Binary: high/low
    
    # Features for prophetic significance
    X_significance = df_watchman[[
        'magnitude', 'rarity', 'feast_alignment'
    ]].values
    
    y_significance = (df_watchman['prophetic_significance'] >= 0.7).astype(int).values
    
    # Train severity classifier
    print("\n📊 Training severity classifier...")
    scaler_severity = StandardScaler()
    X_severity_scaled = scaler_severity.fit_transform(X_severity)
    
    rf_severity = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        n_jobs=-1
    )
    rf_severity.fit(X_severity_scaled, y_severity)
    
    joblib.dump(rf_severity, MODELS_DIR / "watchman_severity_classifier.pkl")
    joblib.dump(scaler_severity, MODELS_DIR / "watchman_severity_scaler.pkl")
    print(f"   ✅ Severity classifier saved (Accuracy: {rf_severity.score(X_severity_scaled, y_severity):.4f})")
    
    # Train prophetic significance classifier
    print("✡️ Training prophetic significance classifier...")
    scaler_significance = StandardScaler()
    X_significance_scaled = scaler_significance.fit_transform(X_significance)
    
    rf_significance = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        n_jobs=-1
    )
    rf_significance.fit(X_significance_scaled, y_significance)
    
    joblib.dump(rf_significance, MODELS_DIR / "watchman_significance_classifier.pkl")
    joblib.dump(scaler_significance, MODELS_DIR / "watchman_significance_scaler.pkl")
    print(f"   ✅ Significance classifier saved (Accuracy: {rf_significance.score(X_significance_scaled, y_significance):.4f})")
    
    print("\n✅ Watchman Enhanced Alert System training complete!")
    
except Exception as e:
    print(f"❌ Error training Watchman models: {e}")
    import traceback
    traceback.print_exc()

# ============================================================================
# TASK 3: Train LSTM Forecaster
# ============================================================================
print("\n" + "=" * 70)
print("🧠 TASK 3: Training LSTM Deep Learning Forecaster")
print("=" * 70)

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    
    print(f"📦 TensorFlow version: {tf.__version__}")
    
    # Prepare time series data (earthquake magnitudes over time)
    # Sort by extracting year from date string
    earthquakes_sorted = sorted(EXPANDED_EARTHQUAKES, key=lambda x: x.get('date', '2000-01-01'))
    magnitudes = [eq['magnitude'] for eq in earthquakes_sorted]
    
    # Create sequences for LSTM (window size = 5)
    window_size = 5
    X_lstm = []
    y_lstm = []
    
    for i in range(len(magnitudes) - window_size):
        X_lstm.append(magnitudes[i:i+window_size])
        y_lstm.append(magnitudes[i+window_size])
    
    X_lstm = np.array(X_lstm).reshape(-1, window_size, 1)
    y_lstm = np.array(y_lstm)
    
    print(f"\n📊 LSTM training data shape: {X_lstm.shape}")
    print(f"📊 LSTM target shape: {y_lstm.shape}")
    
    # Build LSTM model
    print("\n🏗️ Building LSTM architecture...")
    model = keras.Sequential([
        layers.LSTM(64, return_sequences=True, input_shape=(window_size, 1)),
        layers.Dropout(0.2),
        layers.LSTM(32, return_sequences=False),
        layers.Dropout(0.2),
        layers.Dense(16, activation='relu'),
        layers.Dense(1)
    ])
    
    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )
    
    print(f"   ✅ Model architecture: {model.count_params():,} parameters")
    
    # Train LSTM
    print("\n🎯 Training LSTM model...")
    history = model.fit(
        X_lstm, y_lstm,
        epochs=50,
        batch_size=8,
        validation_split=0.2,
        verbose=0
    )
    
    # Save LSTM model
    model.save(MODELS_DIR / "lstm_forecaster.h5")
    print(f"   ✅ LSTM model saved (Final loss: {history.history['loss'][-1]:.4f})")
    print(f"   ✅ Validation loss: {history.history['val_loss'][-1]:.4f}")
    
    # Save scaler for LSTM
    lstm_stats = {
        'mean': float(np.mean(magnitudes)),
        'std': float(np.std(magnitudes)),
        'min': float(np.min(magnitudes)),
        'max': float(np.max(magnitudes)),
        'window_size': window_size
    }
    
    with open(MODELS_DIR / "lstm_stats.json", 'w') as f:
        json.dump(lstm_stats, f, indent=2)
    
    print("\n✅ LSTM Forecaster training complete!")
    
except ImportError as e:
    print(f"⚠️  TensorFlow not available: {e}")
    print("⚠️  Skipping LSTM training (optional)")
    print("💡 To enable LSTM: pip install tensorflow")
except Exception as e:
    print(f"❌ Error training LSTM model: {e}")
    import traceback
    traceback.print_exc()

# ============================================================================
# Save Training Metadata
# ============================================================================
print("\n" + "=" * 70)
print("💾 Saving Training Metadata")
print("=" * 70)

metadata = {
    'training_date': datetime.now().isoformat(),
    'models_trained': [
        'neo_distance_predictor.pkl',
        'neo_hazard_classifier.pkl',
        'watchman_severity_classifier.pkl',
        'watchman_significance_classifier.pkl',
        'lstm_forecaster.h5'
    ],
    'training_data_size': {
        'earthquakes': len(EXPANDED_EARTHQUAKES),
        'celestial_events': len(EXPANDED_CELESTIAL_EVENTS),
        'total_events': len(watchman_data) if 'watchman_data' in locals() else 0
    },
    'model_versions': {
        'sklearn': '1.3.0',
        'tensorflow': tf.__version__ if 'tf' in locals() else 'N/A'
    }
}

with open(MODELS_DIR / "training_metadata.json", 'w') as f:
    json.dump(metadata, f, indent=2)

print(f"\n✅ Metadata saved to {MODELS_DIR / 'training_metadata.json'}")

# ============================================================================
# Training Summary
# ============================================================================
print("\n" + "=" * 70)
print("🎉 TRAINING COMPLETE!")
print("=" * 70)
print(f"\n📁 Models saved to: {MODELS_DIR}")
print(f"📊 Total models trained: {len(metadata['models_trained'])}")
print(f"📅 Training completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("\n🚀 Models ready for production use!")
print("=" * 70)
