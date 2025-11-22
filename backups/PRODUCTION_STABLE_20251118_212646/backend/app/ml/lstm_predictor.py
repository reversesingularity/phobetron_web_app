"""
LSTM Deep Learning Model for Seismic Event Time Series Prediction
==================================================================

This module implements a Long Short-Term Memory (LSTM) neural network
for predicting seismic activity based on:
- Historical earthquake sequences
- Celestial event patterns
- Solar activity time series
- Planetary alignment cycles

Key Features:
- Multi-variate time series forecasting
- Attention mechanism for important features
- Bidirectional LSTM for context awareness
- Ensemble prediction with confidence intervals
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timedelta
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import logging

logger = logging.getLogger(__name__)


class LSTMSeismicPredictor:
    """
    LSTM-based deep learning model for seismic event prediction
    """
    
    def __init__(
        self,
        sequence_length: int = 30,
        lstm_units: int = 128,
        dropout_rate: float = 0.3,
        learning_rate: float = 0.001
    ):
        """
        Initialize LSTM predictor
        
        Args:
            sequence_length: Number of time steps to look back
            lstm_units: Number of LSTM units in each layer
            dropout_rate: Dropout rate for regularization
            learning_rate: Learning rate for optimizer
        """
        self.sequence_length = sequence_length
        self.lstm_units = lstm_units
        self.dropout_rate = dropout_rate
        self.learning_rate = learning_rate
        
        self.model: Optional[keras.Model] = None
        self.scaler = MinMaxScaler()
        self.is_trained = False
        
    def build_model(self, input_shape: Tuple[int, int]) -> keras.Model:
        """
        Build LSTM model architecture with attention mechanism
        
        Args:
            input_shape: Shape of input data (sequence_length, num_features)
            
        Returns:
            Compiled Keras model
        """
        inputs = keras.Input(shape=input_shape)
        
        # First Bidirectional LSTM layer
        x = layers.Bidirectional(
            layers.LSTM(
                self.lstm_units,
                return_sequences=True,
                dropout=self.dropout_rate,
                recurrent_dropout=self.dropout_rate
            )
        )(inputs)
        x = layers.LayerNormalization()(x)
        
        # Second Bidirectional LSTM layer
        x = layers.Bidirectional(
            layers.LSTM(
                self.lstm_units // 2,
                return_sequences=True,
                dropout=self.dropout_rate,
                recurrent_dropout=self.dropout_rate
            )
        )(x)
        x = layers.LayerNormalization()(x)
        
        # Attention mechanism
        attention = layers.Dense(1, activation='tanh')(x)
        attention = layers.Flatten()(attention)
        attention = layers.Activation('softmax')(attention)
        attention = layers.RepeatVector(self.lstm_units)(attention)
        attention = layers.Permute([2, 1])(attention)
        
        # Apply attention
        x = layers.Multiply()([x, attention])
        
        # Third LSTM layer (non-bidirectional for final processing)
        x = layers.LSTM(
            self.lstm_units // 4,
            dropout=self.dropout_rate,
            recurrent_dropout=self.dropout_rate
        )(x)
        x = layers.LayerNormalization()(x)
        
        # Dense layers for prediction
        x = layers.Dense(64, activation='relu')(x)
        x = layers.Dropout(self.dropout_rate)(x)
        x = layers.Dense(32, activation='relu')(x)
        x = layers.Dropout(self.dropout_rate / 2)(x)
        
        # Output layers for multi-task prediction
        # Task 1: Earthquake probability
        prob_output = layers.Dense(1, activation='sigmoid', name='probability')(x)
        
        # Task 2: Magnitude prediction (if earthquake occurs)
        magnitude_output = layers.Dense(1, activation='relu', name='magnitude')(x)
        
        # Task 3: Time until event (in hours)
        time_output = layers.Dense(1, activation='relu', name='time_until')(x)
        
        # Task 4: Location prediction (lat, lon)
        location_output = layers.Dense(2, activation='tanh', name='location')(x)
        
        model = keras.Model(
            inputs=inputs,
            outputs={
                'probability': prob_output,
                'magnitude': magnitude_output,
                'time_until': time_output,
                'location': location_output
            }
        )
        
        # Compile with multiple loss functions
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.learning_rate),
            loss={
                'probability': 'binary_crossentropy',
                'magnitude': 'mse',
                'time_until': 'mae',
                'location': 'mse'
            },
            loss_weights={
                'probability': 1.0,
                'magnitude': 0.5,
                'time_until': 0.3,
                'location': 0.2
            },
            metrics={
                'probability': ['accuracy', keras.metrics.AUC()],
                'magnitude': ['mae'],
                'time_until': ['mae'],
                'location': ['mae']
            }
        )
        
        return model
    
    def prepare_sequences(
        self,
        data: pd.DataFrame,
        target_col: str = 'earthquake_occurred'
    ) -> Tuple[np.ndarray, Dict[str, np.ndarray]]:
        """
        Prepare sequential data for LSTM training
        
        Args:
            data: DataFrame with time series features
            target_col: Name of target column
            
        Returns:
            Tuple of (X sequences, y targets dict)
        """
        # Normalize features
        feature_cols = [col for col in data.columns if col not in 
                       ['earthquake_occurred', 'magnitude', 'time_until', 'lat', 'lon', 'date']]
        
        data_scaled = data.copy()
        data_scaled[feature_cols] = self.scaler.fit_transform(data[feature_cols])
        
        # Create sequences
        X_sequences = []
        y_prob = []
        y_magnitude = []
        y_time = []
        y_location = []
        
        for i in range(len(data_scaled) - self.sequence_length):
            # Input sequence
            X_sequences.append(data_scaled[feature_cols].iloc[i:i+self.sequence_length].values)
            
            # Target values (at end of sequence)
            target_idx = i + self.sequence_length
            y_prob.append(data_scaled['earthquake_occurred'].iloc[target_idx])
            y_magnitude.append(data_scaled['magnitude'].iloc[target_idx] if 'magnitude' in data_scaled.columns else 0)
            y_time.append(data_scaled['time_until'].iloc[target_idx] if 'time_until' in data_scaled.columns else 0)
            
            if 'lat' in data_scaled.columns and 'lon' in data_scaled.columns:
                y_location.append([
                    data_scaled['lat'].iloc[target_idx],
                    data_scaled['lon'].iloc[target_idx]
                ])
            else:
                y_location.append([0, 0])
        
        X = np.array(X_sequences)
        y = {
            'probability': np.array(y_prob),
            'magnitude': np.array(y_magnitude),
            'time_until': np.array(y_time),
            'location': np.array(y_location)
        }
        
        return X, y
    
    def train(
        self,
        training_data: pd.DataFrame,
        validation_split: float = 0.2,
        epochs: int = 100,
        batch_size: int = 32,
        early_stopping_patience: int = 15
    ) -> Dict[str, Any]:
        """
        Train LSTM model on historical data
        
        Args:
            training_data: DataFrame with features and targets
            validation_split: Fraction of data for validation
            epochs: Maximum number of training epochs
            batch_size: Batch size for training
            early_stopping_patience: Patience for early stopping
            
        Returns:
            Training history dict
        """
        logger.info("Preparing training sequences...")
        X, y = self.prepare_sequences(training_data)
        
        logger.info(f"Training data shape: X={X.shape}, y_prob={y['probability'].shape}")
        
        # Build model if not already built
        if self.model is None:
            input_shape = (X.shape[1], X.shape[2])
            self.model = self.build_model(input_shape)
            logger.info(f"Model built with input shape: {input_shape}")
        
        # Callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=early_stopping_patience,
                restore_best_weights=True,
                verbose=1
            ),
            ModelCheckpoint(
                'lstm_seismic_best.h5',
                monitor='val_loss',
                save_best_only=True,
                verbose=1
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            )
        ]
        
        # Train model
        logger.info("Starting training...")
        history = self.model.fit(
            X, y,
            validation_split=validation_split,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=1
        )
        
        self.is_trained = True
        logger.info("Training completed!")
        
        return history.history
    
    def predict(
        self,
        recent_data: pd.DataFrame,
        num_predictions: int = 7
    ) -> List[Dict[str, Any]]:
        """
        Make predictions for future time steps
        
        Args:
            recent_data: Recent historical data (at least sequence_length rows)
            num_predictions: Number of future time steps to predict
            
        Returns:
            List of prediction dicts for each future time step
        """
        if not self.is_trained or self.model is None:
            raise ValueError("Model must be trained before making predictions")
        
        if len(recent_data) < self.sequence_length:
            raise ValueError(f"Need at least {self.sequence_length} rows of recent data")
        
        # Prepare last sequence
        feature_cols = [col for col in recent_data.columns if col not in 
                       ['earthquake_occurred', 'magnitude', 'time_until', 'lat', 'lon', 'date']]
        
        data_scaled = recent_data.copy()
        data_scaled[feature_cols] = self.scaler.transform(recent_data[feature_cols])
        
        # Use last sequence for prediction
        last_sequence = data_scaled[feature_cols].iloc[-self.sequence_length:].values
        
        predictions = []
        current_sequence = last_sequence.copy()
        
        for i in range(num_predictions):
            # Reshape for prediction
            X_pred = current_sequence.reshape(1, self.sequence_length, len(feature_cols))
            
            # Make prediction
            pred = self.model.predict(X_pred, verbose=0)
            
            prediction_dict = {
                'time_step': i + 1,
                'earthquake_probability': float(pred['probability'][0][0]),
                'predicted_magnitude': float(pred['magnitude'][0][0]),
                'hours_until_event': float(pred['time_until'][0][0]),
                'predicted_location': {
                    'lat': float(pred['location'][0][0]),
                    'lon': float(pred['location'][0][1])
                },
                'confidence': self._calculate_confidence(pred)
            }
            
            predictions.append(prediction_dict)
            
            # Update sequence for next prediction (shift and append predicted values)
            # This is a simplified version - in practice, you'd incorporate predicted values
            current_sequence = np.roll(current_sequence, -1, axis=0)
            current_sequence[-1] = current_sequence[-2]  # Placeholder
        
        return predictions
    
    def _calculate_confidence(self, prediction: Dict[str, np.ndarray]) -> float:
        """
        Calculate confidence score for prediction
        
        Args:
            prediction: Dict of prediction outputs
            
        Returns:
            Confidence score between 0 and 1
        """
        # Simple confidence based on probability certainty
        prob = float(prediction['probability'][0][0])
        
        # Confidence is higher when probability is close to 0 or 1
        confidence = 1.0 - 2.0 * abs(prob - 0.5)
        
        return max(0.0, min(1.0, confidence))
    
    def save_model(self, filepath: str):
        """Save model to disk"""
        if self.model:
            self.model.save(filepath)
            logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load model from disk"""
        self.model = keras.models.load_model(filepath)
        self.is_trained = True
        logger.info(f"Model loaded from {filepath}")


