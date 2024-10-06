#!/opt/homebrew/bin/bash

source .env
fastapi dev app.py --host 0.0.0.0 --port 8001
