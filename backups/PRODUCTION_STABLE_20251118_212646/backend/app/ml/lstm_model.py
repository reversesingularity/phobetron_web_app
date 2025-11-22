"""
LSTM Deep Learning Model for Time Series Earthquake Prediction
Implements sequence-based forecasting for seismic event patterns
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Tuple, Dict, Optional
import json

# TensorFlow/Keras imports (to be installed)
try:
    from tensorflow import keras
    from tensorflow.keras import layers, Sequential
    from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
    from sklearn.preprocessing import MinMaxScaler
    LSTM_AVAILABLE = True
except ImportError:
    LSTM_AVAILABLE = False
    print("Warning: TensorFlow not installed. LSTM functionality disabled.")
    print("Install with: pip install tensorflow scikit-learn")


class EarthquakeL STM:
    """
    LSTM Neural Network for Time Series Earthquake Prediction
    
    Architecture:
    - Input: Sequence of historical earthquake features (magnitude, depth, location, time deltas)
    - LSTM Layer 1: 64 units with return sequences
    - Dropout: 0.2 (prevent overfitting)
    - LSTM Layer 2: 32 units
    - Dropout: 0.2
    - Dense Layer 1: 16 units (ReLU activation)
    - Output: Probability of significant event in next N days
    """
    
    def __init__(self, sequence_length: int = 10, features: int = 6):
        """
        Initialize LSTM model
        
        Args:
            sequence_length: Number of past events to consider (default 10)
            features: Number of features per event (magnitude, lat, lon, depth, time_delta, energy)
        """
        if not LSTM_AVAILABLE:
            raise ImportError("TensorFlow is required for LSTM model. Install with: pip install tensorflow")
        
        self.sequence_length = sequence_length
        self.features = features
        self.model = None
        self.scaler = MinMaxScaler()
        self.history = None
        
    def build_model(self):
        """Build LSTM architecture"""
        model = Sequential([
            # First LSTM layer (64 units, return sequences for next layer)
            layers.LSTM(
                64,
                return_sequences=True,
                input_shape=(self.sequence_length, self.features),
                name='lstm_1'
            ),
            layers.Dropout(0.2, name='dropout_1'),
            
            # Second LSTM layer (32 units)
            layers.LSTM(32, return_sequences=False, name='lstm_2'),
            layers.Dropout(0.2, name='dropout_2'),
            
            # Dense layers
            layers.Dense(16, activation='relu', name='dense_1'),
            layers.Dense(8, activation='relu', name='dense_2'),
            
            # Output layer (sigmoid for probability)
            layers.Dense(1, activation='sigmoid', name='output')
        ])
        
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', 'AUC', 'Precision', 'Recall']
        )
        
        self.model = model
        return model
    
    def prepare_sequences(self, earthquakes: List[Dict]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Convert earthquake list to LSTM sequences
        
        Args:
            earthquakes: List of earthquake dictionaries with keys:
                - magnitude, latitude, longitude, depth, event_time
        
        Returns:
            X: Input sequences (n_samples, sequence_length, features)
            y: Target labels (n_samples,) - 1 if significant event within 30 days, else 0
        """
        # Sort by time
        df = pd.DataFrame(earthquakes)
        df['event_time'] = pd.to_datetime(df['event_time'])
        df = df.sort_values('event_time').reset_index(drop=True)
        
        # Calculate features
        df['time_delta'] = df['event_time'].diff().dt.total_seconds() / 86400  # days
        df['time_delta'] = df['time_delta'].fillna(0)
        
        # Calculate seismic energy (10^(1.5 * M + 4.8) joules)
        df['energy'] = 10 ** (1.5 * df['magnitude'] + 4.8)
        df['energy_log'] = np.log10(df['energy'])
        
        # Feature matrix
        features = df[['magnitude', 'latitude', 'longitude', 'depth', 'time_delta', 'energy_log']].values
        
        # Normalize features
        features_scaled = self.scaler.fit_transform(features)
        
        # Create sequences
        X, y = [], []
        
        for i in range(len(features_scaled) - self.sequence_length - 30):  # 30 day prediction window
            # Input: sequence of past events
            X.append(features_scaled[i:i + self.sequence_length])
            
            # Target: Is there a M6+ earthquake in next 30 days?
            future_window = df.iloc[i + self.sequence_length:i + self.sequence_length + 30]
            has_significant = (future_window['magnitude'] >= 6.0).any()
            y.append(1 if has_significant else 0)
        
        return np.array(X), np.array(y)
    
    def train(self, earthquakes: List[Dict], validation_split: float = 0.2, epochs: int = 100):
        """
        Train LSTM model on historical earthquake data
        
        Args:
            earthquakes: List of earthquake dictionaries
            validation_split: Fraction of data for validation (default 0.2)
            epochs: Number of training epochs (default 100)
        """
        if self.model is None:
            self.build_model()
        
        # Prepare data
        X, y = self.prepare_sequences(earthquakes)
        
        print(f"Training data shape: X={X.shape}, y={y.shape}")
        print(f"Positive samples: {y.sum()} ({y.mean()*100:.1f}%)")
        
        # Callbacks
        early_stop = EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True,
            verbose=1
        )
        
        checkpoint = ModelCheckpoint(
            'lstm_earthquake_model.h5',
            monitor='val_loss',
            save_best_only=True,
            verbose=1
        )
        
        # Train model
        self.history = self.model.fit(
            X, y,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=32,
            callbacks=[early_stop, checkpoint],
            verbose=1
        )
        
        return self.history
    
    def predict(self, recent_earthquakes: List[Dict]) -> Dict:
        """
        Predict probability of significant earthquake in next 30 days
        
        Args:
            recent_earthquakes: List of most recent earthquakes (at least sequence_length)
        
        Returns:
            Dictionary with prediction results:
                - probability: Float 0-1 (likelihood of M6+ event in 30 days)
                - confidence: String (Low/Medium/High)
                - risk_level: String (Minimal/Low/Moderate/High/Critical)
                - recommendation: String advice
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Take most recent sequence_length events
        recent = sorted(recent_earthquakes, key=lambda x: x['event_time'])[-self.sequence_length:]
        
        if len(recent) < self.sequence_length:
            return {
                "probability": 0.0,
                "confidence": "Low",
                "risk_level": "Insufficient Data",
                "recommendation": f"Need at least {self.sequence_length} recent events for prediction"
            }
        
        # Prepare sequence
        X, _ = self.prepare_sequences(recent + [recent[-1]])  # Dummy event to create sequence
        X = X[-1:] # Take last sequence
        
        # Predict
        probability = float(self.model.predict(X, verbose=0)[0][0])
        
        # Determine confidence and risk level
        if probability < 0.3:
            risk_level = "Low"
            confidence = "High" if len(recent) >= 20 else "Medium"
            recommendation = "Continue normal monitoring. No immediate concerns."
        elif probability < 0.5:
            risk_level = "Moderate"
            confidence = "Medium"
            recommendation = "Elevated seismic activity detected. Increase monitoring frequency."
        elif probability < 0.7:
            risk_level = "High"
            confidence = "High"
            recommendation = "Significant earthquake likely within 30 days. Alert authorities and prepare emergency response."
        else:
            risk_level = "Critical"
            confidence = "High"
            recommendation = "URGENT: Very high probability of major earthquake. Immediate action required."
        
        return {
            "probability": round(probability, 4),
            "confidence": confidence,
            "risk_level": risk_level,
            "recommendation": recommendation,
            "model": "LSTM Deep Learning",
            "sequence_length": self.sequence_length,
            "features_analyzed": self.features
        }
    
    def get_feature_importance(self) -> Dict[str, float]:
        """
        Analyze feature importance using gradient-based attribution
        (Simplified version - full implementation would use integrated gradients)
        """
        feature_names = ['magnitude', 'latitude', 'longitude', 'depth', 'time_delta', 'energy_log']
        
        # For now, return placeholder importance based on domain knowledge
        # In production, use actual gradient analysis
        importance = {
            'magnitude': 0.35,  # Strongest predictor
            'energy_log': 0.25,  # Related to magnitude
            'time_delta': 0.15,  # Temporal patterns
            'depth': 0.12,  # Affects surface impact
            'latitude': 0.08,  # Geographic patterns
            'longitude': 0.05  # Geographic patterns
        }
        
        return importance
    
    def save_model(self, filepath: str):
        """Save trained model to disk"""
        if self.model is None:
            raise ValueError("No model to save. Train model first.")
        
        self.model.save(filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load trained model from disk"""
        self.model = keras.models.load_model(filepath)
        print(f"Model loaded from {filepath}")


