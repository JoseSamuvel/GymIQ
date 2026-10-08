"""
Smart Fitness Member Churn & Retention Prediction
=================================================
Training Pipeline: Random Forest â†’ ONNX Export
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.preprocessing import StandardScaler
import json, os, warnings
warnings.filterwarnings("ignore")

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 1. Load Cleaned Dataset
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("=" * 60)
print("  SMART GYM CHURN PREDICTION â€” TRAINING PIPELINE")
print("=" * 60)

df = pd.read_csv("cleaned_gym_members.csv")
print(f"\nâœ“ Loaded dataset: {df.shape[0]} members, {df.shape[1]} features")
print(f"  Churn distribution:\n{df['Churn'].value_counts().to_string()}")
print(f"  Churn rate: {df['Churn'].mean()*100:.1f}%")

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 2. Feature / Target Split
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
FEATURE_COLS = [
    "Age", "Avg_Workout_Duration_Min", "Avg_Calories_Burned",
    "Total_Weight_Lifted_kg", "Visits_Per_Month", "Tenure_Days",
    "Gender_Male", "Membership_Type_Quarterly", "Membership_Type_Yearly",
    "Favorite_Exercise_Cycling", "Favorite_Exercise_Deadlift",
    "Favorite_Exercise_Pull-ups", "Favorite_Exercise_Squats",
    "Favorite_Exercise_Treadmill"
]

X = df[FEATURE_COLS].astype(np.float32)
y = df["Churn"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"\nâœ“ Train / Test split: {len(X_train)} / {len(X_test)}")

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 3. Train Random Forest Classifier
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\nâ–¶ Training RandomForestClassifier (n_estimators=200, class_weight='balanced')â€¦")
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=None,
    min_samples_split=2,
    class_weight="balanced",
    random_state=42,
    n_jobs=-1
)
rf.fit(X_train, y_train)
print("âœ“ Training complete.")

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 4. Evaluation
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
y_pred  = rf.predict(X_test)
y_proba = rf.predict_proba(X_test)[:, 1]

print("\n" + "â”€" * 60)
print("  CLASSIFICATION REPORT")
print("â”€" * 60)
print(classification_report(y_test, y_pred, target_names=["Retained (0)", "Churned (1)"]))
print(f"  ROC-AUC Score : {roc_auc_score(y_test, y_proba):.4f}")
print("â”€" * 60)

print("\n  CONFUSION MATRIX")
cm = confusion_matrix(y_test, y_pred)
print(f"  TN={cm[0,0]}  FP={cm[0,1]}")
print(f"  FN={cm[1,0]}  TP={cm[1,1]}")

# Feature importances
importances = pd.Series(rf.feature_importances_, index=FEATURE_COLS)
print("\n  TOP-5 MOST IMPORTANT FEATURES")
print(importances.nlargest(5).to_string())
print("â”€" * 60)

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 5. Export to ONNX
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
try:
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType

    initial_type = [("float_input", FloatTensorType([None, len(FEATURE_COLS)]))]
    onnx_model = convert_sklearn(rf, initial_types=initial_type, target_opset=17)

    onnx_path = "churn_model.onnx"
    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    print(f"\nâœ“ ONNX model exported â†’ {onnx_path}")

    # Verify with onnxruntime
    import onnxruntime as rt
    sess = rt.InferenceSession(onnx_path)
    sample = X_test.iloc[:1].values.astype(np.float32)
    result = sess.run(None, {"float_input": sample})
    print(f"  ONNX inference check passed â€” sample churn prob: {result[1][0][1]:.4f}")

except ImportError as e:
    print(f"\nâš  ONNX export skipped (missing library): {e}")
    print("  Install with: pip install skl2onnx onnxruntime")

# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
# 6. Save Feature Metadata (for Java side)
# â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
meta = {
    "feature_columns": FEATURE_COLS,
    "num_features": len(FEATURE_COLS),
    "model_type": "RandomForestClassifier",
    "risk_thresholds": {
        "high": 0.70,
        "medium": 0.40,
        "low": 0.0
    },
    "churn_rate_pct": round(df["Churn"].mean() * 100, 1),
    "retained_avg_visits": round(df[df["Churn"]==0]["Visits_Per_Month"].mean(), 1),
    "churned_avg_visits":  round(df[df["Churn"]==1]["Visits_Per_Month"].mean(), 1)
}
with open("model_metadata.json", "w") as f:
    json.dump(meta, f, indent=2)
print(f"\nâœ“ Metadata saved â†’ model_metadata.json")
print("\nâœ…  Pipeline complete. Ready for Java runtime integration.\n")

