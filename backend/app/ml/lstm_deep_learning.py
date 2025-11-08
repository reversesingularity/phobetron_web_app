"""
LSTM Deep Learning Model for Time Series Prophecy Prediction
Uses TensorFlow/Keras for sequential pattern recognition in celestial-terrestrial correlations.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timedelta
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models, callbacks
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import joblib
import os

class ProphecyLSTMModel:
    """
    LSTM-based deep learning model for time series prediction of prophecy fulfillment.
    
    Architecture:
    - Input Layer: Sequential time series data (window_size timesteps)
    - LSTM Layer 1: 128 units with return sequences
    - Dropout: 0.3 (prevents overfitting)
    - LSTM Layer 2: 64 units
    - Dropout: 0.2
    - Dense Layer 1: 32 units with ReLU activation
    - Output Layer: 1 unit (probability score)
    """
    
    def __init__(
        self,
        window_size: int = 30,
        features: int = 8,
        lstm_units_1: int = 128,
        lstm_units_2: int = 64,
        dense_units: int = 32,
        dropout_rate_1: float = 0.3,
        dropout_rate_2: float = 0.2,
        learning_rate: float = 0.001
    ):
        """
        Initialize LSTM model with configurable hyperparameters.
        
        Args:
            window_size: Number of timesteps to look back
            features: Number of input features per timestep
            lstm_units_1: Units in first LSTM layer
            lstm_units_2: Units in second LSTM layer
            dense_units: Units in dense layer
            dropout_rate_1: Dropout rate after first LSTM
            dropout_rate_2: Dropout rate after second LSTM
            learning_rate: Optimizer learning rate
        """
        self.window_size = window_size
        self.features = features
        self.lstm_units_1 = lstm_units_1
        self.lstm_units_2 = lstm_units_2
        self.dense_units = dense_units
        self.dropout_rate_1 = dropout_rate_1
        self.dropout_rate_2 = dropout_rate_2
        self.learning_rate = learning_rate
        
        self.model: Optional[keras.Model] = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.history: Optional[keras.callbacks.History] = None
        self.is_trained = False
        
    def build_model(self) -> keras.Model:
        """
        Build LSTM neural network architecture.
        
        Returns:
            Compiled Keras model
        """
        model = models.Sequential([
            # Input layer
            layers.Input(shape=(self.window_size, self.features)),
            
            # First LSTM layer with return sequences
            layers.LSTM(
                units=self.lstm_units_1,
                return_sequences=True,
                activation='tanh',
                recurrent_activation='sigmoid',
                kernel_initializer='glorot_uniform',
                name='lstm_layer_1'
            ),
            layers.Dropout(self.dropout_rate_1, name='dropout_1'),
            
            # Second LSTM layer
            layers.LSTM(
                units=self.lstm_units_2,
                return_sequences=False,
                activation='tanh',
                recurrent_activation='sigmoid',
                kernel_initializer='glorot_uniform',
                name='lstm_layer_2'
            ),
            layers.Dropout(self.dropout_rate_2, name='dropout_2'),
            
            # Dense layers
            layers.Dense(
                units=self.dense_units,
                activation='relu',
                kernel_initializer='he_uniform',
                name='dense_layer'
            ),
            
            # Output layer (probability score)
            layers.Dense(
                units=1,
                activation='sigmoid',
                name='output_layer'
            )
        ])
        
        # Compile model
        optimizer = keras.optimizers.Adam(learning_rate=self.learning_rate)
        model.compile(
            optimizer=optimizer,
            loss='binary_crossentropy',  # For probability prediction
            metrics=[
                'accuracy',
                keras.metrics.AUC(name='auc'),
                keras.metrics.Precision(name='precision'),
                keras.metrics.Recall(name='recall')
            ]
        )
        
        self.model = model
        return model
    
    def prepare_sequences(
        self,
        data: np.ndarray,
        labels: Optional[np.ndarray] = None
    ) -> Tuple[np.ndarray, Optional[np.ndarray]]:
        """
        Prepare time series sequences for LSTM input.
        
        Args:
            data: Input data array (samples, features)
            labels: Target labels (optional)
            
        Returns:
            Tuple of (sequences, sequence_labels)
        """
        sequences = []
        sequence_labels = []
        
        for i in range(len(data) - self.window_size):
            # Extract window of data
            sequence = data[i:i + self.window_size]
            sequences.append(sequence)
            
            # Get corresponding label if provided
            if labels is not None:
                sequence_labels.append(labels[i + self.window_size])
        
        sequences = np.array(sequences)
        sequence_labels = np.array(sequence_labels) if labels is not None else None
        
        return sequences, sequence_labels
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
        epochs: int = 100,
        batch_size: int = 32,
        verbose: int = 1
    ) -> keras.callbacks.History:
        """
        Train LSTM model on time series data.
        
        Args:
            X_train: Training features (samples, timesteps, features)
            y_train: Training labels
            X_val: Validation features (optional)
            y_val: Validation labels (optional)
            epochs: Number of training epochs
            batch_size: Batch size for training
            verbose: Verbosity level (0=silent, 1=progress bar, 2=one line per epoch)
            
        Returns:
            Training history
        """
        if self.model is None:
            self.build_model()
        
        # Prepare validation data
        validation_data = None
        if X_val is not None and y_val is not None:
            validation_data = (X_val, y_val)
        
        # Setup callbacks
        callback_list = [
            # Early stopping to prevent overfitting
            callbacks.EarlyStopping(
                monitor='val_loss' if validation_data else 'loss',
                patience=15,
                restore_best_weights=True,
                verbose=verbose
            ),
            
            # Reduce learning rate on plateau
            callbacks.ReduceLROnPlateau(
                monitor='val_loss' if validation_data else 'loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=verbose
            ),
            
            # Model checkpoint
            callbacks.ModelCheckpoint(
                filepath='best_lstm_model.h5',
                monitor='val_loss' if validation_data else 'loss',
                save_best_only=True,
                verbose=0
            )
        ]
        
        # Train model
        self.history = self.model.fit(
            X_train,
            y_train,
            validation_data=validation_data,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callback_list,
            verbose=verbose
        )
        
        self.is_trained = True
        return self.history
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Make predictions on new data.
        
        Args:
            X: Input features (samples, timesteps, features)
            
        Returns:
            Predicted probabilities
        """
        if self.model is None:
            raise ValueError("Model not built. Call build_model() first.")
        
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        predictions = self.model.predict(X)
        return predictions
    
    def evaluate(
        self,
        X_test: np.ndarray,
        y_test: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluate model performance on test data.
        
        Args:
            X_test: Test features
            y_test: Test labels
            
        Returns:
            Dictionary of evaluation metrics
        """
        if self.model is None or not self.is_trained:
            raise ValueError("Model must be built and trained before evaluation.")
        
        # Get predictions
        y_pred = self.predict(X_test)
        y_pred_binary = (y_pred > 0.5).astype(int)
        
        # Calculate metrics
        from sklearn.metrics import (
            accuracy_score,
            precision_score,
            recall_score,
            f1_score,
            roc_auc_score,
            confusion_matrix
        )
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred_binary),
            'precision': precision_score(y_test, y_pred_binary),
            'recall': recall_score(y_test, y_pred_binary),
            'f1_score': f1_score(y_test, y_pred_binary),
            'roc_auc': roc_auc_score(y_test, y_pred),
            'confusion_matrix': confusion_matrix(y_test, y_pred_binary).tolist()
        }
        
        return metrics
    
    def save_model(self, filepath: str = 'lstm_prophecy_model'):
        """
        Save trained model and scaler to disk.
        
        Args:
            filepath: Base filepath for saving model files
        """
        if self.model is None:
            raise ValueError("No model to save. Build model first.")
        
        # Save model
        self.model.save(f"{filepath}.h5")
        
        # Save scaler
        joblib.dump(self.scaler, f"{filepath}_scaler.pkl")
        
        # Save config
        config = {
            'window_size': self.window_size,
            'features': self.features,
            'lstm_units_1': self.lstm_units_1,
            'lstm_units_2': self.lstm_units_2,
            'dense_units': self.dense_units,
            'dropout_rate_1': self.dropout_rate_1,
            'dropout_rate_2': self.dropout_rate_2,
            'learning_rate': self.learning_rate,
            'is_trained': self.is_trained
        }
        joblib.dump(config, f"{filepath}_config.pkl")
        
        print(f"Model saved to {filepath}.h5")
    
    def load_model(self, filepath: str = 'lstm_prophecy_model'):
        """
        Load trained model and scaler from disk.
        
        Args:
            filepath: Base filepath for loading model files
        """
        # Load model
        self.model = keras.models.load_model(f"{filepath}.h5")
        
        # Load scaler
        self.scaler = joblib.load(f"{filepath}_scaler.pkl")
        
        # Load config
        config = joblib.load(f"{filepath}_config.pkl")
        self.window_size = config['window_size']
        self.features = config['features']
        self.lstm_units_1 = config['lstm_units_1']
        self.lstm_units_2 = config['lstm_units_2']
        self.dense_units = config['dense_units']
        self.dropout_rate_1 = config['dropout_rate_1']
        self.dropout_rate_2 = config['dropout_rate_2']
        self.learning_rate = config['learning_rate']
        self.is_trained = config['is_trained']
        
        print(f"Model loaded from {filepath}.h5")
    
    def get_model_summary(self) -> str:
        """
        Get string representation of model architecture.
        
        Returns:
            Model summary string
        """
        if self.model is None:
            return "Model not built yet."
        
        summary_lines = []
        self.model.summary(print_fn=lambda x: summary_lines.append(x))
        return '\n'.join(summary_lines)


class ProphecyTimeSeriesPredictor:
    """
    High-level interface for prophecy prediction using LSTM.
    Handles data preprocessing, feature engineering, and prediction.
    """
    
    def __init__(self, window_size: int = 30):
        """
        Initialize predictor with LSTM model.
        
        Args:
            window_size: Number of days to look back for predictions
        """
        self.window_size = window_size
        self.lstm_model = ProphecyLSTMModel(
            window_size=window_size,
            features=8,  # Number of features per timestep
            lstm_units_1=128,
            lstm_units_2=64,
            dense_units=32
        )
        
    def preprocess_data(
        self,
        events: List[Dict[str, Any]]
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Preprocess historical events into time series format.
        
        Args:
            events: List of event dictionaries
            
        Returns:
            Tuple of (features, labels)
        """
        # Sort events by date
        events_sorted = sorted(events, key=lambda x: x.get('date', datetime.now()))
        
        # Extract features
        features = []
        labels = []
        
        for event in events_sorted:
            feature_vector = [
                event.get('magnitude', 5.0),
                len(event.get('celestial_phenomena', [])),
                event.get('impact_score', 0.5),
                np.log10(event.get('casualties', 0) + 1),
                1 if event.get('biblical_reference') else 0,
                event.get('date').month if event.get('date') else 0,
                event.get('date').timetuple().tm_yday if event.get('date') else 0,
                1 if 'earthquake' in event.get('event_type', '') else 0
            ]
            features.append(feature_vector)
            labels.append(1 if event.get('impact_score', 0) > 0.7 else 0)
        
        return np.array(features), np.array(labels)
    
    def train_model(
        self,
        events: List[Dict[str, Any]],
        test_size: float = 0.2,
        validation_size: float = 0.1,
        epochs: int = 100,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """
        Train LSTM model on historical events.
        
        Args:
            events: List of event dictionaries
            test_size: Fraction of data for testing
            validation_size: Fraction of data for validation
            epochs: Number of training epochs
            batch_size: Batch size for training
            
        Returns:
            Dictionary containing training results and metrics
        """
        # Preprocess data
        features, labels = self.preprocess_data(events)
        
        # Normalize features
        features_scaled = self.lstm_model.scaler.fit_transform(features)
        
        # Prepare sequences
        X, y = self.lstm_model.prepare_sequences(features_scaled, labels)
        
        # Split data
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=(test_size + validation_size), random_state=42, shuffle=False
        )
        
        val_test_split = validation_size / (test_size + validation_size)
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=(1 - val_test_split), random_state=42, shuffle=False
        )
        
        # Train model
        print(f"Training LSTM model on {len(X_train)} sequences...")
        history = self.lstm_model.train(
            X_train, y_train,
            X_val, y_val,
            epochs=epochs,
            batch_size=batch_size
        )
        
        # Evaluate model
        print("\nEvaluating model on test set...")
        metrics = self.lstm_model.evaluate(X_test, y_test)
        
        return {
            'history': history.history,
            'metrics': metrics,
            'train_samples': len(X_train),
            'val_samples': len(X_val),
            'test_samples': len(X_test)
        }
    
    def predict_future(
        self,
        recent_events: List[Dict[str, Any]],
        days_ahead: int = 30
    ) -> Dict[str, Any]:
        """
        Predict probability of significant events in near future.
        
        Args:
            recent_events: Recent historical events (at least window_size events)
            days_ahead: Number of days to predict ahead
            
        Returns:
            Dictionary containing prediction results
        """
        if len(recent_events) < self.window_size:
            raise ValueError(f"Need at least {self.window_size} recent events for prediction")
        
        # Preprocess recent events
        features, _ = self.preprocess_data(recent_events[-self.window_size:])
        features_scaled = self.lstm_model.scaler.transform(features)
        
        # Reshape for LSTM input
        X = features_scaled.reshape(1, self.window_size, -1)
        
        # Make prediction
        prediction = self.lstm_model.predict(X)[0][0]
        
        return {
            'probability': float(prediction),
            'confidence': 'high' if prediction > 0.7 or prediction < 0.3 else 'medium',
            'risk_level': 'high' if prediction > 0.7 else 'medium' if prediction > 0.4 else 'low',
            'days_ahead': days_ahead,
            'predicted_date': (datetime.now() + timedelta(days=days_ahead)).isoformat()
        }
    
    def save(self, filepath: str = 'prophecy_lstm_predictor'):
        """Save trained model."""
        self.lstm_model.save_model(filepath)
    
    def load(self, filepath: str = 'prophecy_lstm_predictor'):
        """Load trained model."""
        self.lstm_model.load_model(filepath)


# Example usage and testing
if __name__ == "__main__":
    print("Celestial Signs LSTM Deep Learning Module")
    print("=" * 60)
    
    # Initialize predictor
    predictor = ProphecyTimeSeriesPredictor(window_size=30)
    
    # Build model
    predictor.lstm_model.build_model()
    print("\nModel Architecture:")
    print(predictor.lstm_model.get_model_summary())
    
    print("\n" + "=" * 60)
    print("LSTM Model ready for training on expanded dataset (100+ events)")
    print("Features: Magnitude, Celestial Phenomena Count, Impact Score,")
    print("          Log Casualties, Biblical Reference, Date Features")
    print("=" * 60)
