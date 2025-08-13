@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0restart_and_test.ps1"
pause
