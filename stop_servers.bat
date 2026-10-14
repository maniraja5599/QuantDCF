@echo off
title Stop DCF Platform Servers
color 0C
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Moved_From_E\Projects\Vibhuti Sharma\stop_servers.ps1"
ping 127.0.0.1 -n 3 >nul
exit
