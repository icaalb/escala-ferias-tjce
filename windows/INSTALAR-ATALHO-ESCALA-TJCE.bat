@echo off
chcp 65001 >nul
title Instalar atalho - Escala TJCE
setlocal

set "CONFIG=%~dp0ENDERECO-SISTEMA.txt"

if not exist "%CONFIG%" (
  echo.
  echo ERRO: O arquivo ENDERECO-SISTEMA.txt nao foi encontrado.
  echo A equipe de TI deve configurar o endereco do sistema nesse arquivo.
  echo.
  pause
  exit /b 1
)

set /p URL=<"%CONFIG%"

if "%URL%"=="" (
  echo.
  echo ERRO: O arquivo ENDERECO-SISTEMA.txt esta vazio.
  echo A equipe de TI deve informar o endereco do sistema.
  echo.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0CRIAR-ATALHO-ESCALA-TJCE.ps1" -Url "%URL%"

echo.
echo Instalacao concluida.
pause
