#!/bin/bash

# AI Environmental Impact Calculator - Startup Script

echo "Starting AI Environmental Impact Calculator..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Create environment files if they don't exist
if [ ! -f "client/.env" ]; then
    echo "📄 Creating client/.env from template..."
    cp client/.env.example client/.env
fi

if [ ! -f "server/.env" ]; then
    echo "📄 Creating server/.env from template..."
    cp server/env.example server/.env
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

# Initialize database if it doesn't exist
if [ ! -f "server/database.sqlite" ]; then
    echo "🗄️ Initializing database..."
    cd server && npm run init-db && cd ..
fi

# Ensure client/public directory exists with required files
if [ ! -d "client/public" ]; then
    echo "📁 Creating client/public directory..."
    mkdir -p client/public
fi

if [ ! -f "client/public/index.html" ]; then
    echo "📄 Creating client/public/index.html..."
    cat > client/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="AI Environmental Impact Calculator - Calculate the carbon footprint of AI token usage"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>AI Environmental Impact Calculator</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF
fi

if [ ! -f "client/public/manifest.json" ]; then
    echo "📄 Creating client/public/manifest.json..."
    cat > client/public/manifest.json << 'EOF'
{
  "short_name": "AI Impact Calculator",
  "name": "AI Environmental Impact Calculator",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOF
fi

echo ""
echo "🚀 Starting servers..."
echo "   Backend API: http://localhost:5001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "Or run ./stop.sh to stop all processes"
echo ""

# Start both servers
npm run dev
