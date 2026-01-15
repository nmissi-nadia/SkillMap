@echo off
echo ========================================
echo Creation de la base de donnees skilldb
echo ========================================
echo.

REM Trouver psql dans les emplacements courants
set PSQL_PATH=
if exist "C:\Program Files\PostgreSQL\16\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\16\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\15\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\15\bin\psql.exe
if exist "C:\Program Files\PostgreSQL\14\bin\psql.exe" set PSQL_PATH=C:\Program Files\PostgreSQL\14\bin\psql.exe

if "%PSQL_PATH%"=="" (
    echo ERREUR: PostgreSQL psql.exe non trouve!
    echo Veuillez installer PostgreSQL ou ajouter psql au PATH
    pause
    exit /b 1
)

echo PostgreSQL trouve: %PSQL_PATH%
echo.
echo Connexion a PostgreSQL...
echo Mot de passe par defaut: ycode
echo.

"%PSQL_PATH%" -U postgres -f create-database.sql

echo.
echo ========================================
echo Script termine!
echo ========================================
pause
