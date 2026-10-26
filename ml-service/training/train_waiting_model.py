"""
Train an XGBoost Regressor to predict waiting_time_minutes on the
SYNTHETIC operational dataset (5 simulated hospitals, H001-H005).

This model predicts wait times FROM HISTORICAL PATTERNS in the synthetic
data. It is deliberately kept separate from the Phase 13 queueing-theory
simulator, which computes expected behavior from first principles for
hypothetical scenarios that never occurred in this data - the two are not
interchangeable, per the Phase 0 architecture.

Splits by hospital_id-stratified random split (80/20) - a plain random
split is appropriate here (unlike the clinical data) because there is no
patient-identity leakage risk in this dataset; each row is an independent
hourly operational snapshot.

Saves:
  ml-service/models/xgboost_waiting_time.joblib
  ml-service/models/waiting_time_metrics.json

Run from ml-service/:
    python training/train_waiting_model.py
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

try:
    from xgboost import XGBRegressor

    MODEL_NAME = "xgboost"
except ImportError:
    from sklearn.ensemble import RandomForestRegressor

    MODEL_NAME = "random_forest"

DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "processed" / "operational" / "operational_model_ready.csv"
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

NUMERIC_FEATURES = [
    "patient_arrivals", "doctors_available", "total_beds", "beds_available",
    "bed_occupancy", "queue_length", "doctor_utilization", "diagnostic_utilization",
    "hospital_load", "hour_sin", "hour_cos", "day_of_week_sin", "day_of_week_cos",
]
CATEGORICAL_FEATURES = ["hospital_id"]
ALL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES
TARGET = "waiting_time_minutes"
RANDOM_SEED = 42


def build_preprocessor():
    return ColumnTransformer(
        transformers=[("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES)],
        remainder="passthrough",
    )


def train():
    df = pd.read_csv(DATA_PATH)
    X = df[ALL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED
    )

    model = (
        XGBRegressor(
            n_estimators=300, max_depth=5, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, random_state=RANDOM_SEED,
            objective="reg:squarederror",
        )
        if MODEL_NAME == "xgboost"
        else RandomForestRegressor(
            n_estimators=300,
            min_samples_leaf=2,
            random_state=RANDOM_SEED,
            n_jobs=-1,
        )
    )
    pipeline = Pipeline([
        ("preprocess", build_preprocessor()),
        ("model", model),
    ])
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = r2_score(y_test, y_pred)

    # Feature importance
    ohe = pipeline.named_steps["preprocess"].named_transformers_["cat"]
    cat_names = list(ohe.get_feature_names_out(CATEGORICAL_FEATURES))
    all_names = cat_names + NUMERIC_FEATURES
    importances = pipeline.named_steps["model"].feature_importances_
    top_features = sorted(zip(all_names, importances), key=lambda x: -x[1])[:10]

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODELS_DIR / "xgboost_waiting_time.joblib")

    metrics_output = {
        "model_name": MODEL_NAME,
        "model_version": f"operational_waiting_time_{MODEL_NAME}_v1",
        "dataset_description": (
            "SYNTHETIC Operational Dataset - 5 simulated hospitals (H001-H005), "
            "10,000 hourly snapshots. Not real hospital telemetry."
        ),
        "dataset_size": len(df),
        "train_size": len(X_train),
        "test_size": len(X_test),
        "target": TARGET,
        "features": ALL_FEATURES,
        "mae_minutes": round(float(mae), 2),
        "rmse_minutes": round(rmse, 2),
        "r2_score": round(float(r2), 4),
        "target_stats": {
            "mean_minutes": round(float(y.mean()), 2),
            "std_minutes": round(float(y.std()), 2),
        },
        "top_10_feature_importances": [
            {"feature": f, "importance": round(float(i), 4)} for f, i in top_features
        ],
        "scope_limitation": (
            "This model is trained on and only applicable to the 5 simulated hospitals "
            "(H001-H005). For the ~30,268 real hospitals with no operational data mapped, "
            "the recommendation engine must show 'waiting time unavailable', never a "
            "fabricated prediction from this model."
        ),
    }

    with open(MODELS_DIR / "waiting_time_metrics.json", "w") as f:
        json.dump(metrics_output, f, indent=2)

    return metrics_output


if __name__ == "__main__":
    result = train()
    print(json.dumps(result, indent=2))
