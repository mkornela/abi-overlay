@echo off
setlocal
cd /d "%~dp0"

if exist "node\node.exe" (
  start "ABI Overlay Server" /min "node\node.exe" "src\server.js"
) else (
  start "ABI Overlay Server" /min node "src\server.js"
)

timeout /t 2 /nobreak >nul
start "" "http://localhost:41773/control"
echo.
echo ABI Overlay is running.
echo Control panel: http://localhost:41773/control
echo OBS overlay:  http://localhost:41773/overlay
echo.
pause
