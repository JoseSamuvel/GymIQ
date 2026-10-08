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

if exist "backend\target\gym-churn-backend-1.0.0.jar" (
    echo [OK] Launching GymIQ Spring Boot Backend JAR...
    java -jar "backend\target\gym-churn-backend-1.0.0.jar"
) else if exist "target\gym-churn-backend-1.0.0.jar" (
    echo [OK] Launching GymIQ Spring Boot Backend JAR...
    java -jar "target\gym-churn-backend-1.0.0.jar"
) else (
    echo [OK] Building and running with Maven...
    set MVN_CMD="C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.2\plugins\maven\lib\maven3\bin\mvn.cmd"
    if exist %MVN_CMD% (
        %MVN_CMD% -f backend/pom.xml spring-boot:run
    ) else (
        mvn -f backend/pom.xml spring-boot:run
    )
)
