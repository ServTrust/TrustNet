@echo off
echo ===== TrustNet Environment Setup =====
echo Setting up environment for TrustNet...

:: Check if Python is installed
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

:: Check if pip is installed
pip --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Error: pip is not installed or not in PATH.
    echo Try reinstalling Python with the "Add Python to PATH" option.
    pause
    exit /b 1
)

:: Install requirements
echo Installing dependencies...
pip install -r requirements.txt

:: Ensure log directory exists
echo Setting up directories...
if not exist src\prototype\logs mkdir src\prototype\logs

echo ===== Setup Complete =====
echo.
echo To run the TrustNet web interface:
echo   cd src\prototype
echo   python app.py
echo.
echo Then open your browser and go to:
echo   http://localhost:5000

pause
