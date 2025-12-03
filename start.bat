@echo off
echo ========================================
echo 📚 Scriba - Sistema de Gerenciamento de Biblioteca
echo ========================================
echo.

REM Definir caminho do XAMPP (ajuste se necessário)
set XAMPP_PATH=C:\xampp

REM Verificar se o XAMPP existe
if not exist "%XAMPP_PATH%\xampp-control.exe" (
    echo ❌ XAMPP não encontrado em %XAMPP_PATH%
    echo    Instale o XAMPP ou ajuste o caminho no arquivo start.bat
    pause
    exit /b 1
)

REM Verificar se Apache está rodando
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Apache já está rodando
) else (
    echo ⏳ Iniciando Apache...
    "%XAMPP_PATH%\apache_start.bat"
)

REM Verificar se MySQL está rodando
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MySQL já está rodando
) else (
    echo ⏳ Iniciando MySQL...
    "%XAMPP_PATH%\mysql_start.bat"
)

echo.
echo 🌐 Aplicação disponível em:
echo    http://localhost/scriba/home_scriba/frontend/inicial/index.html
echo.
echo 🗄️  phpMyAdmin:
echo    http://localhost/phpmyadmin
echo.
echo 💡 Para abrir o painel de controle: %XAMPP_PATH%\xampp-control.exe
echo.
pause
