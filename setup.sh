#!/bin/bash
# TrustNet Setup Script for Linux/macOS

echo "===== TrustNet Environment Setup ====="
echo "Setting up environment for TrustNet..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3 first."
    echo "Ubuntu/Debian: sudo apt install python3"
    echo "macOS: brew install python3"
    exit 1
fi

# Check if pip is installed, if not try to install it
if ! command -v pip3 &> /dev/null; then
    echo "pip3 not found. Attempting to install..."
    if command -v apt &> /dev/null; then
        sudo apt update
        sudo apt install -y python3-pip
    elif command -v brew &> /dev/null; then
        brew install python3  # pip comes with Python3 on macOS
    else
        echo "Error: Could not install pip3. Please install pip3 manually."
        echo "Ubuntu/Debian: sudo apt install python3-pip"
        echo "macOS: brew install python3"
        exit 1
    fi
fi

# Install requirements
echo "Installing dependencies..."
pip3 install -r requirements.txt

# Ensure log directory exists
echo "Setting up directories..."
mkdir -p src/prototype/logs

echo "===== Setup Complete ====="
echo ""
echo "To run the TrustNet web interface:"
echo "  cd src/prototype"
echo "  python3 app.py"
echo ""
echo "Then open your browser and go to:"
echo "  http://localhost:5000"
