#!/opt/homebrew/bin/bash

# Stop the frontend server
if [ -f frontend_pid.txt ]; then
    FRONTEND_PID=$(cat frontend_pid.txt)
    echo "[LOG] Stop frontend server, PID: $FRONTEND_PID"
    kill -9 $FRONTEND_PID
    rm frontend_pid.txt
    rm frontend/.env.production.local
else
    echo "[ERROR] Frontend server is not running or PID file is missing."
fi

# Stop the backend server
if [ -f backend_pid.txt ]; then
    BACKEND_PID=$(cat backend_pid.txt)
    echo "[LOG] Stop backend server, PID: $BACKEND_PID"
    kill -9 $BACKEND_PID
    rm backend_pid.txt
else
    echo "[ERROR] Backend server is not running or PID file is missing."
fi


echo "[LOG] Stop subprocess"
ps -A | grep 'room' | awk '{print $1}' | xargs kill -9 > /dev/null 2>&1

echo "[LOG] Both servers stopped."

