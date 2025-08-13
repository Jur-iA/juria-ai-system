@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0test_agents.ps1"
pause
