"""
LSTM Deep Learning Time Series Forecaster
=========================================

Advanced LSTM (Long Short-Term Memory) neural network for predicting
seismic activity based on temporal patterns in celestial-seismic correlations.

Features:
- Bidirectional LSTM layers for temporal pattern recognition
- Attention mechanism for important feature weighting
- Multi-step ahead forecasting (7, 14, 30 days)
- Confidence intervals using Monte Carlo dropout
- Feature engineering from celestial data
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
import logging

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, Model
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    logging.warning("TensorFlow not installed. LSTM forecasting disabled.")

from .training_data_expanded import TRAINING_DATA_EXPANDED

logger = logging.getLogger(__name__)


class LSTMSeismicForecaster:
    """
    LSTM-based forecaster for seismic activity prediction using celestial patterns.
    """
    
    def __init__(
        self,
        sequence_length: int = 30,
        forecast_horizon: int = 7,
        lstm_units: int = 128,
        dropout_rate: float = 0.3
    ):
        """
        Initialize LSTM forecaster.
        
        Args:
            sequence_length: Number of historical days to use as input
            forecast_horizon: Number of days ahead to predict
            lstm_units: Number of LSTM units in each layer
            dropout_rate: Dropout rate for regularization
        """
        if not TENSORFLOW_AVAILABLE:
            raise ImportError("TensorFlow is required for LSTM forecasting")
        
        self.sequence_length = sequence_length
        self.forecast_horizon = forecast_horizon
        self.lstm_units = lstm_units
        self.dropout_rate = dropout_rate
        
        self.model: Optional[Model] = None
        self.feature_scaler = None
        self.target_scaler = None
        self.feature_names = []
        
        self._build_model()
    
    def _build_model(self):
        """Build the LSTM architecture with attention mechanism."""
        # Input layer
        inputs = keras.Input(shape=(self.sequence_length, None))  # Variable feature count
        
        # First Bidirectional LSTM layer
        lstm1 = layers.Bidirectional(
            layers.LSTM(
                self.lstm_units,
                return_sequences=True,
                dropout=self.dropout_rate,
                recurrent_dropout=self.dropout_rate
            )
        )(inputs)
        lstm1 = layers.LayerNormalization()(lstm1)
        
        # Second Bidirectional LSTM layer
        lstm2 = layers.Bidirectional(
            layers.LSTM(
                self.lstm_units // 2,
                return_sequences=True,
                dropout=self.dropout_rate,
                recurrent_dropout=self.dropout_rate
            )
        )(lstm1)
        lstm2 = layers.LayerNormalization()(lstm2)
        
        # Attention mechanism
        attention = layers.Attention()([lstm2, lstm2])
        attention = layers.Dropout(self.dropout_rate)(attention)
        
        # Global average pooling
        pooled = layers.GlobalAveragePooling1D()(attention)
        
        # Dense layers with residual connections
        dense1 = layers.Dense(64, activation='relu')(pooled)
        dense1 = layers.Dropout(self.dropout_rate)(dense1)
        dense1 = layers.LayerNormalization()(dense1)
        
        dense2 = layers.Dense(32, activation='relu')(dense1)
        dense2 = layers.Dropout(self.dropout_rate)(dense2)
        
        # Output layer: [probability, magnitude, confidence]
        outputs = layers.Dense(3, activation='sigmoid', name='predictions')(dense2)
        
        # Build model
        self.model = Model(inputs=inputs, outputs=outputs, name='LSTM_Seismic_Forecaster')
        
        # Compile with custom loss
        self.model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss=self._custom_loss,
            metrics=['mae', 'mse']
        )
        
        logger.info(f"LSTM model built: {self.model.count_params()} parameters")
    
    @staticmethod
    def _custom_loss(y_true, y_pred):
        """
        Custom loss function that weights probability, magnitude, and confidence.
        """
        # Split predictions
        prob_true, mag_true, conf_true = tf.split(y_true, 3, axis=-1)
        prob_pred, mag_pred, conf_pred = tf.split(y_pred, 3, axis=-1)
        
        # Probability loss (binary cross-entropy)
        prob_loss = tf.keras.losses.binary_crossentropy(prob_true, prob_pred)
        
        # Magnitude loss (MSE, only when event occurs)
        mag_loss = tf.square(mag_true - mag_pred) * prob_true  # Weight by event probability
        
        # Confidence loss (penalize overconfidence)
        conf_loss = tf.square(conf_true - conf_pred)
        
        # Combined weighted loss
        total_loss = 0.5 * prob_loss + 0.3 * mag_loss + 0.2 * conf_loss
        
        return tf.reduce_mean(total_loss)
    
    def prepare_features(self, events: List[Dict]) -> pd.DataFrame:
        """
        Extract and engineer features from celestial-seismic events.
        
        Args:
            events: List of historical events
            
        Returns:
            DataFrame with engineered features
        """
        features = []
        
        for event in events:
            date = event['date'] if isinstance(event['date'], datetime) else datetime.fromisoformat(str(event['date']))
            
            # Temporal features
            feat = {
                'year': date.year,
                'month': date.month,
                'day': date.day,
                'day_of_year': date.timetuple().tm_yday,
                'day_of_week': date.weekday(),
                
                # Seismic features
                'magnitude': event['earthquake']['magnitude'],
                'depth_km': event['earthquake']['depth_km'],
                'latitude': event['earthquake']['lat'],
                'longitude': event['earthquake']['lon'],
                
                # Celestial features
                'moon_distance_km': event['celestial_context']['moon_distance_km'],
                'solar_activity': self._encode_solar_activity(event['celestial_context']['solar_activity']),
                
                # Derived features
                'correlation_score': event.get('correlation_score', 0.0),
                'has_biblical_ref': 1 if event.get('biblical_reference') else 0,
            }
            
            # Planetary alignment count
            feat['alignment_count'] = len(event['celestial_context'].get('planetary_alignments', []))
            
            # Eclipse proximity (days)
            eclipses = event['celestial_context'].get('eclipses_nearby', [])
            feat['eclipse_proximity_days'] = min([abs((e - date).days) for e in eclipses]) if eclipses else 999
            
            features.append(feat)
        
        df = pd.DataFrame(features)
        self.feature_names = df.columns.tolist()
        
        return df
    
    @staticmethod
    def _encode_solar_activity(activity: str) -> float:
        """Encode solar activity as numeric value."""
        encoding = {
            'Low': 0.2,
            'Moderate': 0.5,
            'High': 0.8,
            'Extreme': 1.0
        }
        return encoding.get(activity, 0.5)
    
    def create_sequences(
        self,
        features: pd.DataFrame,
        targets: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Create sequences for LSTM training.
        
        Args:
            features: Feature DataFrame
            targets: Target array [probability, magnitude, confidence]
            
        Returns:
            Tuple of (X sequences, y targets)
        """
        X, y = [], []
        
        for i in range(len(features) - self.sequence_length - self.forecast_horizon):
            # Input sequence
            X.append(features.iloc[i:i + self.sequence_length].values)
            
            # Target (horizon days ahead)
            y.append(targets[i + self.sequence_length + self.forecast_horizon - 1])
        
        return np.array(X), np.array(y)
    
    def train(
        self,
        events: Optional[List[Dict]] = None,
        epochs: int = 100,
        batch_size: int = 32,
        validation_split: float = 0.2
    ) -> Dict[str, List[float]]:
        """
        Train the LSTM model on historical data.
        
        Args:
            events: Training events (uses TRAINING_DATA_EXPANDED if None)
            epochs: Number of training epochs
            batch_size: Batch size
            validation_split: Validation data fraction
            
        Returns:
            Training history
        """
        if events is None:
            events = TRAINING_DATA_EXPANDED
        
        logger.info(f"Training LSTM on {len(events)} events...")
        
        # Prepare features
        features_df = self.prepare_features(events)
        
        # Normalize features
        from sklearn.preprocessing import StandardScaler
        self.feature_scaler = StandardScaler()
        features_normalized = self.feature_scaler.fit_transform(features_df)
        features_normalized = pd.DataFrame(features_normalized, columns=features_df.columns)
        
        # Create targets: [probability, magnitude, confidence]
        targets = np.array([
            [
                1.0,  # Event occurred (probability)
                event['earthquake']['magnitude'] / 10.0,  # Normalized magnitude
                event.get('correlation_score', 0.5)  # Confidence
            ]
            for event in events
        ])
        
        # Create sequences
        X, y = self.create_sequences(features_normalized, targets)
        
        logger.info(f"Created {len(X)} sequences of shape {X.shape}")
        
        # Callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=15,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-6,
                verbose=1
            ),
            ModelCheckpoint(
                'lstm_seismic_best.h5',
                monitor='val_loss',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Train model
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=callbacks,
            verbose=1
        )
        
        logger.info("Training completed successfully")
        
        return history.history
    
    def predict(
        self,
        recent_events: List[Dict],
        n_simulations: int = 100
    ) -> Dict[str, any]:
        """
        Make predictions with uncertainty quantification using Monte Carlo dropout.
        
        Args:
            recent_events: Recent historical events (last sequence_length events)
            n_simulations: Number of MC dropout simulations
            
        Returns:
            Prediction dict with mean, std, and confidence intervals
        """
        if len(recent_events) < self.sequence_length:
            raise ValueError(f"Need at least {self.sequence_length} recent events")
        
        # Prepare features
        features_df = self.prepare_features(recent_events[-self.sequence_length:])
        features_normalized = self.feature_scaler.transform(features_df)
        
        # Create input sequence
        X = features_normalized.reshape(1, self.sequence_length, -1)
        
        # Monte Carlo dropout for uncertainty
        predictions = []
        for _ in range(n_simulations):
            pred = self.model(X, training=True)  # Keep dropout active
            predictions.append(pred.numpy()[0])
        
        predictions = np.array(predictions)
        
        # Calculate statistics
        mean_pred = np.mean(predictions, axis=0)
        std_pred = np.std(predictions, axis=0)
        
        # 95% confidence intervals
        ci_lower = np.percentile(predictions, 2.5, axis=0)
        ci_upper = np.percentile(predictions, 97.5, axis=0)
        
        return {
            'probability': {
                'mean': float(mean_pred[0]),
                'std': float(std_pred[0]),
                'ci_lower': float(ci_lower[0]),
                'ci_upper': float(ci_upper[0])
            },
            'magnitude': {
                'mean': float(mean_pred[1] * 10.0),  # Denormalize
                'std': float(std_pred[1] * 10.0),
                'ci_lower': float(ci_lower[1] * 10.0),
                'ci_upper': float(ci_upper[1] * 10.0)
            },
            'confidence': {
                'mean': float(mean_pred[2]),
                'std': float(std_pred[2]),
                'ci_lower': float(ci_lower[2]),
                'ci_upper': float(ci_upper[2])
            },
            'forecast_horizon_days': self.forecast_horizon,
            'timestamp': datetime.now().isoformat()
        }
    
    def save_model(self, filepath: str = 'lstm_seismic_model.h5'):
        """Save the trained model."""
        self.model.save(filepath)
        logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str = 'lstm_seismic_model.h5'):
        """Load a trained model."""
        self.model = keras.models.load_model(
            filepath,
            custom_objects={'_custom_loss': self._custom_loss}
        )
        logger.info(f"Model loaded from {filepath}")


