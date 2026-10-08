# GymIQ — AI Member Retention & Churn Prediction System

> **GymIQ** is an end-to-end predictive intelligence system designed for fitness clubs and gymnasium managers. It analyzes member check-in frequency, physical exertion metrics, and membership tenure to predict churn risk (probability of non-renewal) 30–45 days in advance, providing automated, actionable retention strategies.

---

## 🏗️ Architecture Blueprint

```
┌─────────────────────────┐       ┌──────────────────────────┐       ┌─────────────────────────┐
│   Python ML Pipeline    │       │    Java Spring Boot      │       │     React Dashboard     │
│  (Scikit-Learn / ONNX)  │ ────► │  (ONNX Runtime Engine)   │ ────► │    (Vite / CSS Glass)   │
│  RandomForest (80%+ AUC)│       │  REST API @ port 8080    │       │   Web UI @ port 5173    │
└─────────────────────────┘       └──────────────────────────┘       └─────────────────────────┘
```

1. **Layer 1: ML Model (`train_model.py`)**
   - Trained on member demographics and behavioral data (`cleaned_gym_members.csv`).
   - Exported to `churn_model.onnx` via `skl2onnx` for high-performance cross-platform deployment.

2. **Layer 2: Java Spring Boot Backend (`/backend`)**
   - High-throughput REST API leveraging Microsoft ONNX Runtime Java API (`OnnxInferenceService`).
   - Zero Python dependencies required at production runtime.

3. **Layer 3: React Dashboard (`/frontend`)**
   - Modern glassmorphism UI built with Vite, React 18, and custom CSS design system.
   - Interactive gauge visualization, real-time risk stratification (HIGH / MEDIUM / LOW), and tailored retention action plans.

---

## ⚡ Quick Start

### 1. Run the Spring Boot Backend
```cmd
.\run_backend.bat
```
*API running at `http://localhost:8080`*

### 2. Run the React Dashboard
```cmd
.\run_frontend.bat
```
*Dashboard running at `http://localhost:5173`*

---

## 📊 Feature Reference

| Feature | Type | Description |
| :--- | :--- | :--- |
| `Age` | Numerical | Member age in years |
| `Avg_Workout_Duration_Min` | Numerical | Average session length in minutes |
| `Avg_Calories_Burned` | Numerical | Average calories burned per visit |
| `Total_Weight_Lifted_kg` | Numerical | Total resistance volume lifted |
| `Visits_Per_Month` | Numerical | Attendance frequency |
| `Tenure_Days` | Numerical | Membership age in days |
| `Gender_Male` | Binary | `1` = Male, `0` = Female |
| `Membership_Type` | One-Hot | Quarterly / Yearly (Monthly is baseline) |
| `Favorite_Exercise` | One-Hot | Cycling / Deadlift / Pull-ups / Squats / Treadmill |

---

## 📡 REST API Endpoints

### `POST /api/predict`
**Request Payload:**
```json
{
  "age": 46,
  "avg_workout_duration_min": 45,
  "avg_calories_burned": 300,
  "total_weight_lifted_kg": 2500,
  "visits_per_month": 4,
  "tenure_days": 57,
  "gender_male": 1,
  "membership_type_quarterly": 0,
  "membership_type_yearly": 0,
  "favorite_exercise_cycling": 0,
  "favorite_exercise_deadlift": 0,
  "favorite_exercise_pullups": 0,
  "favorite_exercise_squats": 1,
  "favorite_exercise_treadmill": 0
}
```

**Response:**
```json
{
  "predictedLabel": 1,
  "churnProbability": 0.59,
  "churnProbabilityPct": "59.0%",
  "riskLevel": "MEDIUM",
  "riskColor": "#FFA502",
  "retentionStrategy": "Member engagement is weakening — proactive outreach recommended.",
  "actionItems": [
    "📱 Send personalized WhatsApp/SMS re-engagement reminder",
    "🎽 Invite to upcoming group classes",
    "🏆 Enroll in monthly fitness challenge"
  ]
}
```

---

## 🛠️ Technology Stack
- **Machine Learning**: Python 3.10+, Scikit-Learn, ONNX Runtime (`skl2onnx`)
- **Backend Framework**: Java 17, Spring Boot 3.2, ONNX Runtime Java API
- **Frontend Framework**: React 18, Vite 5, Vanilla CSS Glassmorphism
