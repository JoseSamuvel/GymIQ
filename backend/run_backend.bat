@echo off
REM ============================================================
REM  GymIQ - Spring Boot Backend Startup Script
REM ============================================================

echo.
echo  ================================================
echo   GymIQ Churn Prediction Backend
echo  ================================================
echo.

set "JAVA_HOME=C:\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"

if exist "%~dp0target\gym-churn-backend-1.0.0.jar" (
    echo [OK] Launching GymIQ Spring Boot Backend JAR...
    java -jar "%~dp0target\gym-churn-backend-1.0.0.jar"
    goto :end
)

if exist "%~dp0..\backend\target\gym-churn-backend-1.0.0.jar" (
    echo [OK] Launching GymIQ Spring Boot Backend JAR...
    java -jar "%~dp0..\backend\target\gym-churn-backend-1.0.0.jar"
    goto :end
)

echo [OK] Running Spring Boot with Maven...
set "MVN_CMD=C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd"
if exist "%MVN_CMD%" (
    "%MVN_CMD%" spring-boot:run
) else (
    mvn spring-boot:run
)

:end