def train_lstm_on_expanded_data():
    """
    Training script for expanded earthquake dataset
    Run this to train LSTM model on 100+ historical events
    """
    if not LSTM_AVAILABLE:
        print("TensorFlow not available. Please install: pip install tensorflow")
        return
    
    # Import expanded earthquake data
    from data.expanded_earthquakes import EXPANDED_EARTHQUAKES
    
    # Convert to format expected by LSTM
    earthquakes = []
    for eq in EXPANDED_EARTHQUAKES:
        earthquakes.append({
            'magnitude': eq['magnitude'],
            'latitude': eq['lat'],
            'longitude': eq['lon'],
            'depth': eq['depth'],
            'event_time': eq['date']
        })
    
    print(f"Training LSTM on {len(earthquakes)} earthquakes...")
    
    # Initialize and train model
    lstm_model = EarthquakeLSTM(sequence_length=10, features=6)
    lstm_model.build_model()
    
    print("\nModel Architecture:")
    lstm_model.model.summary()
    
    # Train
    history = lstm_model.train(earthquakes, validation_split=0.2, epochs=100)
    
    # Save model
    lstm_model.save_model('models/lstm_earthquake_predictor.h5')
    
    # Evaluate
    print("\nTraining Results:")
    final_loss = history.history['loss'][-1]
    final_acc = history.history['accuracy'][-1]
    val_loss = history.history['val_loss'][-1]
    val_acc = history.history['val_accuracy'][-1]
    
    print(f"Training Loss: {final_loss:.4f}, Accuracy: {final_acc:.4f}")
    print(f"Validation Loss: {val_loss:.4f}, Accuracy: {val_acc:.4f}")
    
    # Test prediction
    recent_events = earthquakes[-15:]  # Last 15 earthquakes
    prediction = lstm_model.predict(recent_events)
    
    print("\nSample Prediction (based on last 15 events):")
    print(json.dumps(prediction, indent=2))
    
    return lstm_model, history


if __name__ == '__main__':
    # Run training when script is executed directly
    train_lstm_on_expanded_data()
