"""
ML Training API Router
======================

API endpoints for training and retraining ML models:
- POST /api/v1/ml/train - Train all ML models
- POST /api/v1/ml/train/lstm - Train LSTM model only
- POST /api/v1/ml/train/neo - Train NEO predictor only
- POST /api/v1/ml/train/anomaly - Train anomaly detector only
- GET /api/v1/ml/training/status - Get training status
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
import asyncio
import json
from datetime import datetime
from pathlib import Path
import subprocess
import sys

router = APIRouter(prefix="/ml/training", tags=["Machine Learning Training"])

# Training status tracking
training_status = {
    "is_training": False,
    "current_model": None,
    "progress": 0,
    "start_time": None,
    "errors": [],
    "completed_models": []
}

# Request/Response Models
class TrainingRequest(BaseModel):
    """Request for model training"""
    model_type: Optional[str] = None  # 'lstm', 'neo', 'anomaly', or None for all
    force_retrain: bool = False

class TrainingStatus(BaseModel):
    """Training status response"""
    is_training: bool
    current_model: Optional[str]
    progress: int
    start_time: Optional[str]
    errors: list
    completed_models: list
    estimated_time_remaining: Optional[str]

@router.post("/train", response_model=Dict[str, Any])
async def train_models(request: TrainingRequest, background_tasks: BackgroundTasks):
    """
    Train ML models.

    Args:
        request: Training configuration

    Returns:
        Training initiation response
    """
    global training_status

    if training_status["is_training"]:
        raise HTTPException(
            status_code=409,
            detail="Training already in progress"
        )

    # Reset training status
    training_status = {
        "is_training": True,
        "current_model": request.model_type or "all",
        "progress": 0,
        "start_time": datetime.now().isoformat(),
        "errors": [],
        "completed_models": []
    }

    # Start training in background
    background_tasks.add_task(run_training, request.model_type, request.force_retrain)

    return {
        "message": f"Training started for {request.model_type or 'all models'}",
        "status": "started",
        "start_time": training_status["start_time"]
    }

@router.get("/training/status", response_model=TrainingStatus)
async def get_training_status():
    """Get current training status"""
    return TrainingStatus(**training_status)

async def run_training(model_type: Optional[str], force_retrain: bool):
    """Run the training process"""
    global training_status

    try:
        # Update progress
        training_status["progress"] = 10

        # Run training script
        cmd = [sys.executable, "-m", "app.ml.train_models"]

        if model_type:
            cmd.extend(["--model", model_type])

        if force_retrain:
            cmd.append("--force")

        # Run the training
        process = await asyncio.create_subprocess_exec(
            *cmd,
            cwd=Path(__file__).parent.parent.parent,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        if process.returncode == 0:
            training_status["progress"] = 100
            training_status["completed_models"] = [model_type] if model_type else ["lstm", "neo", "anomaly"]
        else:
            training_status["errors"].append(stderr.decode())

        training_status["progress"] = 100

    except Exception as e:
        training_status["errors"].append(str(e))
        training_status["progress"] = 0

    finally:
        training_status["is_training"] = False
        training_status["current_model"] = None

# Individual model training endpoints
@router.post("/train/lstm")
async def train_lstm(background_tasks: BackgroundTasks):
    """Train LSTM model only"""
    request = TrainingRequest(model_type="lstm")
    return await train_models(request, background_tasks)

@router.post("/train/neo")
async def train_neo(background_tasks: BackgroundTasks):
    """Train NEO predictor only"""
    request = TrainingRequest(model_type="neo")
    return await train_models(request, background_tasks)

@router.post("/train/anomaly")
async def train_anomaly(background_tasks: BackgroundTasks):
    """Train anomaly detector only"""
    request = TrainingRequest(model_type="anomaly")
    return await train_models(request, background_tasks)