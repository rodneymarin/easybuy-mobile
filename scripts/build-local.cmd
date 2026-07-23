@echo off
cd /d "%~dp0\..\android"
if errorlevel 1 exit /b 1
call .\gradlew.bat assembleRelease
if errorlevel 1 exit /b 1
echo APK generado