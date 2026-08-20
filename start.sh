#!/bin/bash
# ─────────────────────────────────────────────────────────────
# LevelShift — Launch Script
# One click: installs deps, starts dev server, opens browser.
# ─────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$SCRIPT_DIR/app"
PORT=5173
URL="http://localhost:$PORT"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       ⚡ LevelShift — Launch         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

cd "$APP_DIR"

# Step 1: Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 First run — installing dependencies...${NC}"
  npm install --registry https://registry.npmjs.org
  echo -e "${GREEN}✅ Dependencies installed.${NC}"
  echo ""
  
  # Build content from markdown
  echo -e "${YELLOW}📝 Building content...${NC}"
  node build-content.js
  echo ""
else
  echo -e "${GREEN}✅ Dependencies ready.${NC}"
fi

# Step 2: Start dev server in background
echo -e "${BLUE}🚀 Starting dev server on ${URL}${NC}"
echo ""

# Kill any existing vite process on this port
lsof -ti:$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true

# Start vite dev server
npm run dev -- --port $PORT &
SERVER_PID=$!

# Step 3: Wait for server to be ready
echo -n "   Waiting for server"
for i in {1..30}; do
  if curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}   ✅ Server ready!${NC}"
    break
  fi
  echo -n "."
  sleep 1
done

# Step 4: Open in browser
echo -e "${BLUE}   🌐 Opening browser...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "$URL" 2>/dev/null || echo "   Open $URL in your browser"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  LevelShift running at: ${URL}${NC}"
echo -e "${GREEN}  Press Ctrl+C to stop.${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

# Keep script alive (wait for server process)
wait $SERVER_PID
