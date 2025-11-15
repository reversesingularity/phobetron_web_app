"""
ML Model Loader
Loads trained .h5 and .pkl models into memory on FastAPI startup
"""

import pickle
import json
from pathlib import Path
from typing import Dict, Any, Optional
import tensorflow as tf
import logging

logger = logging.getLogger(__name__)

# Global model storage
LOADED_MODELS: Dict[str, Any] = {}

MODEL_DIR = Path(__file__).parent.parent / "ml" / "models"


class ModelLoader:
    """Manages loading and caching of ML models"""
    
    def __init__(self):
        self.models = {}
        self.metadata = {}
    
    def load_all_models(self):
        """Load all trained models into memory"""
        
        logger.info("🚀 Loading ML models into memory...")
        
        try:
            # Load LSTM Seismic Forecaster (TensorFlow) - with error handling
            lstm_path = MODEL_DIR / "lstm_forecaster.h5"
            if lstm_path.exists():
                try:
                    # Try loading with compile=False to avoid metric issues
                    self.models["lstm_forecaster"] = tf.keras.models.load_model(str(lstm_path), compile=False)
                    logger.info("Loaded LSTM Seismic Forecaster (inference mode)")
                except Exception as e:
                    logger.warning(f"LSTM model load failed (will use fallback): {str(e)[:100]}")
                    # Use metadata-only fallback
                    self.models["lstm_forecaster"] = None
            else:
                logger.warning(f"LSTM model not found at {lstm_path}")
            
            # Load scikit-learn models
            sklearn_models = {
                "lstm_predictor": "lstm_predictor.pkl",
                "neo_predictor": "neo_predictor.pkl",
                "neo_collision_gb": "neo_collision_gb.pkl",
                "neo_distance_rf": "neo_distance_rf.pkl",
                "anomaly_predictor": "anomaly_predictor.pkl",
                "watchman_severity": "watchman_severity_classifier.pkl",
                "watchman_significance": "watchman_significance_classifier.pkl"
            }
            
            # Load pattern detection trained models
            trained_models_dir = Path(__file__).parent / "trained_models"
            print(f"Pattern models directory: {trained_models_dir}", flush=True)
            print(f"Directory exists: {trained_models_dir.exists()}", flush=True)
            pattern_models = {
                "isolation_forest": "isolation_forest.pkl",
                "isolation_forest_scaler": "isolation_forest_scaler.pkl",
                "correlation_matrices": "correlation_matrices.pkl",
                "statistical_tests": "statistical_tests.pkl",
                "seasonal_patterns": "seasonal_patterns.pkl",
                "training_summary": "training_summary.pkl"
            }
            
            for model_name, filename in pattern_models.items():
                model_path = trained_models_dir / filename
                print(f"Checking {model_name} at {model_path}", flush=True)
                if model_path.exists():
                    try:
                        with open(model_path, "rb") as f:
                            self.models[model_name] = pickle.load(f)
                        print(f"SUCCESS: Loaded {model_name} (pattern detection)", flush=True)
                        logger.info(f"Loaded {model_name} (pattern detection)")
                    except Exception as e:
                        print(f"WARNING: {model_name} load failed: {str(e)[:100]}", flush=True)
                        logger.warning(f"{model_name} load failed: {str(e)[:100]}")
                else:
                    print(f"WARNING: {model_name} not found at {model_path}", flush=True)
                    logger.warning(f"{model_name} not found at {model_path}")
            
            for model_name, filename in sklearn_models.items():
                model_path = MODEL_DIR / filename
                if model_path.exists():
                    try:
                        with open(model_path, "rb") as f:
                            self.models[model_name] = pickle.load(f)
                        logger.info(f"Loaded {model_name}")
                    except Exception as e:
                        logger.warning(f"{model_name} load failed: {str(e)[:100]}")
                else:
                    logger.warning(f"{model_name} not found at {model_path}")
            
            # Load metadata
            metadata_files = [
                "lstm_metadata.json",
                "neo_metadata.json",
                "training_report.json"
            ]
            
            for metadata_file in metadata_files:
                meta_path = MODEL_DIR / metadata_file
                if meta_path.exists():
                    try:
                        with open(meta_path, "r") as f:
                            self.metadata[metadata_file.replace(".json", "")] = json.load(f)
                    except Exception as e:
                        logger.warning(f"Metadata {metadata_file} load failed: {str(e)[:100]}")
            
            logger.info(f"Loaded {len(self.models)} models and {len(self.metadata)} metadata files")
            logger.info(f"Models available: {list(self.models.keys())}")
            
            # Store in global cache (update in place to preserve module-level reference)
            global LOADED_MODELS
            LOADED_MODELS.clear()
            LOADED_MODELS.update(self.models)
            
        except Exception as e:
            logger.error(f"ERROR: Error loading models: {str(e)}")
            # Don't raise - allow API to start even if models fail
            logger.warning("WARNING: API will start with limited ML functionality")
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get a loaded model by name"""
        return self.models.get(model_name)
    
    def get_metadata(self, metadata_name: str) -> Optional[Dict]:
        """Get metadata by name"""
        return self.metadata.get(metadata_name)


# Global model loader instance
model_loader = ModelLoader()


def get_model(model_name: str) -> Optional[Any]:
    """Get a loaded model (convenience function)"""
    return LOADED_MODELS.get(model_name)
