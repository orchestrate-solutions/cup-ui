#!/usr/bin/env bash
# Runs every Cypress test (component and e2e) against this directory.
# The tests open /cypress/harness.html and /docs/*.html, so the directory must be served.
set -euo pipefail
cd "$(dirname "$0")/.."

PORT=8765
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 50); do
  curl -sf "http://127.0.0.1:$PORT/cypress/harness.html" >/dev/null && break
  sleep 0.2
done

npx cypress run
