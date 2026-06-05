@echo off
REM Bio Project - Development Server Starter
REM This script sets up the environment and starts the Next.js dev server

echo.
echo ========================================
echo Bio Project - Development Server
echo ========================================
echo.

REM Set Node.js path to ensure npm and node work correctly
set PATH="C:\Program Files\nodejs";%PATH%

REM Navigate to the project directory
cd /d "%~dp0"

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call "C:\Program Files\nodejs\npm.cmd" install
    echo.
)

REM Start the development server
echo Starting development server...
echo.
echo Local:   http://localhost:3000
echo.
call "C:\Program Files\nodejs\npm.cmd" run dev

pause
