"""
ML Model Training Script
Trains all machine learning models using collected historical data
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, accuracy_score, classification_report
import joblib
import os
from datetime import datetime

# Paths
DATA_DIR = "../data"
MODELS_DIR = "../app/ml/models"

def ensure_dirs():
    """Create necessary directories"""
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"✅ Models directory ready: {MODELS_DIR}")

def train_neo_models():
    """Train NEO trajectory prediction models"""
    print("\n" + "="*70)
    print("🚀 TRAINING NEO TRAJECTORY MODELS")
    print("="*70)
    
    # Load close approach data
    try:
        neo_data = pd.read_csv(f"{DATA_DIR}/neo_close_approaches.csv")
        print(f"📊 Loaded {len(neo_data)} NEO close approaches")
    except FileNotFoundError:
        print("⚠️  NEO data not found. Run collect_neo_data.py first.")
        return
    
    # Feature engineering
    print("\n🔧 Engineering features...")
    
    # Convert dates
    neo_data['close_approach_date'] = pd.to_datetime(neo_data['close_approach_date'])
    neo_data['year'] = neo_data['close_approach_date'].dt.year
    neo_data['month'] = neo_data['close_approach_date'].dt.month
    
    # Calculate derived features
    neo_data['log_distance'] = np.log1p(neo_data['distance_km'])
    neo_data['velocity_squared'] = neo_data['velocity_km_s'] ** 2
    
    # Create risk categories for classification
    # Based on Torino scale thresholds
    def categorize_risk(row):
        if row['distance_km'] > 1000000:  # > 1M km
            return 0  # LOW
        elif row['distance_km'] > 500000:  # 500K-1M km
            return 1  # MODERATE
        elif row['distance_km'] > 100000:  # 100K-500K km
            return 2  # ELEVATED
        else:
            return 3  # HIGH
    
    neo_data['risk_category'] = neo_data.apply(categorize_risk, axis=1)
    
    # Select features for modeling
    feature_cols = [
        'distance_au',
        'velocity_km_s',
        'absolute_magnitude',
        'year',
        'month',
        'velocity_squared',
    ]
    
    # Filter out rows with missing values
    neo_data_clean = neo_data.dropna(subset=feature_cols + ['distance_km', 'risk_category'])
    print(f"✅ Cleaned dataset: {len(neo_data_clean)} samples")
    
    X = neo_data_clean[feature_cols]
    y_distance = neo_data_clean['distance_km']
    y_risk = neo_data_clean['risk_category']
    
    print(f"\n📊 Dataset shape: {X.shape}")
    print(f"   Features: {', '.join(feature_cols)}")
    print(f"   Target variables: distance_km (regression), risk_category (classification)")
    
    # === MODEL 1: Distance Prediction (Random Forest Regressor) ===
    print("\n🌲 Training Random Forest for distance prediction...")
    
    X_train, X_test, y_train_dist, y_test_dist = train_test_split(
        X, y_distance, test_size=0.2, random_state=42
    )
    
    rf_model = RandomForestRegressor(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    
    rf_model.fit(X_train, y_train_dist)
    
    # Evaluate
    y_pred_dist = rf_model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test_dist, y_pred_dist))
    
    # Cross-validation
    cv_scores = cross_val_score(rf_model, X, y_distance, cv=5, scoring='neg_root_mean_squared_error', n_jobs=-1)
    cv_rmse = -cv_scores.mean()
    
    print(f"   ✅ Test RMSE: {rmse:,.0f} km")
    print(f"   ✅ CV RMSE (5-fold): {cv_rmse:,.0f} km")
    print(f"   ✅ Feature importance:")
    for feat, imp in zip(feature_cols, rf_model.feature_importances_):
        print(f"      {feat}: {imp:.4f}")
    
    # Save model
    joblib.dump(rf_model, f"{MODELS_DIR}/neo_distance_rf.pkl")
    print(f"   💾 Saved model: neo_distance_rf.pkl")
    
    # === MODEL 2: Risk Classification (Gradient Boosting) ===
    print("\n🚀 Training Gradient Boosting for risk classification...")
    
    X_train, X_test, y_train_risk, y_test_risk = train_test_split(
        X, y_risk, test_size=0.2, random_state=42, stratify=y_risk
    )
    
    gb_model = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        random_state=42
    )
    
    gb_model.fit(X_train, y_train_risk)
    
    # Evaluate
    y_pred_risk = gb_model.predict(X_test)
    accuracy = accuracy_score(y_test_risk, y_pred_risk)
    
    # Cross-validation
    cv_acc = cross_val_score(gb_model, X, y_risk, cv=5, scoring='accuracy', n_jobs=-1)
    
    print(f"   ✅ Test Accuracy: {accuracy*100:.2f}%")
    print(f"   ✅ CV Accuracy (5-fold): {cv_acc.mean()*100:.2f}% (+/- {cv_acc.std()*100:.2f}%)")
    print(f"\n   📊 Classification Report:")
    print(classification_report(y_test_risk, y_pred_risk, target_names=['LOW', 'MODERATE', 'ELEVATED', 'HIGH']))
    
    # Save model
    joblib.dump(gb_model, f"{MODELS_DIR}/neo_collision_gb.pkl")
    print(f"   💾 Saved model: neo_collision_gb.pkl")
    
    # Save feature list
    with open(f"{MODELS_DIR}/neo_features.txt", 'w') as f:
        f.write('\n'.join(feature_cols))
    print(f"   💾 Saved feature list: neo_features.txt")


def train_watchman_models():
    """Train Watchman alert severity and clustering models"""
    print("\n" + "="*70)
    print("👁️  TRAINING WATCHMAN ALERT MODELS")
    print("="*70)
    
    # Load tetrad data
    try:
        tetrad_data = pd.read_csv(f"{DATA_DIR}/blood_moon_tetrads.csv")
        print(f"📊 Loaded {len(tetrad_data)} tetrad eclipse events")
    except FileNotFoundError:
        print("⚠️  Tetrad data not found. Run collect_tetrad_data.py first.")
        return
    
    # Feature engineering for tetrads
    print("\n🔧 Engineering features for Watchman alerts...")
    
    tetrad_data['eclipse_date'] = pd.to_datetime(tetrad_data['eclipse_date'])
    tetrad_data['year'] = tetrad_data['eclipse_date'].dt.year
    tetrad_data['month'] = tetrad_data['eclipse_date'].dt.month
    
    # Create severity score (0-100)
    def calculate_severity(row):
        score = 50  # Base score for tetrad eclipse
        if row['jerusalem_visible']:
            score += 20
        if row['is_spring_feast']:
            score += 10
        if row['is_fall_feast']:
            score += 10
        # Historical significance bonus
        if row['year'] in [1948, 1949, 1967, 1968, 2014, 2015]:
            score += 10
        return min(score, 100)
    
    tetrad_data['severity_score'] = tetrad_data.apply(calculate_severity, axis=1)
    
    # Features for severity prediction
    feature_cols = [
        'tetrad_id',
        'jerusalem_visible',
        'is_spring_feast',
        'is_fall_feast',
        'year',
        'month',
    ]
    
    # Convert boolean to int
    tetrad_data['jerusalem_visible'] = tetrad_data['jerusalem_visible'].astype(int)
    tetrad_data['is_spring_feast'] = tetrad_data['is_spring_feast'].astype(int)
    tetrad_data['is_fall_feast'] = tetrad_data['is_fall_feast'].astype(int)
    
    X = tetrad_data[feature_cols]
    y_severity = tetrad_data['severity_score']
    
    print(f"\n📊 Dataset shape: {X.shape}")
    print(f"   Severity range: {y_severity.min()}-{y_severity.max()}")
    
    # Train Gradient Boosting for severity scoring
    print("\n🚀 Training Gradient Boosting for severity scoring...")
    
    if len(X) < 10:
        print("⚠️  Insufficient data for full train/test split. Using all data for training.")
        gb_severity = GradientBoostingClassifier(
            n_estimators=50,
            learning_rate=0.1,
            max_depth=3,
            random_state=42
        )
        # Create severity classes
        y_severity_class = pd.cut(y_severity, bins=[0, 60, 80, 100], labels=[0, 1, 2])
        gb_severity.fit(X, y_severity_class)
        
        print(f"   ✅ Trained on {len(X)} samples")
    else:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_severity, test_size=0.2, random_state=42
        )
        
        # Create severity classes (LOW, MODERATE, HIGH)
        y_train_class = pd.cut(y_train, bins=[0, 60, 80, 100], labels=[0, 1, 2])
        y_test_class = pd.cut(y_test, bins=[0, 60, 80, 100], labels=[0, 1, 2])
        
        gb_severity = GradientBoostingClassifier(
            n_estimators=50,
            learning_rate=0.1,
            max_depth=3,
            random_state=42
        )
        
        gb_severity.fit(X_train, y_train_class)
        
        y_pred = gb_severity.predict(X_test)
        accuracy = accuracy_score(y_test_class, y_pred)
        
        print(f"   ✅ Test Accuracy: {accuracy*100:.2f}%")
    
    # Save model
    joblib.dump(gb_severity, f"{MODELS_DIR}/watchman_severity_gb.pkl")
    print(f"   💾 Saved model: watchman_severity_gb.pkl")
    
    # Save feature list
    with open(f"{MODELS_DIR}/watchman_features.txt", 'w') as f:
        f.write('\n'.join(feature_cols))
    print(f"   💾 Saved feature list: watchman_features.txt")


def main():
    """Main training pipeline"""
    print("="*70)
    print("🤖 PHOBETRON ML MODEL TRAINING PIPELINE")
    print("="*70)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Data directory: {DATA_DIR}")
    print(f"Models directory: {MODELS_DIR}")
    
    # Ensure directories exist
    ensure_dirs()
    
    # Train all models
    train_neo_models()
    train_watchman_models()
    
    # Summary
    print("\n" + "="*70)
    print("✅ TRAINING COMPLETE")
    print("="*70)
    
    # List saved models
    models = [f for f in os.listdir(MODELS_DIR) if f.endswith('.pkl')]
    print(f"\n💾 Saved models ({len(models)}):")
    for model in models:
        size_kb = os.path.getsize(f"{MODELS_DIR}/{model}") / 1024
        print(f"   • {model} ({size_kb:.1f} KB)")
    
    print(f"\n🎯 Models ready for deployment!")
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)


if __name__ == "__main__":
    main()
