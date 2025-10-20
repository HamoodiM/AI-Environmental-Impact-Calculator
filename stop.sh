#!/bin/bash

# AI Environmental Impact Calculator - Stop Script

echo "🛑 Stopping AI Environmental Impact Calculator..."
echo ""

# Function to kill processes by port
kill_by_port() {
    local port=$1
    local process_name=$2
    
    # Find PIDs using the port
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "🔍 Found $process_name running on port $port (PID: $pids)"
        echo "   Killing process(es)..."
        echo "$pids" | xargs kill -TERM 2>/dev/null
        
        # Wait a moment for graceful shutdown
        sleep 2
        
        # Force kill if still running
        local remaining_pids=$(lsof -ti:$port 2>/dev/null)
        if [ -n "$remaining_pids" ]; then
            echo "   Force killing remaining process(es)..."
            echo "$remaining_pids" | xargs kill -KILL 2>/dev/null
        fi
        
        echo "✅ $process_name stopped"
    else
        echo "ℹ️  No $process_name process found on port $port"
    fi
}

# Stop React development server (port 3000)
kill_by_port 3000 "React Dev Server"

# Stop Express server (port 5001)
kill_by_port 5001 "Express Server"

# Also kill any node processes that might be related to this project
echo ""
echo "🔍 Checking for any remaining Node.js processes related to this project..."

# Kill processes that contain our project name in the command line
pkill -f "ai-environmental-impact-calculator" 2>/dev/null
pkill -f "ai-impact-calculator" 2>/dev/null

# Kill any concurrently processes that might be running
pkill -f "concurrently" 2>/dev/null

echo ""
echo "✅ All processes stopped successfully!"
echo ""
echo "💡 You can now run ./start.sh to start the application again."
