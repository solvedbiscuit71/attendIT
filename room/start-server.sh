#!/opt/homebrew/bin/bash

# Load Environment Variables
source .env

# Prompt the user for the network interface
read -p "Enter the network interface (e.g., en0, en5): " interface

# Extract the IPv4 address using ip command
if [[ -z "$interface" ]]; then
    ipv4_address=''
else
    ipv4_address=$(ipconfig getifaddr "$interface")
fi

# Check if an IP address was found
if [[ -z "$ipv4_address" ]]; then
    echo "[ERROR] No IP address found for interface $interface."
    echo "[LOG] Fallback to localhost"
    export ROOM_DOMAIN="localhost:8001"
else
    # Export the IP address as an environment variable
    export ROOM_DOMAIN="$ipv4_address":8001
fi
echo "[LOG] export ROOM_DOMAIN=$ROOM_DOMAIN"

FRONTEND_LOG="frontend.log"
BACKEND_LOG="backend.log"

echo "[LOG] Start frontend server, log at frontend/$FRONTEND_LOG"
(cd frontend/ && npm run build >> "$FRONTEND_LOG" 2>&1 && npm run preview -- --host 0.0.0.0 --port 5174 >> "$FRONTEND_LOG" 2>&1 & echo $! > frontend_pid.txt)
echo "[LOG] PID (frontend): $(cat frontend_pid.txt)"

echo "[LOG] Start backend server, log at api/$BACKEND_LOG"
(cd api/ && source .venv/bin/activate && fastapi run app.py --host 0.0.0.0 --port 8001 >> "$BACKEND_LOG" 2>&1 & echo $! > backend_pid.txt)
echo "[LOG] PID (backend): $(cat backend_pid.txt)"
