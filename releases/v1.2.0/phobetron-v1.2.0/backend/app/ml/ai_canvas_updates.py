"""
AI-Powered Canvas Update Service
=================================

Provides intelligent updates to the 3D solar system canvas with:
- Real-time NEO (Near-Earth Object) tracking
- Interstellar object trajectory updates
- Solar flare activity visualization
- Planetary conjunction detection and display
- AI-driven anomaly detection and highlighting
"""

import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import asyncio
import aiohttp
import json
from pathlib import Path
import logging
import pickle
from .train_models_simple import SimplePredictor

logger = logging.getLogger(__name__)

@dataclass
class CanvasUpdate:
    """Represents an update to the canvas"""
    update_type: str  # 'neo', 'interstellar', 'solar_flare', 'conjunction', 'anomaly'
    object_id: str
    position: Tuple[float, float, float]  # AU coordinates
    velocity: Optional[Tuple[float, float, float]] = None
    metadata: Dict[str, Any] = None
    priority: int = 1  # 1=low, 2=medium, 3=high, 4=critical
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()

@dataclass
class SolarFlareEvent:
    """Solar flare event data"""
    flare_id: str
    classification: str  # A, B, C, M, X + number
    intensity: float
    location: Tuple[float, float]  # Solar coordinates (longitude, latitude)
    timestamp: datetime
    earth_impact: bool
    expected_arrival: Optional[datetime] = None

@dataclass
class PlanetaryConjunction:
    """Planetary conjunction data"""
    conjunction_id: str
    planets: List[str]
    separation: float  # degrees
    timestamp: datetime
    visibility: str  # 'visible', 'difficult', 'impossible'
    significance: str  # 'minor', 'moderate', 'major', 'rare'

