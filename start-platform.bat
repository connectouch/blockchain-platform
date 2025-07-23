@echo off
echo ========================================
echo    Connectouch Platform Startup
echo ========================================
echo.

REM Set the working directory
cd /d "%~dp0"

echo Starting Connectouch Platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Start the simple server
echo Starting Simple Server on port 3006...
start "Connectouch Simple Server" cmd /k "node simple-server.js"

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Start the working API server
echo Starting Working API Server on port 3006...
start "Connectouch Working API" cmd /k "node working-api-server.js"

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Try to start the frontend
echo Starting Frontend Development Server...
cd connectouch-modern
start "Connectouch Frontend" cmd /k "npx vite --host 0.0.0.0 --port 5173"

REM Go back to root
cd ..

echo.
echo ========================================
echo    Platform Started Successfully!
echo ========================================
echo.
echo Services:
echo - Simple Server: http://localhost:3006
echo - Working API: http://localhost:3006
echo - Frontend: http://localhost:5173
echo.
echo Press any key to open the platform in browser...
pause >nul

REM Open the platform in default browser
start http://localhost:5173

echo.
echo Platform is now running!
echo Close this window to stop all services.
echo.
pause
