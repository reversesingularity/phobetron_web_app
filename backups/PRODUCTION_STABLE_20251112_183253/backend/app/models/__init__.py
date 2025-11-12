"""SQLAlchemy ORM Models."""

# Import all models to ensure they're registered with Base
from .scientific import (
    EphemerisData,
    OrbitalElements,
    ImpactRisks,
    NeoCloseApproaches,
)
from .events import (
    Earthquakes,
    SolarEvents,
    MeteorShowers,
    VolcanicActivity,
)
from .theological import (
    Prophecies,
    CelestialSigns,
    ProphecySignLinks,
)
from .alerts import (
    DataTriggers,
    Alerts,
)
from .correlations import (
    CorrelationRules,
    EventCorrelations,
)

__all__ = [
    # Scientific data models
    "EphemerisData",
    "OrbitalElements",
    "ImpactRisks",
    "NeoCloseApproaches",
    # Geophysical event models
    "Earthquakes",
    "SolarEvents",
    "MeteorShowers",
    "VolcanicActivity",
    # Theological data models
    "Prophecies",
    "CelestialSigns",
    "ProphecySignLinks",
    # Alert system models
    "DataTriggers",
    "Alerts",
    # Correlation analysis models
    "CorrelationRules",
    "EventCorrelations",
]
