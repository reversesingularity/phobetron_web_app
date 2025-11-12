"""
Minimal FastAPI application for testing.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI application
app = FastAPI(
    title="Celestial Signs API",
    description="API for tracking celestial signs",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
    }

@app.get("/api/v1/orbital-elements", tags=["orbital elements"])
async def get_orbital_elements():
    # Mock data for testing
    return {
        "total": 8,
        "skip": 0,
        "limit": 50,
        "data": [
            {
                "object_name": "Mercury",
                "semi_major_axis_au": 0.38709927,
                "eccentricity": 0.20563593,
                "inclination_deg": 7.00497902,
                "data_source": "JPL"
            },
            {
                "object_name": "Venus",
                "semi_major_axis_au": 0.72333566,
                "eccentricity": 0.00677672,
                "inclination_deg": 3.39467605,
                "data_source": "JPL"
            },
            {
                "object_name": "Earth",
                "semi_major_axis_au": 1.00000261,
                "eccentricity": 0.01671123,
                "inclination_deg": 0.00001531,
                "data_source": "JPL"
            },
            {
                "object_name": "Mars",
                "semi_major_axis_au": 1.52371034,
                "eccentricity": 0.09339410,
                "inclination_deg": 1.84969142,
                "data_source": "JPL"
            },
            {
                "object_name": "Jupiter",
                "semi_major_axis_au": 5.20288700,
                "eccentricity": 0.04838624,
                "inclination_deg": 1.30439695,
                "data_source": "JPL"
            },
            {
                "object_name": "Saturn",
                "semi_major_axis_au": 9.53667594,
                "eccentricity": 0.05550825,
                "inclination_deg": 2.48599187,
                "data_source": "JPL"
            },
            {
                "object_name": "Uranus",
                "semi_major_axis_au": 19.18916464,
                "eccentricity": 0.04716771,
                "inclination_deg": 0.77263783,
                "data_source": "JPL"
            },
            {
                "object_name": "Neptune",
                "semi_major_axis_au": 30.06992276,
                "eccentricity": 0.00858587,
                "inclination_deg": 1.77004347,
                "data_source": "JPL"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "minimal_app:app",
        host="0.0.0.0",
        port=8020,
        reload=True,
    )