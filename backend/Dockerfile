# Backend Dockerfile for Phobetron
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from backend directory
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code from backend directory
COPY backend/ .

# Expose port (Railway will set $PORT)
EXPOSE 8020

# Run the application - Railway provides $PORT
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8020}
