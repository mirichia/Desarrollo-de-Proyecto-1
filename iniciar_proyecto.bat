@echo off
setlocal

echo ========================================
echo  Iniciando proyecto PAQRAP
echo ========================================
echo.

echo Instalando dependencias...
call npm.cmd install

if errorlevel 1 (
  echo.
  echo Error: no se pudieron instalar las dependencias.
  pause
  exit /b 1
)

echo.
echo Dependencias instaladas correctamente.
echo.
echo Iniciando servidor de desarrollo...
echo URL esperada: http://localhost:3000
echo.

call npm.cmd run dev

pause
