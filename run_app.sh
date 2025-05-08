#!/bin/bash

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

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd app/frontend
npm install
cd ../..

# Start backend service in the background
echo "Starting backend service..."
cd app/api
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ../..

# Start frontend service
echo "Starting frontend service..."
cd app/frontend
npm run dev

# Clean up backend service on exit
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID
    exit 0
}

trap cleanup INT TERM
wait 