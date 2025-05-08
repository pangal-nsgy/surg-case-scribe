#!/bin/bash

# This script runs the Python backend locally for development
# The frontend and backend integration can be tested locally using this script
# and running the Next.js frontend separately.

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -e .
cd app/api
pip install -r requirements.txt
cd ../..

# Start backend service
echo "Starting backend service on http://localhost:8000..."
cd app/api
uvicorn main:app --reload --port 8000

# This version only starts the backend
# When you want to use the frontend with the backend,
# open a separate terminal and run:
# cd app/frontend && npm run dev 