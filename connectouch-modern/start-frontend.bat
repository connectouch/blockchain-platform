@echo off
echo Starting Connectouch Frontend...
cd /d "%~dp0"
npx vite --host 0.0.0.0 --port 5173
pause
