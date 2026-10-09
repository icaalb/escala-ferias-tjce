param(
  [string]$Url
)

if (-not $Url) {
  $Url = Read-Host "Digite o endereço atual do sistema"
}

if (-not $Url) {
  Write-Host "Nenhum endereço informado. Instalação cancelada." -ForegroundColor Red
  exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$creator = Join-Path $scriptDir "CRIAR-ATALHO-ESCALA-TJCE.ps1"

if (-not (Test-Path $creator)) {
  Write-Host "Arquivo CRIAR-ATALHO-ESCALA-TJCE.ps1 não encontrado." -ForegroundColor Red
  exit 1
}

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $creator -Url $Url