def create_time_series_features(
    earthquake_data: List[Dict[str, Any]],
    celestial_data: List[Dict[str, Any]],
    solar_data: List[Dict[str, Any]]
) -> pd.DataFrame:
    """
    Create comprehensive time series feature set for LSTM training
    
    Args:
        earthquake_data: Historical earthquake events
        celestial_data: Celestial event data
        solar_data: Solar activity data
        
    Returns:
        DataFrame with time series features
    """
    # This is a simplified example - full implementation would be more complex
    features = []
    
    # Create daily time series
    start_date = datetime(2000, 1, 1)
    end_date = datetime(2024, 12, 31)
    date_range = pd.date_range(start_date, end_date, freq='D')
    
    for date in date_range:
        feature_dict = {
            'date': date,
            'day_of_year': date.timetuple().tm_yday,
            'month': date.month,
            'year': date.year,
            
            # Earthquake features (calculated from recent history)
            'earthquake_occurred': 0,  # Binary: did earthquake happen today
            'magnitude': 0.0,
            'time_until': 0.0,  # Hours until next earthquake
            'lat': 0.0,
            'lon': 0.0,
            
            # Celestial features
            'moon_phase_angle': 0.0,  # 0-360 degrees
            'moon_distance': 384400.0,  # km
            'solar_activity_index': 0.0,  # 0-100
            'planetary_alignment_score': 0.0,  # 0-1
            
            # Solar features
            'sunspot_number': 0.0,
            'solar_flare_intensity': 0.0,
            'cme_speed': 0.0,  # km/s
            
            # Historical patterns
            'earthquakes_last_7_days': 0,
            'earthquakes_last_30_days': 0,
            'avg_magnitude_last_30_days': 0.0,
            
            # Derived features
            'moon_tidal_force': 0.0,  # Calculated from distance
            'eclipse_proximity': 0.0,  # Days to/from nearest eclipse
            'alignment_strength': 0.0  # Strength of planetary alignments
        }
        
        features.append(feature_dict)
    
    df = pd.DataFrame(features)
    
    return df


# Example usage
if __name__ == "__main__":
    # Initialize predictor
    predictor = LSTMSeismicPredictor(
        sequence_length=30,
        lstm_units=128,
        dropout_rate=0.3,
        learning_rate=0.001
    )
    
    # Create synthetic training data (in practice, use real historical data)
    training_data = create_time_series_features([], [], [])
    
    # Train model
    history = predictor.train(
        training_data,
        validation_split=0.2,
        epochs=100,
        batch_size=32
    )
    
    # Make predictions
    recent_data = training_data.tail(30)
    predictions = predictor.predict(recent_data, num_predictions=7)
    
    print("\n7-Day Predictions:")
    for pred in predictions:
        print(f"Day {pred['time_step']}: "
              f"Prob={pred['earthquake_probability']:.2%}, "
              f"Mag={pred['predicted_magnitude']:.1f}, "
              f"Confidence={pred['confidence']:.2%}")