class AICanvasUpdateService:
    """
    AI-powered service for intelligent canvas updates
    """

    def __init__(self):
        self.nasa_api_key = "DEMO_KEY"  # Should be configurable
        self.update_queue: List[CanvasUpdate] = []
        self.active_alerts: Dict[str, CanvasUpdate] = {}
        self.last_update = datetime.now()

        # AI model paths
        self.models_dir = Path(__file__).parent / "models"
        self.neo_predictor = None
        self.anomaly_detector = None

        # External data sources
        self.data_sources = {
            "neo": "https://api.nasa.gov/neo/rest/v1/feed",
            "solar_flares": "https://api.nasa.gov/DONKI/FLR",
            "planetary_positions": "https://api.nasa.gov/planetary/apod"  # Placeholder
        }

    async def initialize_ai_models(self):
        """Load AI models for intelligent updates"""
        try:
            # Load NEO trajectory predictor
            neo_model_path = self.models_dir / "neo_predictor.pkl"
            if neo_model_path.exists():
                try:
                    with open(neo_model_path, 'rb') as f:
                        self.neo_predictor = pickle.load(f)
                    logger.info("NEO predictor model loaded")
                except Exception as e:
                    logger.warning(f"Failed to load NEO predictor: {e}. Using fallback.")
                    self.neo_predictor = None

            # Load anomaly detector
            anomaly_model_path = self.models_dir / "anomaly_detector.pkl"
            if anomaly_model_path.exists():
                try:
                    with open(anomaly_model_path, 'rb') as f:
                        self.anomaly_detector = pickle.load(f)
                    logger.info("Anomaly detector model loaded")
                except Exception as e:
                    logger.warning(f"Failed to load anomaly detector: {e}. Using fallback.")
                    self.anomaly_detector = None

        except Exception as e:
            logger.error(f"Failed to initialize AI models: {e}")
            self.neo_predictor = None
            self.anomaly_detector = None

        except Exception as e:
            logger.error(f"Failed to load AI models: {e}")

    async def get_canvas_updates(self, current_time: datetime) -> List[CanvasUpdate]:
        """
        Get all pending canvas updates for the current time

        Args:
            current_time: Current simulation time

        Returns:
            List of canvas updates to apply
        """
        updates = []

        # Get real-time NEO data
        neo_updates = await self._get_neo_updates(current_time)
        updates.extend(neo_updates)

        # Get interstellar object updates
        interstellar_updates = await self._get_interstellar_updates(current_time)
        updates.extend(interstellar_updates)

        # Get solar flare updates
        solar_updates = await self._get_solar_flare_updates(current_time)
        updates.extend(solar_updates)

        # Get planetary conjunction updates
        conjunction_updates = await self._get_conjunction_updates(current_time)
        updates.extend(conjunction_updates)

        # Apply AI anomaly detection
        anomaly_updates = await self._detect_anomalies(updates, current_time)
        updates.extend(anomaly_updates)

        # Sort by priority (highest first)
        updates.sort(key=lambda x: x.priority, reverse=True)

        return updates

    async def _get_neo_updates(self, current_time: datetime) -> List[CanvasUpdate]:
        """Fetch and process NEO data from NASA API"""
        updates = []

        try:
            # Get NEO data for the next 7 days
            start_date = current_time.date()
            end_date = (current_time + timedelta(days=7)).date()

            params = {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "api_key": self.nasa_api_key
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(self.data_sources["neo"], params=params) as response:
                    if response.status == 200:
                        data = await response.json()

                        for date, neos in data.get("near_earth_objects", {}).items():
                            for neo in neos:
                                # Convert to AU coordinates (simplified)
                                distance_au = neo["close_approach_data"][0]["miss_distance"]["astronomical"]

                                # Estimate position (simplified orbital mechanics)
                                position = self._calculate_neo_position(neo, current_time)

                                update = CanvasUpdate(
                                    update_type="neo",
                                    object_id=neo["id"],
                                    position=position,
                                    metadata={
                                        "name": neo["name"],
                                        "magnitude": neo.get("absolute_magnitude_h"),
                                        "diameter": neo.get("estimated_diameter", {}).get("kilometers", {}).get("estimated_diameter_max"),
                                        "hazardous": neo.get("is_potentially_hazardous_asteroid", False),
                                        "close_approach": neo["close_approach_data"][0]
                                    },
                                    priority=3 if neo.get("is_potentially_hazardous_asteroid", False) else 1
                                )
                                updates.append(update)

        except Exception as e:
            logger.error(f"Failed to fetch NEO data: {e}")

        return updates

    async def _get_interstellar_updates(self, current_time: datetime) -> List[CanvasUpdate]:
        """Get updates for interstellar objects"""
        updates = []

        # Known interstellar objects
        interstellar_objects = [
            {
                "id": "1I/Oumuamua",
                "name": "'Oumuamua",
                "discovery_date": "2017-10-19",
                "trajectory": "hyperbolic"
            },
            {
                "id": "2I/Borisov",
                "name": "Borisov",
                "discovery_date": "2019-08-30",
                "trajectory": "hyperbolic"
            },
            {
                "id": "3I/ATLAS",
                "name": "ATLAS",
                "discovery_date": "2024-01-01",
                "trajectory": "hyperbolic"
            }
        ]

        for obj in interstellar_objects:
            # Calculate current position based on trajectory
            position = self._calculate_interstellar_position(obj, current_time)

            update = CanvasUpdate(
                update_type="interstellar",
                object_id=obj["id"],
                position=position,
                metadata={
                    "name": obj["name"],
                    "discovery_date": obj["discovery_date"],
                    "trajectory": obj["trajectory"],
                    "first_interstellar": obj["id"] == "1I/Oumuamua"
                },
                priority=2  # High priority for rare interstellar objects
            )
            updates.append(update)

        return updates

    async def _get_solar_flare_updates(self, current_time: datetime) -> List[CanvasUpdate]:
        """Fetch solar flare data and create visualization updates"""
        updates = []

        try:
            # Get solar flare data for the last 30 days
            start_date = (current_time - timedelta(days=30)).date()

            params = {
                "startDate": start_date.isoformat(),
                "api_key": self.nasa_api_key
            }

            async with aiohttp.ClientSession() as session:
                async with session.get(self.data_sources["solar_flares"], params=params) as response:
                    if response.status == 200:
                        flares = await response.json()

                        for flare in flares:
                            # Create solar flare visualization update
                            update = CanvasUpdate(
                                update_type="solar_flare",
                                object_id=f"flare_{flare['flrID']}",
                                position=(0, 0, 0),  # Sun's position
                                metadata={
                                    "classification": flare.get("classType", "Unknown"),
                                    "intensity": self._parse_flare_intensity(flare.get("classType", "A1.0")),
                                    "begin_time": flare.get("beginTime"),
                                    "peak_time": flare.get("peakTime"),
                                    "end_time": flare.get("endTime"),
                                    "source_location": flare.get("sourceLocation"),
                                    "active_region": flare.get("activeRegionNum")
                                },
                                priority=2 if flare.get("classType", "").startswith(("M", "X")) else 1
                            )
                            updates.append(update)

        except Exception as e:
            logger.error(f"Failed to fetch solar flare data: {e}")

        return updates

    async def _get_conjunction_updates(self, current_time: datetime) -> List[CanvasUpdate]:
        """Detect and report planetary conjunctions"""
        updates = []

        # Check for conjunctions in the next 30 days
        conjunctions = await self._detect_planetary_conjunctions(current_time)

        for conj in conjunctions:
            # Create conjunction visualization update
            update = CanvasUpdate(
                update_type="conjunction",
                object_id=f"conj_{conj.conjunction_id}",
                position=(0, 0, 0),  # Central position for conjunction indicator
                metadata={
                    "planets": conj.planets,
                    "separation": conj.separation,
                    "visibility": conj.visibility,
                    "significance": conj.significance,
                    "timestamp": conj.timestamp.isoformat()
                },
                priority=3 if conj.significance in ["major", "rare"] else 1
            )
            updates.append(update)

        return updates

    async def _detect_anomalies(self, updates: List[CanvasUpdate], current_time: datetime) -> List[CanvasUpdate]:
        """Use AI to detect anomalous celestial events"""
        anomaly_updates = []

        if not self.anomaly_detector:
            return anomaly_updates

        try:
            # Extract features from updates
            features = []
            for update in updates:
                feature_vector = self._extract_anomaly_features(update, current_time)
                features.append(feature_vector)

            if features:
                features_array = np.array(features)

                # Predict anomalies
                anomaly_scores = self.anomaly_detector.decision_function(features_array)
                predictions = self.anomaly_detector.predict(features_array)

                # Create anomaly updates for detected anomalies
                for i, (score, prediction) in enumerate(zip(anomaly_scores, predictions)):
                    if prediction == -1:  # Anomaly detected
                        original_update = updates[i]

                        anomaly_update = CanvasUpdate(
                            update_type="anomaly",
                            object_id=f"anomaly_{original_update.object_id}",
                            position=original_update.position,
                            metadata={
                                "original_update": original_update.update_type,
                                "anomaly_score": float(score),
                                "detected_at": current_time.isoformat(),
                                "confidence": min(abs(score) / 10, 1.0)  # Normalize confidence
                            },
                            priority=4  # Critical priority for anomalies
                        )
                        anomaly_updates.append(anomaly_update)

        except Exception as e:
            logger.error(f"Anomaly detection failed: {e}")

        return anomaly_updates

    def _calculate_neo_position(self, neo_data: Dict, current_time: datetime) -> Tuple[float, float, float]:
        """Calculate NEO position using simplified orbital mechanics"""
        # This is a simplified calculation - in production, use proper orbital elements
        try:
            # Get orbital data
            orbit_data = neo_data.get("orbital_data", {})

            # Simplified position calculation (placeholder)
            # In production, this would use Keplerian orbital elements
            distance = float(neo_data["close_approach_data"][0]["miss_distance"]["astronomical"])

            # Random position for demo (replace with actual orbital calculations)
            angle = hash(neo_data["id"]) % 360 * np.pi / 180
            x = distance * np.cos(angle)
            y = distance * np.sin(angle)
            z = (hash(neo_data["id"]) % 20 - 10) * 0.1  # Small z variation

            return (x, y, z)

        except Exception:
            # Fallback position
            return (2.0, 0.0, 0.0)

    def _calculate_interstellar_position(self, obj_data: Dict, current_time: datetime) -> Tuple[float, float, float]:
        """Calculate interstellar object position"""
        # Simplified trajectory calculation
        try:
            # These objects have hyperbolic trajectories
            # This is highly simplified - real calculations would use proper orbital elements

            if obj_data["id"] == "1I/Oumuamua":
                # 'Oumuamua trajectory (simplified)
                days_since_discovery = (current_time - datetime(2017, 10, 19)).days
                distance = 0.2 + days_since_discovery * 0.001  # Moving away
                angle = days_since_discovery * 0.01  # Orbital motion
                return (distance * np.cos(angle), distance * np.sin(angle), 0.1)

            elif obj_data["id"] == "2I/Borisov":
                # Borisov trajectory
                days_since_discovery = (current_time - datetime(2019, 8, 30)).days
                distance = 2.0 + days_since_discovery * 0.0005
                angle = days_since_discovery * 0.005
                return (distance * np.cos(angle), distance * np.sin(angle), -0.2)

            else:
                # ATLAS or other
                return (3.0, 1.0, 0.0)

        except Exception:
            return (3.0, 0.0, 0.0)

    async def _detect_planetary_conjunctions(self, current_time: datetime) -> List[PlanetaryConjunction]:
        """Detect planetary conjunctions using astronomical calculations"""
        conjunctions = []

        # This is a simplified conjunction detection
        # In production, this would use ephemeris calculations

        planets = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]

        # Check for close approaches (simplified)
        for i in range(len(planets)):
            for j in range(i + 1, len(planets)):
                planet1, planet2 = planets[i], planets[j]

                # Simplified conjunction detection
                # Real implementation would calculate actual positions
                separation = np.random.uniform(0.1, 30.0)  # Random for demo

                if separation < 5.0:  # Close conjunction
                    conj = PlanetaryConjunction(
                        conjunction_id=f"{planet1.lower()}_{planet2.lower()}_{current_time.date()}",
                        planets=[planet1, planet2],
                        separation=separation,
                        timestamp=current_time,
                        visibility="visible" if separation > 1.0 else "difficult",
                        significance="major" if separation < 1.0 else "minor"
                    )
                    conjunctions.append(conj)

        return conjunctions

    def _parse_flare_intensity(self, class_type: str) -> float:
        """Parse solar flare class to intensity value"""
        if not class_type or len(class_type) < 2:
            return 0.0

        base_class = class_type[0].upper()
        intensity_str = class_type[1:]

        try:
            intensity = float(intensity_str)
        except ValueError:
            intensity = 1.0

        # Class multipliers
        multipliers = {
            'A': 1e-8,
            'B': 1e-7,
            'C': 1e-6,
            'M': 1e-5,
            'X': 1e-4
        }

        return multipliers.get(base_class, 1e-8) * intensity

    def _extract_anomaly_features(self, update: CanvasUpdate, current_time: datetime) -> List[float]:
        """Extract features for anomaly detection"""
        features = []

        # Position features
        features.extend(update.position)

        # Time-based features
        time_diff = (current_time - update.timestamp).total_seconds() / 3600  # hours
        features.append(time_diff)

        # Type encoding
        type_encoding = {
            "neo": 1.0,
            "interstellar": 2.0,
            "solar_flare": 3.0,
            "conjunction": 4.0,
            "anomaly": 5.0
        }
        features.append(type_encoding.get(update.update_type, 0.0))

        # Priority
        features.append(update.priority)

        # Metadata features
        if update.metadata:
            features.append(len(update.metadata))  # Number of metadata fields

            # Add specific metadata values if they exist
            if "magnitude" in update.metadata:
                features.append(update.metadata["magnitude"] or 20.0)
            else:
                features.append(20.0)

            if "hazardous" in update.metadata:
                features.append(1.0 if update.metadata["hazardous"] else 0.0)
            else:
                features.append(0.0)

        # Pad to fixed length
        while len(features) < 10:
            features.append(0.0)

        return features[:10]  # Truncate if too long