def train_and_evaluate_lstm(
    sequence_length: int = 30,
    forecast_horizons: List[int] = [7, 14, 30]
) -> Dict[str, any]:
    """
    Train and evaluate LSTM models for multiple forecast horizons.
    
    Args:
        sequence_length: Historical sequence length
        forecast_horizons: List of forecast horizons to train
        
    Returns:
        Evaluation results for each horizon
    """
    results = {}
    
    for horizon in forecast_horizons:
        logger.info(f"\n{'='*60}")
        logger.info(f"Training LSTM for {horizon}-day forecast horizon")
        logger.info(f"{'='*60}\n")
        
        forecaster = LSTMSeismicForecaster(
            sequence_length=sequence_length,
            forecast_horizon=horizon,
            lstm_units=128,
            dropout_rate=0.3
        )
        
        # Train
        history = forecaster.train(epochs=50, batch_size=16)
        
        # Save model
        forecaster.save_model(f'lstm_seismic_{horizon}day.h5')
        
        results[f'{horizon}_day'] = {
            'final_loss': history['loss'][-1],
            'final_val_loss': history['val_loss'][-1],
            'best_val_loss': min(history['val_loss']),
            'model_path': f'lstm_seismic_{horizon}day.h5'
        }
    
    return results


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Train models for different horizons
    if TENSORFLOW_AVAILABLE:
        results = train_and_evaluate_lstm(
            sequence_length=30,
            forecast_horizons=[7, 14, 30]
        )
        
        print("\n" + "="*60)
        print("LSTM Training Results")
        print("="*60)
        for horizon, metrics in results.items():
            print(f"\n{horizon} Forecast:")
            for metric, value in metrics.items():
                print(f"  {metric}: {value}")
    else:
        print("TensorFlow not installed. Please install: pip install tensorflow")
