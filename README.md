# 🎵 Bio Project - Getting Started

Welcome to the Bio project! This folder contains everything you need to run the Next.js application.

## 🚀 Quick Start

### The Easiest Way - Use the Startup Script

**For Windows Command Prompt or PowerShell:**
Simply navigate to the `Bio` folder and double-click `start-dev.bat` - it will handle everything!

```bash
cd Bio
./start-dev.bat
```

Or from PowerShell:
```powershell
cd Bio
.\start-dev.ps1
```

## 📋 System Requirements

- **Node.js**: v24.16.0 or later (download from https://nodejs.org/)
- **Windows OS** (scripts are configured for Windows)

## 📁 Project Structure

```
Bio/
├── app/                 # Next.js app directory with routes
├── components/          # Reusable React components
│   └── ui/             # Shadcn UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and constants
├── public/             # Static assets (images, music, avatars)
├── styles/             # Global CSS styles
├── start-dev.bat       # Click this to start the dev server
├── start-dev.ps1       # PowerShell alternative
├── SETUP.md            # Detailed setup guide
└── next.config.mjs     # Next.js configuration
```

## 🛠️ Available Scripts

Once the dev server is running, you can also use these commands:

```bash
npm run dev      # Start development server (already done by start-dev.bat)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run code linter
```

## 🌐 Access the Application

After starting the dev server, open your browser and go to:
- **http://localhost:3000**

The page will automatically reload when you make code changes.

## 📝 What Was Fixed

To prevent future errors, the following improvements were made:

1. ✅ **Removed conflicting lockfile** - Deleted the root-level `package-lock.json` to avoid Next.js warnings
2. ✅ **Created startup scripts** - `start-dev.bat` and `start-dev.ps1` automatically set up the correct PATH for Node.js
3. ✅ **Updated Next.js config** - Added turbopack root configuration to resolve workspace warnings
4. ✅ **Added VS Code settings** - Configured `.vscode/` with proper editor settings and build tasks
5. ✅ **Created documentation** - Added `SETUP.md` for detailed troubleshooting

## ⚠️ Troubleshooting

### Node.js Not Found
Make sure Node.js is installed. Download it from https://nodejs.org/

### Port 3000 Already in Use
The dev server will automatically use the next available port. Check the terminal output for the correct URL.

### Permission Denied on start-dev.ps1
Run this command once in PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

### Still Having Issues?
See the detailed `SETUP.md` file in the `Bio` folder for more troubleshooting options.

## 📚 For More Information

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs)

---

**Happy coding! 🎉**
