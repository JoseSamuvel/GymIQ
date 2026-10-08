@echo off
REM ============================================================
REM  GymIQ - Spring Boot Backend Startup Script
REM ============================================================

echo.
echo  ================================================
echo   GymIQ Churn Prediction Backend
echo  ================================================
echo.

set JAVA_HOME=C:\Java\jdk-17
set PATH=%JAVA_HOME%\bin;%PATH%

set MVN_CMD="C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd"

if exist %MVN_CMD% (
    echo [OK] Using bundled Maven from IntelliJ
    %MVN_CMD% spring-boot:run
) else (
    echo [OK] Using system Maven
    mvn spring-boot:run
)
