@echo off
echo Installing SceneryAddons UI Frontend...
echo.

echo Step 1: Installing Node.js dependencies...
call npm install

echo.
echo Step 2: Verifying installation...
call npm run build

echo.
echo Installation complete!
echo.
echo To start development:
echo   npm run dev
echo.
echo To verify backend is running:
echo   curl http://localhost:5269/api/health
echo.
pause