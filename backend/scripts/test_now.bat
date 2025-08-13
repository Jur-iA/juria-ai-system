@echo off
setlocal
REM One-click: login, use token, call cases and agent via PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0test_now.ps1"
pause
