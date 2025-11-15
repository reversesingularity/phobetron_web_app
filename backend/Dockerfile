# Backend Dockerfile for Phobetron - Production Stable
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    g++ \
    curl \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip setuptools wheel

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional ML/Data Science libraries
RUN pip install --no-cache-dir \
    celery[redis]==5.3.4 \
    redis==4.6.0 \
    scikit-learn==1.3.2 \
    tensorflow==2.15.0 \
    convertdate==2.4.0 \
    skyfield==1.46 \
    ephem==4.1.5

# Copy application code
COPY . .

# Create directories for ML models and logs
RUN mkdir -p /app/ml/models /app/logs

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port 8020 (API server)
EXPOSE 8020

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8020/docs || exit 1

# Default command (can be overridden in docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8020"]
