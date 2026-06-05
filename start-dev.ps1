#!/usr/bin/env pwsh
# Bio Project - Development Server Starter (PowerShell)
# This script sets up the environment and starts the Next.js dev server

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Bio Project - Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set Node.js path to ensure npm and node work correctly
$env:PATH = "C:\Program Files\nodejs;$($env:PATH)"

# Navigate to the project directory
Push-Location $PSScriptRoot

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & "C:\Program Files\nodejs\npm.cmd" install
    Write-Host ""
}

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Local:   http://localhost:3000" -ForegroundColor Green
Write-Host ""

& "C:\Program Files\nodejs\npm.cmd" run dev
