@echo off
chcp 65001 >nul
title Instalar atalho - Escala TJCE
echo.
echo ============================================
echo   ESCALA TJCE - INSTALADOR DE ATALHO
echo ============================================
echo.
set /p URL=Digite o endereco atual do sistema (ex.: https://escala-tjce.intranet.mpce.mp.br): 
if "%URL%"=="" (
  echo.
  echo Nenhum endereco informado. Instalacao cancelada.
  pause
  exit /b 1
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0CRIAR-ATALHO-ESCALA-TJCE.ps1" -Url "%URL%"
echo.
pause
