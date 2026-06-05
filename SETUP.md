# Bio Project Setup Guide

This guide will help you run the Bio project without errors.

## Quick Start

### Option 1: Using Batch Script (Recommended for Windows)
Simply double-click the `start-dev.bat` file in the project root. This will:
- Set up the correct environment paths
- Install dependencies (if needed)
- Start the development server at http://localhost:3000

### Option 2: Using PowerShell Script
Run the following command in PowerShell:
```powershell
cd "d:\bio\Bio"
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\start-dev.ps1
```

### Option 3: Manual Command Line (CMD)
```cmd
cd d:\bio\Bio
set PATH="C:\Program Files\nodejs";%PATH%
npm run dev
```

### Option 4: Manual Command Line (PowerShell)
```powershell
cd "d:\bio\Bio"
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
npm run dev
```

## Access the Application

Once the server starts, open your browser and navigate to:
- **Local**: http://localhost:3000
- **Network**: Check the terminal output for the network URL

## Troubleshooting

### Node.js Not Found
If you get "'node' is not recognized" error:
1. Make sure Node.js is installed from https://nodejs.org/
2. Use the `start-dev.bat` script which handles PATH setup automatically

### Port 3000 Already in Use
If port 3000 is already in use, the server will automatically try the next available port. Check the terminal output for the correct URL.

### Multiple Lockfiles Warning
This warning can be safely ignored. It appears because the project uses `pnpm-lock.yaml`.

## Project Structure

```
Bio/
├── app/           # Next.js app directory
├── components/    # React components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and types
├── public/        # Static files
├── styles/        # CSS styles
├── package.json   # Project dependencies
├── start-dev.bat  # Batch script to start dev server
└── start-dev.ps1  # PowerShell script to start dev server
```

## Dependencies

- **Node.js**: v24.16.0 or compatible
- **Package Manager**: npm (comes with Node.js)
- **Framework**: Next.js 16.0.10

## Common Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter
```

---

For future runs, just use the `start-dev.bat` script and you won't encounter PATH issues anymore!
