#!/opt/homebrew/bin/bash

# Load Environment Variables
source .env

# Export the IP address as an environment variable
FRONTEND_LOG="frontend.log"
BACKEND_LOG="backend.log"

echo "[LOG] Start frontend server, log at frontend/$FRONTEND_LOG"
(cd frontend/ && npm run build >> "$FRONTEND_LOG" 2>&1 && npm run preview -- --host 0.0.0.0 --port 5173 >> "$FRONTEND_LOG" 2>&1 & echo $! > frontend_pid.txt)
echo "[LOG] PID (frontend): $(cat frontend_pid.txt)"

echo "[LOG] Start backend server, log at api/$BACKEND_LOG"
(cd api/ && source .venv/bin/activate && fastapi run app.py --host 0.0.0.0 --port 8000 >> "$BACKEND_LOG" 2>&1 & echo $! > backend_pid.txt)
echo "[LOG] PID (backend): $(cat backend_pid.txt)"
